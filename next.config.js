/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Enable React strict mode for improved error handling
  reactStrictMode: true,
  // Disable the X-Powered-By header to improve security
  poweredByHeader: false,
  // Enable image optimization via Next.js
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
