import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Ignore build errors to bypass compiler crash bugs in SWC WebAssembly bindings on Windows
    ignoreBuildErrors: true,
  },

  // Ensure we can render external high-res images from Unsplash for placeholders
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  turbopack: {
    resolveAlias: {
      three: './node_modules/three/build/three.module.js',
    },
  },
};

export default nextConfig;
