import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "META — Igreja",
    short_name: "META",
    description:
      "Aplicativo oficial da Igreja META. Conecte-se, ore, contribua e participe dos eventos.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#d4a017",
    orientation: "portrait-primary",
    categories: ["lifestyle", "social"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
