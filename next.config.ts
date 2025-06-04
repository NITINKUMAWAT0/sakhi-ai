/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@langchain/core'],
  },
  webpack: (config: { externals: { '@langchain/core': string; }[]; }, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      config.externals.push({
        '@langchain/core': 'commonjs @langchain/core',
      });
    }
    return config;
  },
};

module.exports = nextConfig;