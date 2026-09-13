import type { MetadataRoute } from "next";

// PWA manifest (texnik topshiriq 3.4-band): smart ekranga "ilova" sifatida
// o'rnatib qo'yish uchun. Ikonkalar app/icons/[o'lcham]/route.tsx orqali
// runtime'da generatsiya qilinadi (alohida rasm fayli tayyorlash shart emas).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Odil School",
    short_name: "Odil School",
    description: "Odil School — o'quv va baholash platformasi",
    start_url: "/",
    display: "standalone",
    orientation: "landscape",
    background_color: "#ffffff",
    theme_color: "#171717",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
