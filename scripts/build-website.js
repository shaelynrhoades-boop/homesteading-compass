const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "website");
const output = path.join(root, "dist");

if (!fs.existsSync(source)) {
  throw new Error(`Missing website source directory: ${source}`);
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const entry of fs.readdirSync(source)) {
  fs.cpSync(path.join(source, entry), path.join(output, entry), {
    recursive: true,
    force: true,
  });
}

console.log(`Website copied to ${path.relative(root, output)}`);
