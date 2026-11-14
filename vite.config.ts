import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Lido do .env sem o prefixo VITE_, para o endereço do backend não ir para o código do browser
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      // Imports de outra pasta com o alias @/ (ex.: import { api } from "@/api/client")
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    server: {
      port: 5173,
      strictPort: true,
      // Pedidos a /api são reencaminhados para o backend (evita CORS em desenvolvimento)
      proxy: {
        "/api": {
          target: env.BACKEND_URL || "http://localhost:5041",
          changeOrigin: true,
        },
      },
    },
  };
});
