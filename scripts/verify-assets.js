const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCAN_DIRS = ['app', 'components', 'context', 'constants'];
const EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.ttf', '.json'];

const requireRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g;

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
};

const resolveAssetPath = (baseFile, assetPath) => {
  const baseDir = path.dirname(baseFile);
  const fullPath = path.resolve(baseDir, assetPath);
  if (fs.existsSync(fullPath)) {
    return fullPath;
  }
  if (path.extname(fullPath)) {
    return null;
  }
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(`${fullPath}${ext}`)) {
      return `${fullPath}${ext}`;
    }
  }
  return null;
};

const scanFiles = () => {
  const missing = [];
  for (const dir of SCAN_DIRS) {
    const fullDir = path.join(ROOT, dir);
    if (!fs.existsSync(fullDir)) continue;
    const files = walk(fullDir);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      let match;
      while ((match = requireRegex.exec(content)) !== null) {
        const assetPath = match[1];
        if (!assetPath.startsWith('.')) continue;
        const resolved = resolveAssetPath(file, assetPath);
        if (!resolved) {
          missing.push({ file, assetPath });
        }
      }
    }
  }
  return missing;
};

const missing = scanFiles();
if (missing.length === 0) {
  console.log('verify-assets: OK');
  process.exit(0);
}

console.error('verify-assets: missing files detected:');
missing.forEach((item) => {
  console.error(`- ${path.relative(ROOT, item.file)} -> ${item.assetPath}`);
});
process.exit(1);
