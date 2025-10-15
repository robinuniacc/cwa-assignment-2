import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { globalIgnores } from "eslint/config";
import { includeIgnoreFile } from "@eslint/compat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

const eslintConfig = [
  includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
  globalIgnores([
    "prisma/**/*",
    "src/app/escape-room/lambda-ready/node_modules/**/*",
  ]),
  ...compat.extends(
    "next",
    "next/typescript",
    "next/core-web-vitals",
    "prettier",
  ),
  eslintConfigPrettier,
];

export default eslintConfig;
