/* Resolves the tsconfig "@/*" path alias, and the extensionless TS specifiers
   Next allows, for plain `node` runs (tests). */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function withExtension(absPath) {
  if (existsSync(absPath) && !absPath.endsWith("/")) return absPath;
  for (const candidate of [
    `${absPath}.ts`,
    `${absPath}.tsx`,
    join(absPath, "index.ts"),
    join(absPath, "index.tsx"),
  ]) {
    if (existsSync(candidate)) return candidate;
  }
  return absPath;
}

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const abs = withExtension(join(root, specifier.slice(2)));
    return nextResolve(pathToFileURL(abs).href, context);
  }
  // Relative specifiers inside .ts files may also omit the extension.
  if (specifier.startsWith(".") && context.parentURL?.endsWith(".ts")) {
    const abs = withExtension(join(dirname(fileURLToPath(context.parentURL)), specifier));
    if (existsSync(abs)) return nextResolve(pathToFileURL(abs).href, context);
  }
  return nextResolve(specifier, context);
}
