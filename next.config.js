/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... andere Konfigurationen
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        punycode: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
