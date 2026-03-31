import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;
        `,
      },
    },
  },
});
