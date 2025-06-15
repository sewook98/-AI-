/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY, // 👈 이 줄 추가!
  },
};

module.exports = nextConfig;
