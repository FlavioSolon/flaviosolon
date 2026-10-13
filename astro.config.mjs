import { defineConfig } from "astro/config"
import svelte from "@astrojs/svelte"
import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

// Astro 7.3.5 Configuration with Svelte 5 and Sharp image service
export default defineConfig({
  site: "https://flaviosolon.com",
  output: "static",
  integrations: [
    svelte(),
    sitemap({
      filter: (page) => !page.includes("/admin") && !page.includes("/api"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "./src"),
      },
    },
    server: {
      watch: {
        ignored: ["**/.git/**", "**/node_modules/**"],
      },
    },
  },
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
    remotePatterns: [{ protocol: "https" }],
  },
  server: {
    host: process.env.FIGMA_DEV_SERVER_HOST || "0.0.0.0",
    port: parseInt(process.env.PORT || "8443", 10),
  },
})
