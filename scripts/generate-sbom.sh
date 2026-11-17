#!/usr/bin/env bash
set -euo pipefail

output_path="${SBOM_OUTPUT:-artifacts/sbom.cdx.json}"
mkdir -p "$(dirname "$output_path")"

if npm sbom --sbom-format=cyclonedx --json > "$output_path"; then
  echo "Wrote CycloneDX SBOM to $output_path"
  exit 0
fi

echo "npm sbom is unavailable; generating a package-lock based CycloneDX SBOM." >&2

node - "$output_path" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const outputPath = process.argv[2];
const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
const root = lock.packages?.[""] || {};
const dependencies = root.dependencies || {};
const devDependencies = root.devDependencies || {};
const packages = lock.packages || {};

const components = Object.entries(packages)
  .filter(([packagePath]) => packagePath.startsWith("node_modules/"))
  .map(([packagePath, metadata]) => {
    const name = packagePath.replace(/^node_modules\//, "");
    return {
      type: "library",
      name,
      version: metadata.version || "0.0.0",
      scope: devDependencies[name] ? "optional" : "required",
      purl: `pkg:npm/${encodeURIComponent(name)}@${metadata.version || "0.0.0"}`
    };
  })
  .sort((left, right) => left.name.localeCompare(right.name));

const bom = {
  bomFormat: "CycloneDX",
  specVersion: "1.5",
  serialNumber: `urn:uuid:${crypto.randomUUID()}`,
  version: 1,
  metadata: {
    timestamp: new Date().toISOString(),
    component: {
      type: "application",
      name: root.name || "clinic-booking-app2",
      version: root.version || "0.0.0"
    }
  },
  components,
  dependencies: [
    {
      ref: root.name || "clinic-booking-app2",
      dependsOn: Object.keys(dependencies)
    }
  ]
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(bom, null, 2)}\n`);
console.log(`Wrote fallback CycloneDX SBOM to ${outputPath}`);
NODE
