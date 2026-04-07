import { createClient } from '@/lib/supabase/client';

export type HistoryItem = {
  id: string;
  createdAt: string;
  keyword: string;
  businessCategory: string;
  topic: string;
  purpose: string;
  content: string;
  blogUrl: string;
  blogUrlSubmittedAt: string | null;
  naverRank: number | null;       // VIEW 탭: null=미확인, 0=30위밖, 1~30=순위
  naverBlogRank: number | null;   // 블로그 탭: null=미확인, 0=30위밖, 1~30=순위
  rankCheckedAt: string | null;
};

export type AppSettings = {
  defaultBusinessCategory: string | null;
  keywordPresets: string[];
};

// 블라이 지수 체계: 최적 3~1, 준최 7~0
export type BlogIndexLevel =
  | 'optimal3' | 'optimal2' | 'optimal1'  // 최적화
  | 'sub7' | 'sub6' | 'sub5' | 'sub4'     // 준최적화 상위
  | 'sub3' | 'sub2' | 'sub1' | 'sub0'     // 준최적화 하위
  | null;

export type UserProfile = {
  name: string;
  businessName: string;
  locationCity: string;
  locationDistrict: string;
  locationNeighborhood: string;
  blogUrl: string;
  blogIndexLevel: BlogIndexLevel;
  blogIndexCheckedAt: string | null;
  shopAddress: string;
  shopHours: string;
  shopPhone: string;
  shopParking: string;
  plan_type?: string | null;
  // 원장님 스토리 Q&A
  storyMotivation: string;    // 이 일을 시작하게 된 계기
  storyPriority: string;      // 시술할 때 가장 중요하게 생각하는 것
  storyMessage: string;       // 고객에게 꼭 해주고 싶은 말
  storyDifference: string;    // 다른 샵과 다른 점
  storyReward: string;        // 가장 보람 느끼는 순간
};

// --- History ---

export async function saveHistory(
  item: Omit<HistoryItem, 'id' | 'createdAt'>,
  userId: string,
): Promise<HistoryItem | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('histories')
    .insert({
      user_id: userId,
      keyword: item.keyword,
      business_category: item.businessCategory,
      topic: item.topic,
      purpose: item.purpose,
      content: item.content,
    })
    .select()
    .single();

  if (error) {
    console.error('Save history error:', error);
    return null;
  }

  return {
    id: data.id,
    createdAt: data.created_at,
    keyword: data.keyword,
    businessCategory: data.business_category || '',
    topic: data.topic || '',
    purpose: data.purpose || '',
    content: data.content,
    blogUrl: data.blog_url || '',
    blogUrlSubmittedAt: data.blog_url_submitted_at || null,
    naverRank: data.naver_rank ?? null,
    naverBlogRank: data.naver_blog_rank ?? null,
    rankCheckedAt: data.rank_checked_at || null,
  };
}

export async function getAllHistory(userId: string): Promise<HistoryItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('histories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get history error:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    keyword: row.keyword,
    businessCategory: row.business_category || '',
    topic: row.topic || '',
    purpose: row.purpose || '',
    content: row.content,
    blogUrl: row.blog_url || '',
    blogUrlSubmittedAt: row.blog_url_submitted_at || null,
    naverRank: row.naver_rank ?? null,
    naverBlogRank: row.naver_blog_rank ?? null,
    rankCheckedAt: row.rank_checked_at || null,
  }));
}

export async function updateBlogUrl(id: string, blogUrl: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('histories')
    .update({
      blog_url: blogUrl,
      blog_url_submitted_at: new Date().toISOString(),
      naver_rank: null,        // URL 변경 시 순위 리셋
      naver_blog_rank: null,   // 블로그 탭 순위도 리셋
      rank_checked_at: null,   // 재확인 대기
    })
    .eq('id', id);

  if (error) {
    console.error('Update blog URL error:', error);
    return false;
  }
  return true;
}

export async function deleteHistory(id: string) {
  const supabase = createClient();
  await supabase.from('histories').delete().eq('id', id);
}

export async function clearAllHistory(userId: string) {
  const supabase = createClient();
  await supabase.from('histories').delete().eq('user_id', userId);
}

// --- Settings ---

const defaultSettings: AppSettings = {
  defaultBusinessCategory: null,
  keywordPresets: [],
};

export async function getSettings(userId: string): Promise<AppSettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return defaultSettings;
  }

  return {
    defaultBusinessCategory: data.default_business_category,
    keywordPresets: data.keyword_presets || [],
  };
}

export async function saveSettings(userId: string, settings: AppSettings) {
  const supabase = createClient();
  await supabase.from('settings').upsert({
    user_id: userId,
    default_business_category: settings.defaultBusinessCategory,
    keyword_presets: settings.keywordPresets,
  });
}

// --- Profile (지역 + 블로그 정보) ---

const defaultProfile: UserProfile = {
  name: '',
  businessName: '',
  locationCity: '',
  locationDistrict: '',
  locationNeighborhood: '',
  blogUrl: '',
  blogIndexLevel: null,
  blogIndexCheckedAt: null,
  shopAddress: '',
  shopHours: '',
  shopPhone: '',
  shopParking: '',
  storyMotivation: '',
  storyPriority: '',
  storyMessage: '',
  storyDifference: '',
  storyReward: '',
};

export async function getProfile(userId: string): Promise<UserProfile> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('name, business_name, location_city, location_district, location_neighborhood, blog_url, blog_index_level, blog_index_checked_at, shop_address, shop_hours, shop_phone, shop_parking, plan_type, story_motivation, story_priority, story_message, story_difference, story_reward')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return defaultProfile;
  }

  return {
    name: data.name || '',
    businessName: data.business_name || '',
    locationCity: data.location_city || '',
    locationDistrict: data.location_district || '',
    locationNeighborhood: data.location_neighborhood || '',
    blogUrl: data.blog_url || '',
    blogIndexLevel: data.blog_index_level as UserProfile['blogIndexLevel'],
    blogIndexCheckedAt: data.blog_index_checked_at,
    shopAddress: data.shop_address || '',
    shopHours: data.shop_hours || '',
    shopPhone: data.shop_phone || '',
    shopParking: data.shop_parking || '',
    plan_type: data.plan_type || null,
    storyMotivation: data.story_motivation || '',
    storyPriority: data.story_priority || '',
    storyMessage: data.story_message || '',
    storyDifference: data.story_difference || '',
    storyReward: data.story_reward || '',
  };
}

export async function saveProfile(userId: string, profile: Partial<UserProfile>): Promise<boolean> {
  const supabase = createClient();

  // 먼저 기존 프로필 조회
  const { data: existing, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // 프로필이 없으면 새로 생성
  if (selectError || !existing) {
    console.log('Profile not found, creating new profile for user:', userId);

    // 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();

    const insertData: Record<string, unknown> = {
      id: userId,
      email: user?.email || '',
      plan: 'free',
      daily_usage: 0,
    };

    // 프로필 데이터 추가
    if (profile.name !== undefined) insertData.name = profile.name;
    if (profile.businessName !== undefined) insertData.business_name = profile.businessName;
    if (profile.locationCity !== undefined) insertData.location_city = profile.locationCity;
    if (profile.locationDistrict !== undefined) insertData.location_district = profile.locationDistrict;
    if (profile.locationNeighborhood !== undefined) insertData.location_neighborhood = profile.locationNeighborhood;
    if (profile.blogUrl !== undefined) insertData.blog_url = profile.blogUrl;
    if (profile.blogIndexLevel !== undefined) insertData.blog_index_level = profile.blogIndexLevel;
    if (profile.blogIndexCheckedAt !== undefined) insertData.blog_index_checked_at = profile.blogIndexCheckedAt;
    if (profile.shopAddress !== undefined) insertData.shop_address = profile.shopAddress;
    if (profile.shopHours !== undefined) insertData.shop_hours = profile.shopHours;
    if (profile.shopPhone !== undefined) insertData.shop_phone = profile.shopPhone;
    if (profile.shopParking !== undefined) insertData.shop_parking = profile.shopParking;
    if (profile.storyMotivation !== undefined) insertData.story_motivation = profile.storyMotivation;
    if (profile.storyPriority !== undefined) insertData.story_priority = profile.storyPriority;
    if (profile.storyMessage !== undefined) insertData.story_message = profile.storyMessage;
    if (profile.storyDifference !== undefined) insertData.story_difference = profile.storyDifference;
    if (profile.storyReward !== undefined) insertData.story_reward = profile.storyReward;

    const { error: insertError } = await supabase
      .from('profiles')
      .insert(insertData);

    if (insertError) {
      console.error('Profile insert error:', insertError);
      return false;
    }
    return true;
  }

  // 기존 프로필 업데이트
  const updateData: Record<string, unknown> = {};
  if (profile.name !== undefined) updateData.name = profile.name;
  if (profile.businessName !== undefined) updateData.business_name = profile.businessName;
  if (profile.locationCity !== undefined) updateData.location_city = profile.locationCity;
  if (profile.locationDistrict !== undefined) updateData.location_district = profile.locationDistrict;
  if (profile.locationNeighborhood !== undefined) updateData.location_neighborhood = profile.locationNeighborhood;
  if (profile.blogUrl !== undefined) updateData.blog_url = profile.blogUrl;
  if (profile.blogIndexLevel !== undefined) updateData.blog_index_level = profile.blogIndexLevel;
  if (profile.blogIndexCheckedAt !== undefined) updateData.blog_index_checked_at = profile.blogIndexCheckedAt;
  if (profile.shopAddress !== undefined) updateData.shop_address = profile.shopAddress;
  if (profile.shopHours !== undefined) updateData.shop_hours = profile.shopHours;
  if (profile.shopPhone !== undefined) updateData.shop_phone = profile.shopPhone;
  if (profile.shopParking !== undefined) updateData.shop_parking = profile.shopParking;
  if (profile.storyMotivation !== undefined) updateData.story_motivation = profile.storyMotivation;
  if (profile.storyPriority !== undefined) updateData.story_priority = profile.storyPriority;
  if (profile.storyMessage !== undefined) updateData.story_message = profile.storyMessage;
  if (profile.storyDifference !== undefined) updateData.story_difference = profile.storyDifference;
  if (profile.storyReward !== undefined) updateData.story_reward = profile.storyReward;

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);

  if (updateError) {
    console.error('Profile update error:', updateError);
    return false;
  }
  return true;
}
