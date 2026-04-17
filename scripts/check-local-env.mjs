/**
 * Runs before `vite` so local dev fails fast when Base44 app id is missing.
 * Reads the same env files Vite would merge (later files override earlier ones).
 * Shell: VITE_BASE44_APP_ID wins if set.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readVars(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

// Match Vite: https://vitejs.dev/guide/env-and-mode.html — later files override earlier ones
const envFiles = [".env", ".env.local", ".env.development", ".env.development.local"];

let merged = {};
for (const name of envFiles) {
  const p = path.join(root, name);
  if (fs.existsSync(p)) {
    merged = { ...merged, ...readVars(p) };
  }
}

const appId = (process.env.VITE_BASE44_APP_ID || "").trim() || (merged.VITE_BASE44_APP_ID || "").trim();

if (!appId) {
  console.error(`
[SmartQueue] Missing VITE_BASE44_APP_ID for local dev.

  Expected: committed .env.development contains VITE_BASE44_APP_ID. Restore that file, or add .env.local with VITE_BASE44_APP_ID (see .env.example). For api_key, use .env.local and VITE_BASE44_API_KEY.
`);
  process.exit(1);
}
