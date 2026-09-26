import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

export default defineConfig({
  output: "static",
  devToolbar: { enabled: false },
  integrations: [react(), mdx()],
  fonts: [
    {
      name: "Bricolage Grotesque",
      cssVariable: "--font-bricolage",
      provider: fontProviders.local(),
      options: {
        variants: [{
          src: ["./node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2"],
          weight: "200 800",
          style: "normal",
        }],
      },
    },
    {
      name: "Geist",
      cssVariable: "--font-geist",
      provider: fontProviders.local(),
      options: {
        variants: [{
          src: ["./node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2"],
          weight: "100 900",
          style: "normal",
        }],
      },
    },
  ],
  vite: {
    resolve: { dedupe: ["react", "react-dom"] },
  },
});
