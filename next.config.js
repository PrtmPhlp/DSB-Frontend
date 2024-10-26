/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
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
