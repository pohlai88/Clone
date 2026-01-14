import { defineConfig } from "eslint/config";
import { config as reactConfig } from "./react.js";

/**
 * A custom ESLint configuration for libraries that use Remix.
 */
export const config = defineConfig(reactConfig);
