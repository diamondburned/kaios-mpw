import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA as vitePWA } from "vite-plugin-pwa";
import webfontDownload from "vite-plugin-webfont-dl";
import sveltePreprocess from "svelte-preprocess";

import type * as vite from "vite";
import * as crypto from "crypto";
import * as path from "path";
import * as fs from "fs/promises";

import manifest from "./src/manifest.json";

export default defineConfig({
  plugins: [
    {
      name: "manifest-index",
      transformIndexHtml: {
        enforce: "pre",
        transform(html: string) {
          return html.replace(
            /{{\s*(.+)\s*}}/gi,
            // https://esbuild.github.io/content-types/#direct-eval
            (match, expr) =>
              new Function("manifest", `return ${expr}`)(manifest) || ""
          );
        },
      },
    },
    webfontDownload([
      "https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap",
    ]),
    vitePWA({
      manifest,
      registerType: "autoUpdate",
      // See:
      // https://vite-pwa-org.netlify.app/workbox/generate-sw.html
      // https://vite-pwa-org.netlify.app/workbox/inject-manifest.html
      strategies: "generateSW",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png}"],
      },
      devOptions: {
        enabled: true,
      },
    }),
    svelte({
      preprocess: sveltePreprocess(),
    }),
  ],
  worker: {
    format: "iife",
  },
  root: path.resolve(__dirname, "src"),
  envPrefix: "APP_",
  publicDir: "../public",
  server: {
    port: 5000,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  // https://github.com/vitejs/vite/issues/7385#issuecomment-1286606298
  resolve: {
    alias: {
      "#": path.resolve(__dirname, "./src/"),
    },
  },
});

async function hash(filename: string): Promise<string> {
  const file = await fs.readFile(filename);
  const hash = crypto.createHash("sha256");
  hash.update(file);
  return hash.digest("base64");
}
