const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl
  ? supabaseUrl.replace(/^https?:\/\//, "")
  : null;
const extraImageHostnames = process.env.NEXT_IMAGE_REMOTE_HOSTNAMES
  ? process.env.NEXT_IMAGE_REMOTE_HOSTNAMES.split(",")
      .map((hostname) => hostname.trim())
      .filter(Boolean)
  : [];

  const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    deviceSizes: [320, 375, 414, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https",
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/pet-gallery/**",
            },
          ]
        : []),
      ...extraImageHostnames.map((hostname) => ({
        protocol: "https",
        hostname,
        pathname: "/**",
      })),
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

if (!supabaseHostname) {
  // eslint-disable-next-line no-console
  console.warn(
    "NEXT_PUBLIC_SUPABASE_URL is not configured; Supabase storage images will be disabled."
  );
}

module.exports = withBundleAnalyzer(nextConfig);