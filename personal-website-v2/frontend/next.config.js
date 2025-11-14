/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true, // For static export to S3
    domains: ['edsonzandamela.com', 'localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_CALENDAR_LINK: process.env.NEXT_PUBLIC_CALENDAR_LINK || '',
    NEXT_PUBLIC_RESUME_PDF: process.env.NEXT_PUBLIC_RESUME_PDF || '/resume.pdf',
  },
  // Enable static export for S3 fallback
  output: 'export',
  distDir: 'out',
}

module.exports = nextConfig
