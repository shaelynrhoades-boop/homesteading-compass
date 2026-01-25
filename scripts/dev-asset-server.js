const http = require('http');
const { execSync } = require('child_process');

const PORT = process.env.DEV_ASSET_PORT || 8081;

const handler = (req, res) => {
  if (req.url !== '/__verify-assets__') {
    res.writeHead(404);
    res.end();
    return;
  }
  try {
    const output = execSync('node ./scripts/verify-assets.js', { stdio: 'pipe' }).toString();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, output, missing: [] }));
  } catch (error) {
    const stdout = error.stdout ? error.stdout.toString() : '';
    const stderr = error.stderr ? error.stderr.toString() : '';
    const missing = [];
    stderr.split('\n').forEach((line) => {
      const match = line.match(/- (.+) -> (.+)$/);
      if (match) {
        missing.push({ file: match[1], asset: match[2] });
      }
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, output: stdout || stderr, missing }));
  }
};

http.createServer(handler).listen(PORT, () => {
  console.log(`dev-asset-server: listening on ${PORT}`);
});
