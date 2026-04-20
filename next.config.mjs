/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supabase image domains om vi behöver visa avatarer etc senare
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
