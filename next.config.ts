import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
    images: {
    domains: ['cdn.discordapp.com', 'tr.rbxcdn.com'],
  },
}

module.exports = nextConfig
export default nextConfig;
