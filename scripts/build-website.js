const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "website");
const output = path.join(root, "dist");
const clientOutput = path.join(output, "client");
const serverOutput = path.join(output, "server");
const metadataOutput = path.join(output, ".openai");

if (!fs.existsSync(source)) {
  throw new Error(`Missing website source directory: ${source}`);
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(clientOutput, { recursive: true });
fs.mkdirSync(serverOutput, { recursive: true });
fs.mkdirSync(metadataOutput, { recursive: true });

for (const entry of fs.readdirSync(source)) {
  fs.cpSync(path.join(source, entry), path.join(clientOutput, entry), {
    recursive: true,
    force: true,
  });
}

fs.copyFileSync(
  path.join(root, ".openai", "hosting.json"),
  path.join(metadataOutput, "hosting.json"),
);

fs.writeFileSync(
  path.join(serverOutput, "index.js"),
  `const passthrough = new Set(["GET", "HEAD"]);

function wantsHtml(request) {
  return (request.headers.get("accept") || "").includes("text/html");
}

async function serveAsset(request, env) {
  if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
    return new Response("Static asset binding is unavailable.", { status: 500 });
  }

  const response = await env.ASSETS.fetch(request);
  if (response.status !== 404 || !passthrough.has(request.method) || !wantsHtml(request)) {
    return response;
  }

  const fallbackUrl = new URL("/index.html", request.url);
  return env.ASSETS.fetch(new Request(fallbackUrl, request));
}

export default {
  async fetch(request, env) {
    return serveAsset(request, env);
  },
};
`,
);

console.log(`Website copied to ${path.relative(root, output)}`);
