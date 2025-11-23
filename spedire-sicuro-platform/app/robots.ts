import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/listini/', '/api/', '/login', '/register'],
    },
    sitemap: 'https://spediresicuro.com/sitemap.xml',
  }
}
