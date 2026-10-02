import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const schema = `
create role anon; create role authenticated; create role service_role;
create schema auth;
create function auth.role() returns text language sql as $$ select current_setting('request.jwt.claim.role',true) $$;
select set_config('request.jwt.claim.role','service_role',false);
create table profiles(id uuid primary key, email text, plan text check(plan in ('free','paid')),
 plan_type text, coupon_used boolean default false, coupon_code text, total_usage integer default 0,
 daily_usage integer default 0, last_usage_date date);
create table subscriptions(id uuid default gen_random_uuid() primary key, user_id uuid unique references profiles(id),
 status text check(status in ('active','cancelled','expired','pending','payment_failed')), plan_id text,plan_name text,
 plan_type text,price integer,started_at timestamptz,next_billing_at timestamptz,payment_key text,order_id text,
 customer_key text,billing_key text,retry_count integer,cancelled_at timestamptz,discount_percent integer,
 coupon_code text,updated_at timestamptz,card_company text,card_number text);
create table coupons(id uuid default gen_random_uuid() primary key,code text unique,user_id uuid,
 target_plan text,duration_days integer,status text,redemption_deadline timestamptz,
 max_uses integer,used_count integer,used_at timestamptz,expires_at timestamptz);
create table coupon_redemptions(id uuid default gen_random_uuid(),coupon_id uuid references coupons(id),
 user_id uuid references profiles(id),unique(coupon_id,user_id));
`;
const migration = await readFile(new URL('../supabase/migrations/20261003_atomic_coupon_and_usage.sql', import.meta.url),'utf8');
const uid = n => `00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
async function setup() { const db=new PGlite(); await db.exec(schema);await db.exec(migration);for(let n=1;n<=8;n++)await db.query("insert into profiles(id,email,plan) values($1,$2,'free')",[uid(n),`test${n}@example.test`]);return db; }
async function call(db,name,...params) { return (await db.query(`select ${name}(${params.map((_,i)=>'$'+(i+1)).join(',')}) as result`,params)).rows[0].result; }
async function coupon(db,code,max=1){await db.query("insert into coupons(code,target_plan,duration_days,status,max_uses,used_count) values($1,'pro_reels',30,'issued',$2,0)",[code,max]);}

test('coupon grant is all-or-nothing and preserves existing payments', async () => {
 const db=await setup();try {
  await coupon(db,'SINGLE');
  assert.equal((await call(db,'redeem_coupon_atomic',uid(1),' single ')).success,true);
  assert.equal((await db.query('select plan from profiles where id=$1',[uid(1)])).rows[0].plan,'paid');
  assert.equal((await db.query('select price,payment_key from subscriptions where user_id=$1',[uid(1)])).rows[0].payment_key,'coupon_grant');
  assert.equal((await call(db,'redeem_coupon_atomic',uid(1),'SINGLE')).status,400);
  assert.equal((await call(db,'redeem_coupon_atomic',uid(2),'SINGLE')).status,403);

  await coupon(db,'SHARED',2);
  assert.equal((await call(db,'redeem_coupon_atomic',uid(2),'SHARED')).success,true);
  assert.equal((await call(db,'redeem_coupon_atomic',uid(2),'SHARED')).status,400);
  assert.equal((await call(db,'redeem_coupon_atomic',uid(3),'SHARED')).success,true);
  assert.equal((await call(db,'redeem_coupon_atomic',uid(4),'SHARED')).status,400);
  assert.equal((await db.query("select used_count from coupons where code='SHARED'")).rows[0].used_count,2);

  await coupon(db,'ROLLBACK',2);
  await db.exec("alter table coupon_redemptions add constraint injected_failure check (false) not valid");
  await assert.rejects(call(db,'redeem_coupon_atomic',uid(4),'ROLLBACK'));
  assert.equal((await db.query('select plan from profiles where id=$1',[uid(4)])).rows[0].plan,'free');
  assert.equal((await db.query('select count(*)::int as n from subscriptions where user_id=$1',[uid(4)])).rows[0].n,0);
  assert.equal((await db.query("select used_count from coupons where code='ROLLBACK'")).rows[0].used_count,0);
  await db.exec('alter table coupon_redemptions drop constraint injected_failure');

  await coupon(db,'PAID');
  await db.query("insert into subscriptions(user_id,status,price,plan_id,billing_key,next_billing_at) values($1,'active',12900,'pro_permanent','keep-me',now()+interval '10 days')",[uid(5)]);
  assert.equal((await call(db,'redeem_coupon_atomic',uid(5),'PAID')).status,409);
  assert.equal((await db.query('select billing_key from subscriptions where user_id=$1',[uid(5)])).rows[0].billing_key,'keep-me');
  assert.equal((await db.query("select status from coupons where code='PAID'")).rows[0].status,'issued');

  await coupon(db,'REPLACE');
  await db.query("insert into subscriptions(user_id,status,price,billing_key,retry_count) values($1,'payment_failed',12900,'stale',3)",[uid(6)]);
  assert.equal((await call(db,'redeem_coupon_atomic',uid(6),'REPLACE')).success,true);
  const replaced=(await db.query('select billing_key,retry_count,price from subscriptions where user_id=$1',[uid(6)])).rows[0];
  assert.deepEqual(replaced,{billing_key:null,retry_count:0,price:0});

  await coupon(db,'EXPIRED');await db.exec("update coupons set redemption_deadline=now()-interval '1 day' where code='EXPIRED'");
  assert.equal((await call(db,'redeem_coupon_atomic',uid(7),'EXPIRED')).status,400);
  assert.equal((await db.query('select plan from profiles where id=$1',[uid(7)])).rows[0].plan,'free');
 } finally {await db.close();}
});

test('preflight does not consume quota; only three completions are accepted',async()=>{
 const db=await setup();try{
  for(let i=0;i<5;i++)assert.equal((await call(db,'blog_usage_atomic',uid(1),false)).remaining,3);
  assert.equal((await db.query('select total_usage from profiles where id=$1',[uid(1)])).rows[0].total_usage,0);
  const results=await Promise.all(Array.from({length:5},()=>call(db,'blog_usage_atomic',uid(1),true)));
  assert.equal(results.filter(r=>r.allowed).length,3);
  assert.equal((await db.query('select total_usage from profiles where id=$1',[uid(1)])).rows[0].total_usage,3);
  assert.equal((await call(db,'blog_usage_atomic',uid(1),false)).allowed,false);
  await db.query("update profiles set plan='paid' where id=$1",[uid(2)]);
  assert.equal((await call(db,'blog_usage_atomic',uid(2),true)).remaining,-1);
  await db.query("update profiles set plan='paid',total_usage=3 where id=$1",[uid(3)]);
  await db.query("insert into subscriptions(user_id,status,plan_id,payment_key,next_billing_at,price) values($1,'active','pro_reels','coupon_grant',now()-interval '1 day',0)",[uid(3)]);
  assert.equal((await call(db,'blog_usage_atomic',uid(3),false)).allowed,false);
  await db.exec("select set_config('request.jwt.claim.role','authenticated',false)");
  await assert.rejects(call(db,'blog_usage_atomic',uid(2),true),/Unauthorized/);
 }finally{await db.close();}
});
