import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/write',
          '/history',
          '/settings',
          '/onboarding',
          '/subscribe',
          '/admin',
        ],
      },
    ],
    sitemap: 'https://www.blogwriter.co.kr/sitemap.xml',
  };
}
