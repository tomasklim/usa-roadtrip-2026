import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the same build works at a domain root (Vercel) and under a
// repository subpath (GitHub Pages).
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { outDir: "dist", assetsDir: "assets", sourcemap: false }
});
