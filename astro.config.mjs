import { defineConfig } from "astro/config";
import { iconTypegen } from "./integrations/icon-typegen";

// https://astro.build/config
export default defineConfig({
  integrations: [iconTypegen("svg")],
});
