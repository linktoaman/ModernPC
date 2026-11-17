import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".next",
  "artifacts",
  "coverage",
  "node_modules"
]);
const ignoredFiles = new Set([
  "package-lock.json",
  "scripts/secret-scan.mjs"
]);

const checks = [
  {
    name: "private key",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/
  },
  {
    name: "AWS access key id",
    pattern: /AKIA[0-9A-Z]{16}/
  },
  {
    name: "GitHub token",
    pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/
  },
  {
    name: "Slack webhook",
    pattern: /hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+/
  },
  {
    name: "assigned secret value",
    pattern: /^(?:[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|API_KEY)[A-Z0-9_]*)\s*=\s*["']?[^"'\n]{12,}["']?$/im
  }
];

const findings = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(root, absolutePath);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        await walk(absolutePath);
      }
      continue;
    }

    if (!entry.isFile() || ignoredFiles.has(relativePath)) {
      continue;
    }

    const content = await readFile(absolutePath, "utf8").catch(() => "");
    for (const check of checks) {
      const match = check.pattern.exec(content);
      if (match) {
        const line = content.slice(0, match.index).split("\n").length;
        findings.push(`${relativePath}:${line} ${check.name}`);
      }
    }
  }
}

await walk(root);

if (findings.length > 0) {
  console.error("Potential secrets found:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("No high-confidence secrets found.");
