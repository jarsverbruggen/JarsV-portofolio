// Auto-sync: watches the project and automatically commits + pushes to GitHub
// whenever you save changes. Run it with `npm run sync` and leave the terminal
// open while you work. Stop it with Ctrl+C.
//
// Changes are debounced, so a burst of saves becomes a single commit. Files
// ignored by .gitignore (e.g. .env.local) are never committed.

import { watch } from "node:fs";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(exec);

const DEBOUNCE_MS = 8000; // wait this long after the last change before pushing
const IGNORE = [
  /(^|[\\/])\.git([\\/]|$)/,
  /node_modules/,
  /[\\/]?\.next([\\/]|$)/,
  /[\\/]?out([\\/]|$)/,
  /\.tsbuildinfo$/,
];

let timer = null;
let syncing = false;
let pending = false;

function ignored(file) {
  return file ? IGNORE.some((re) => re.test(file)) : false;
}

async function sync() {
  if (syncing) {
    pending = true;
    return;
  }
  syncing = true;
  try {
    const { stdout: status } = await run("git status --porcelain");
    if (!status.trim()) return; // nothing to commit

    const stamp = new Date().toISOString().replace("T", " ").slice(0, 19);
    await run("git add -A");
    await run(`git commit -q -m "auto: ${stamp}"`);
    try {
      await run("git push -q");
    } catch {
      // remote moved on (edited elsewhere) — reconcile then retry once
      await run("git pull --rebase -q").catch(() => {});
      await run("git push -q");
    }
    console.log(`[autosync] ✅ pushed @ ${stamp}`);
  } catch (e) {
    console.error("[autosync] ⚠️  error:", (e.stderr || e.message || e).toString().trim());
  } finally {
    syncing = false;
    if (pending) {
      pending = false;
      schedule();
    }
  }
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(sync, DEBOUNCE_MS);
}

console.log("[autosync] 👀 watching for changes… (Ctrl+C to stop)");
watch(".", { recursive: true }, (_event, filename) => {
  if (ignored(filename ? filename.toString() : "")) return;
  schedule();
});
