/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }, // à restreindre au domaine de ton CDN en production
    ],
  },
};

module.exports = nextConfig;
