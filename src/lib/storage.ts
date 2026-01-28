import { createClient } from '@/lib/supabase/client';

export type HistoryItem = {
  id: string;
  createdAt: string;
  keyword: string;
  businessCategory: string;
  topic: string;
  purpose: string;
  content: string;
};

export type AppSettings = {
  defaultBusinessCategory: string | null;
  keywordPresets: string[];
};

// 블덱스 지수 체계: 최적 3~1, 준최 7~0
export type BlogIndexLevel =
  | 'optimal3' | 'optimal2' | 'optimal1'  // 최적화
  | 'sub7' | 'sub6' | 'sub5' | 'sub4'     // 준최적화 상위
  | 'sub3' | 'sub2' | 'sub1' | 'sub0'     // 준최적화 하위
  | null;

export type UserProfile = {
  locationCity: string;
  locationDistrict: string;
  locationNeighborhood: string;
  blogUrl: string;
  blogIndexLevel: BlogIndexLevel;
  blogIndexCheckedAt: string | null;
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
  }));
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
  locationCity: '',
  locationDistrict: '',
  locationNeighborhood: '',
  blogUrl: '',
  blogIndexLevel: null,
  blogIndexCheckedAt: null,
};

export async function getProfile(userId: string): Promise<UserProfile> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('location_city, location_district, location_neighborhood, blog_url, blog_index_level, blog_index_checked_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return defaultProfile;
  }

  return {
    locationCity: data.location_city || '',
    locationDistrict: data.location_district || '',
    locationNeighborhood: data.location_neighborhood || '',
    blogUrl: data.blog_url || '',
    blogIndexLevel: data.blog_index_level as UserProfile['blogIndexLevel'],
    blogIndexCheckedAt: data.blog_index_checked_at,
  };
}

export async function saveProfile(userId: string, profile: Partial<UserProfile>) {
  const supabase = createClient();

  const updateData: Record<string, unknown> = {};
  if (profile.locationCity !== undefined) updateData.location_city = profile.locationCity;
  if (profile.locationDistrict !== undefined) updateData.location_district = profile.locationDistrict;
  if (profile.locationNeighborhood !== undefined) updateData.location_neighborhood = profile.locationNeighborhood;
  if (profile.blogUrl !== undefined) updateData.blog_url = profile.blogUrl;
  if (profile.blogIndexLevel !== undefined) updateData.blog_index_level = profile.blogIndexLevel;
  if (profile.blogIndexCheckedAt !== undefined) updateData.blog_index_checked_at = profile.blogIndexCheckedAt;

  await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);
}
