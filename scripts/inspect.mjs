/** Dev helper: prints per-node world bounding boxes of the normalized model. */
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PORT = 4179;
const BASE = `http://127.0.0.1:${PORT}`;

function findChromium() {
  for (const root of [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers'].filter(Boolean)) {
    if (!existsSync(root)) continue;
    const stack = [root];
    while (stack.length) {
      const dir = stack.pop();
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        const st = statSync(p);
        if (st.isDirectory()) stack.push(p);
        else if ((name === 'chrome' || name === 'headless_shell') && st.mode & 0o111) return p;
      }
    }
  }
  return null;
}

async function waitForServer(url, ms = 20000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('server not up');
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'pipe',
  detached: true,
});
try {
  await waitForServer(BASE);
  const browser = await chromium.launch({
    executablePath: findChromium(),
    headless: true,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage();
  await page.goto(`${BASE}/?debug=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.__exhibit?.ready === true, null, { timeout: 60000 });
  const nodes = await page.evaluate(() => globalThis.__modelNodes());
  for (const n of nodes) {
    const size = n.max.map((v, i) => Math.round((v - n.min[i]) * 100) / 100);
    const ctr = n.max.map((v, i) => Math.round(((v + n.min[i]) / 2) * 100) / 100);
    console.log(
      `${n.name.padEnd(22)} min[${n.min.join(', ')}] max[${n.max.join(', ')}] size[${size.join(', ')}] ctr[${ctr.join(', ')}]`,
    );
  }
  await browser.close();
} finally {
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    server.kill('SIGTERM');
  }
}
