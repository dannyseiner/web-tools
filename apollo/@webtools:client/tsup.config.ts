import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    outDir: "dist",
    external: ["react", "react-dom"],
    noExternal: ["@webtools/error-kit", "@webtools/i18n", "@webtools/lists"],
    banner: {
      js: '"use client";',
    },
  },
  {
    entry: ["server.ts"],
    format: ["esm", "cjs"],
    dts: true,
    outDir: "dist",
    external: ["react", "fs", "path"],
    noExternal: ["@webtools/error-kit", "@webtools/i18n", "@webtools/lists"],
  },
]);
