const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl
  ? supabaseUrl.replace(/^https?:\/\//, "")
  : null;

  const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/pet-gallery/**",
          },
        ]
      : [],
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