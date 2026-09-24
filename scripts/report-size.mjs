import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const artifacts = [
  ["ESM JavaScript", "dist/index.mjs"],
  ["CommonJS JavaScript", "dist/index.js"],
  ["Optional CSS", "dist/styles/default.css"],
];

const kib = (bytes) => `${(bytes / 1024).toFixed(2)} KiB`;

console.log("Build artifacts (minified; gzip is an estimate):");
for (const [label, path] of artifacts) {
  const contents = readFileSync(path);
  console.log(`  ${label}: ${kib(contents.length)} raw / ${kib(gzipSync(contents).length)} gzip`);
}

const pack = JSON.parse(
  execFileSync("npm", ["pack", "--dry-run", "--json"], {
    encoding: "utf8",
  }),
)[0];

console.log("npm pack --dry-run (estimated package size, including maps and docs):");
console.log(`  Tarball: ${kib(pack.size)}`);
console.log(`  Unpacked: ${kib(pack.unpackedSize)} across ${pack.entryCount} files`);
