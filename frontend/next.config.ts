import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.pokemondb.net',
        port: '',
        pathname: '/artwork/**',
        search: '',
      },
    ],
  },
  sassOptions: {
    includePaths: ['node_modules'],
    silenceDeprecations: ['legacy-js-api'],
  },
};

export default nextConfig;
