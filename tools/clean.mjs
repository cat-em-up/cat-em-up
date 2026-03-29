import fs from "fs-extra";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();

const distDir = path.join(rootDir, "web", "dist");
const generatedDir = path.join(rootDir, "web", "src", "content", "generated");

async function main() {
  await fs.remove(distDir);
  await fs.remove(generatedDir);

  console.log("Clean completed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
