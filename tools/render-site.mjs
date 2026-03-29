import fs from "fs-extra";
import path from "node:path";
import process from "node:process";
import ejs from "ejs";

const rootDir = process.cwd();
const generatedDir = path.join(rootDir, "web", "src", "content", "generated");
const distDir = path.join(rootDir, "web", "dist");
const templatesDir = path.join(rootDir, "tools", "templates");
const templatePath = path.join(templatesDir, "index.ejs");

async function readJson(fileName) {
  return fs.readJson(path.join(generatedDir, fileName));
}

async function copyTemplateAsset(fileName) {
  const sourcePath = path.join(templatesDir, fileName);
  const targetPath = path.join(distDir, fileName);

  if (await fs.pathExists(sourcePath)) {
    await fs.copy(sourcePath, targetPath);
  }
}

async function main() {
  const [site, sections, gallery, characters] = await Promise.all([
    readJson("site.json"),
    readJson("sections.json"),
    readJson("gallery.json"),
    readJson("characters.json"),
  ]);

  const template = await fs.readFile(templatePath, "utf8");

  const html = ejs.render(template, {
    site,
    sections,
    gallery,
    characters,
  });

  await fs.ensureDir(distDir);
  await fs.writeFile(path.join(distDir, "index.html"), html, "utf8");

  await copyTemplateAsset("site.css");
  await copyTemplateAsset("site.js");
  await copyTemplateAsset("favicon.png");

  console.log("index.html generated successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
