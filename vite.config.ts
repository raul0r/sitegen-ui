import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

import { sitegenProxyPlugin } from "./server/sitegen-proxy";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      sitegenProxyPlugin({
        baseUrl: env.SITEGEN_API_BASE_URL || "http://127.0.0.1:8000",
        token: env.SITEGEN_API_TOKEN || "",
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
    },
    preview: {
      host: "0.0.0.0",
      port: 4173,
      strictPort: true,
    },
    envPrefix: ["VITE_"],
  };
});
