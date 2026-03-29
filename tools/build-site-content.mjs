import fs from "fs-extra";
import path from "node:path";
import process from "node:process";
import MarkdownIt from "markdown-it";
import sharp from "sharp";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const rootDir = process.cwd();
const manifestPath = path.join(rootDir, "tools", "site-manifest.json");
const outputDir = path.join(rootDir, "web", "src", "content", "generated");
const assetsDir = path.join(rootDir, "web", "dist", "assets");

function normalizeSlashes(value) {
  return value.replace(/\\/g, "/");
}

function normalizeSmartQuotes(source) {
  return source
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/‘/g, "'")
    .replace(/’/g, "'");
}

function cleanMarkdown(source) {
  return (
    source
      // remove anchor tags like <a id="top"></a>
      .replace(/<a\s+id="[^"]*"><\/a>/gi, "")

      // remove navigation lines (← Back, ↑ Top)
      .replace(/^←.*$/gm, "")
      .replace(/^↑.*$/gm, "")

      // remove lines starting with →
      .replace(/^→.*$/gm, "")

      // remove markdown links to .md but keep text
      .replace(/\[([^\]]+)\]\([^)]+\.md\)/gi, "$1")

      // collapse multiple empty lines
      .replace(/\n{3,}/g, "\n\n")

      .trim()
  );
}

function shiftHeadings(html) {
  return html
    .replace(/<h5([^>]*)>/gi, "<h6$1>")
    .replace(/<\/h5>/gi, "</h6>")
    .replace(/<h4([^>]*)>/gi, "<h5$1>")
    .replace(/<\/h4>/gi, "</h5>")
    .replace(/<h3([^>]*)>/gi, "<h4$1>")
    .replace(/<\/h3>/gi, "</h4>")
    .replace(/<h2([^>]*)>/gi, "<h3$1>")
    .replace(/<\/h2>/gi, "</h3>")
    .replace(/<h1([^>]*)>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>");
}

function resolveDocRelativePath(docRelPath, assetPath) {
  const docDir = path.dirname(docRelPath);
  return normalizeSlashes(path.normalize(path.join(docDir, assetPath)));
}

function isExternalPath(value) {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("//")
  );
}

function shouldConvertPngToJpg(relPath) {
  const normalized = normalizeSlashes(relPath).toLowerCase();

  if (normalized.includes("/logo/")) {
    return false;
  }

  return true;
}

async function copyAsset(relPath) {
  const normalizedRelPath = normalizeSlashes(relPath);
  const sourcePath = path.join(rootDir, normalizedRelPath);
  const ext = path.extname(normalizedRelPath).toLowerCase();

  const convertToJpg =
    ext === ".png" && shouldConvertPngToJpg(normalizedRelPath);

  const outputRelPath = convertToJpg
    ? normalizedRelPath.slice(0, -ext.length) + ".jpg"
    : normalizedRelPath;

  const targetPath = path.join(assetsDir, outputRelPath);

  await fs.ensureDir(path.dirname(targetPath));

  if (convertToJpg) {
    await sharp(sourcePath)
      .flatten({ background: "#0b0b0f" })
      .jpeg({
        quality: 85,
        mozjpeg: true,
      })
      .toFile(targetPath);
  } else {
    await fs.copy(sourcePath, targetPath);
  }

  return `/assets/${normalizeSlashes(outputRelPath)}`;
}

async function rewriteMarkdownImagePaths(source, docRelPath) {
  const imageMatches = [...source.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
  const replacements = new Map();

  for (const match of imageMatches) {
    const originalPath = match[2].trim();

    if (isExternalPath(originalPath)) {
      continue;
    }

    const resolvedRelPath = resolveDocRelativePath(docRelPath, originalPath);
    const publicPath = await copyAsset(resolvedRelPath);

    replacements.set(match[0], `![${match[1]}](${publicPath})`);
  }

  let result = source;

  for (const [from, to] of replacements.entries()) {
    result = result.replace(from, to);
  }

  return result;
}

async function rewriteHtmlImagePaths(source, docRelPath) {
  const matches = [...source.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)];
  const replacements = new Map();

  for (const match of matches) {
    const originalSrc = match[1].trim();

    if (isExternalPath(originalSrc) || originalSrc.startsWith("/assets/")) {
      continue;
    }

    const resolvedRelPath = resolveDocRelativePath(docRelPath, originalSrc);
    const publicPath = await copyAsset(resolvedRelPath);

    replacements.set(originalSrc, publicPath);
  }

  let result = source;

  for (const [from, to] of replacements.entries()) {
    const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(
      new RegExp(`(<img\\b[^>]*\\bsrc=")${escapedFrom}(")`, "gi"),
      `$1${to}$2`,
    );
  }

  return result;
}

function removeMarkdownFileLinks(html) {
  return html
    .replace(/<a\s+href="[^"]+\.md"[^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/<a\s+href="#top"[^>]*>(.*?)<\/a>/gi, "$1");
}

async function readManifest() {
  return fs.readJson(manifestPath);
}

async function renderMarkdown(docRelPath) {
  const absPath = path.join(rootDir, docRelPath);
  const raw = await fs.readFile(absPath, "utf8");

  let prepared = normalizeSmartQuotes(raw);
  prepared = cleanMarkdown(prepared);
  prepared = await rewriteMarkdownImagePaths(prepared, docRelPath);
  prepared = await rewriteHtmlImagePaths(prepared, docRelPath);

  let html = md.render(prepared);
  html = removeMarkdownFileLinks(html);
  html = shiftHeadings(html);

  return html;
}

async function buildSections(manifest) {
  const result = {};

  for (const [key, relPath] of Object.entries(manifest.sections)) {
    result[key] = await renderMarkdown(relPath);
  }

  return result;
}

async function buildGallery(manifest) {
  const items = [];

  for (const relPath of manifest.gallery) {
    items.push(await copyAsset(relPath));
  }

  return items;
}

async function buildCharacters(manifest) {
  const characters = [];

  for (const item of manifest.characters) {
    const portrait = await copyAsset(item.portrait);

    const images = [];
    for (const imagePath of item.images) {
      images.push(await copyAsset(imagePath));
    }

    characters.push({
      id: item.id,
      name: item.name,
      role: item.role,
      bioHtml: await renderMarkdown(item.bio),
      portrait,
      images,
    });
  }

  return characters;
}

async function writeJson(fileName, value) {
  await fs.ensureDir(outputDir);
  await fs.writeJson(path.join(outputDir, fileName), value, { spaces: 2 });
}

async function main() {
  const manifest = await readManifest();

  await fs.ensureDir(outputDir);
  await fs.ensureDir(assetsDir);

  const site = manifest.site;
  const sections = await buildSections(manifest);
  const gallery = await buildGallery(manifest);
  const characters = await buildCharacters(manifest);

  await writeJson("site.json", site);
  await writeJson("sections.json", sections);
  await writeJson("gallery.json", gallery);
  await writeJson("characters.json", characters);

  console.log("Site content generated successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
