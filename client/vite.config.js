const API_TARGET =
  process.env.NODE_ENV === "production"
    ? "https://restaurant-server-lnvl.onrender.com"
    : "http://localhost:5000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
});
