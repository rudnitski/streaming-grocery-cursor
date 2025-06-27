import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**/*",
      "src/.next/**/*",
      "build/**/*",
      "dist/**/*",
      "out/**/*",
      "*.config.js",
      "*.config.mjs",
      "next.config.js",
      "next.config.mjs"
    ]
  }
];

export default eslintConfig;
