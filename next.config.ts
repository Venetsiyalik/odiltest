import type { NextConfig } from "next";

// Savol rasmlari Supabase Storage'dagi "savol-rasmlari" bucket'idan
// keladi — shu domendan next/image optimallashtirishi ruxsat etiladi
// (tezlik optimizatsiyasi, 7-bosqich). Materiallar rasmlari esa admin
// tomonidan kiritilgan ixtiyoriy tashqi URL bo'lgani uchun optimallashtirilmaydi.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
