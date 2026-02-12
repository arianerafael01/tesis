import createNextIntlPlugin from "next-intl/plugin";
import nextra from "nextra";

/** @type {import('next').NextConfig} */

const withNextIntl = createNextIntlPlugin();

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});
const nextConfig = {
  // TypeScript configuration
  typescript: {
    // Set to true to ignore type errors during build (NOT RECOMMENDED for production)
    // ignoreBuildErrors: false, // Default: false - fails build on type errors
  },
  
  // ESLint configuration
  eslint: {
    // Set to true to ignore ESLint errors during build (NOT RECOMMENDED for production)
    // ignoreDuringBuilds: false, // Default: false - fails build on lint errors
    
    // Specify directories to lint
    dirs: ['app', 'components', 'lib', 'hooks', 'providers', 'action'],
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.lorem.space",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "a0.muscache.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
};

export default withNextIntl(withNextra(nextConfig));
