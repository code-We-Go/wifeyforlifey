const path = require('path');
const os = require('os');
const fs = require('fs');

// Ensure SWC native binding cache avoids Windows DACL validation issue on AppData/Local
const swcCache = path.join(os.homedir(), '.swc-cache');
if (!fs.existsSync(swcCache)) {
  try {
    fs.mkdirSync(swcCache, { recursive: true });
  } catch (_) {}
}
process.env.SWC_NATIVE_BINDING_CACHE = swcCache;

const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["lh3.googleusercontent.com", "utfs.io", "res.cloudinary.com"],
  },
  async redirects() {
    return [
      {
        source: '/packagee/:slug*',
        destination: '/package/:slug*',
        permanent: true,
      },
      {
        source: '/:locale(ar|en)/packagee/:slug*',
        destination: '/:locale/package/:slug*',
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
