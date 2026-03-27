/**
 * Post-codegen: replace graphql-codegen client preset's `?? {}` fallback with a throw
 * so Apollo never sends an empty document (which can produce invalid GraphQL text).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gqlPath = path.join(__dirname, "../src/gql/gql.ts");
let s = fs.readFileSync(gqlPath, "utf8");

const oldBlock = `export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}`;

const newBlock = `export function graphql(source: string) {
  const doc = (documents as Record<string, unknown>)[source];
  if (!doc) {
    throw new Error(
      "graphql(): document not found. Run npm run codegen in dashboard_v2 after editing GraphQL operations.",
    );
  }
  return doc;
}`;

if (!s.includes(oldBlock)) {
  console.error(
    "strict-graphql-function: expected graphql() implementation not found; update this script if codegen output changed.",
  );
  process.exit(1);
}

s = s.replace(oldBlock, newBlock);
fs.writeFileSync(gqlPath, s);
console.log("strict-graphql-function: patched gql.ts");
