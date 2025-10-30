/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'trackercdn.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

