import type { MetadataRoute } from "next";

// Чтобы сайт можно было «установить» на телефон как приложение — с иконкой Katy
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Katy — парфюмерия и косметика",
    short_name: "Katy",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f6f1",
    theme_color: "#f9f6f1",
    lang: "ru",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
