import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";


export default defineConfig({

  plugins: [

    react(),

    tailwindcss(),

    VitePWA({

      registerType: "autoUpdate",

      manifest: {

        name: "Life100",

        short_name: "Life100",

        description:
          "Health Wealth Family Tracker",

        theme_color: "#111827",

        display: "standalone",

        icons: [

          {

            src: "/icon.png",

            sizes: "192x192",

            type: "image/png"

          }

        ]

      }

    })

  ]

})