import { defineConfig, loadEnv } from "vite";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  const pkg = readJsonFile("package.json");

  return { version: pkg.version.split("-")[0], ...manifest };
}

export default defineConfig((config) => {
  const env = loadEnv(config.mode, ".");

  return {
    plugins: [
      webExtension({
        manifest: generateManifest,
        watchFilePaths: ["package.json", "src/manifest.json"],
        browser: env.VITE_TARGET_BROWSER || "chrome",
        webExtConfig: {}
      })
    ],
    build: {
      minify: false,
      sourcemap: true,
      outDir: "dist",
      emptyOutDir: true
    },
    test: {
      environment: 'jsdom'
    },
    resolve: {
      alias: {
        src: "/src"
      }
    }
  };
});
