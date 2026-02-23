// next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // experimental block ကို လုံးဝ ဖယ်ရှားလိုက်ပါ
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
    ],
  },
};

export default nextConfig;
