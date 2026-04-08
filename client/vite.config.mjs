import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://restaurant-server-lnvl.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
