import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // Pedidos a /api são reencaminhados para o backend (evita CORS em desenvolvimento)
    proxy: {
      "/api": {
        target: "http://localhost:5041",
        changeOrigin: true,
      },
    },
  },
});
