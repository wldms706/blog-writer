import { getTopicsForBusiness } from '@/data/constants';

export function getNextTopics(business: string | null, current?: string | null) {
  return getTopicsForBusiness(business).filter(topic => topic.id !== current).slice(0, 3);
}

export function getPublishableText(content: string): string {
  return content.replace(/\[편집가이드:[^\]]*\]/g, '').replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, '\n\n').trim();
}

export function isNaverPostUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    if (!['https:', 'http:'].includes(url.protocol) || !['blog.naver.com', 'm.blog.naver.com'].includes(url.hostname) || url.username || url.password) return false;
    return /^\/[^/]+\/\d+$/.test(url.pathname)
      || (url.pathname === '/PostView.naver' && Boolean(url.searchParams.get('blogId')) && /^\d+$/.test(url.searchParams.get('logNo') || ''));
  } catch { return false; }
}
