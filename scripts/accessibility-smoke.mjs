import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const appDirectory = path.join(process.cwd(), "app");
const findings = [];

async function findPages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      pages.push(...await findPages(absolutePath));
      continue;
    }

    if (entry.isFile() && /^page\.(tsx|jsx)$/.test(entry.name)) {
      pages.push(absolutePath);
    }
  }

  return pages;
}

const pages = await findPages(appDirectory);

for (const page of pages) {
  const relativePath = path.relative(process.cwd(), page);
  const source = await readFile(page, "utf8");

  if (!/<main(?:\s|>)/.test(source)) {
    findings.push(`${relativePath}: page should expose a main landmark`);
  }

  if (!/<h1(?:\s|>)/.test(source)) {
    findings.push(`${relativePath}: page should expose a first-level heading`);
  }

  const imageTags = source.match(/<img\b[^>]*>/g) || [];
  for (const imageTag of imageTags) {
    if (!/\salt=/.test(imageTag)) {
      findings.push(`${relativePath}: img elements must include alt text`);
    }
  }

  const interactiveTags = source.match(/<(?:button|input|select|textarea)\b[^>]*>/g) || [];
  for (const tag of interactiveTags) {
    const hasAccessibleName =
      />\s*\S/.test(tag) ||
      /\b(?:aria-label|aria-labelledby|title|id)=/.test(tag);
    if (!hasAccessibleName) {
      findings.push(`${relativePath}: interactive controls need accessible names`);
    }
  }
}

if (findings.length > 0) {
  console.error("Accessibility smoke check failed:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log(`Accessibility smoke check passed for ${pages.length} page(s).`);
