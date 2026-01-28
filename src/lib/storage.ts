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
