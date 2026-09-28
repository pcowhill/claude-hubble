/**
 * Verification captures: serves the production build, drives it in headless
 * Chromium (SwiftShader WebGL) and saves screenshots into verification/.
 *
 * Usage: npm run build && npm run verify
 * Extra shots (debug calibration): node scripts/capture.mjs --debug
 */
import { chromium } from 'playwright-core';
import { spawn, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PORT = 4173;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = 'verification';
const DEBUG_SHOT = process.argv.includes('--debug');

function findChromium() {
  const envPath = process.env.PLAYWRIGHT_BROWSERS_PATH;
  const roots = [envPath, '/opt/pw-browsers'].filter(Boolean);
  for (const root of roots) {
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
  try {
    return execSync('which chromium chromium-browser google-chrome 2>/dev/null | head -1')
      .toString()
      .trim() || null;
  } catch {
    return null;
  }
}

async function waitForServer(url, ms = 30000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server at ${url} did not come up`);
}

async function waitReady(page) {
  await page.waitForFunction(() => globalThis.__exhibit?.ready === true, null, { timeout: 60000 });
  await page.waitForTimeout(500);
}

/** Wait for the camera flight to finish plus a short settle for overlay fades. */
async function settle(page) {
  await page.waitForFunction(() => globalThis.__exhibit && !globalThis.__exhibit.camera().flying, null, {
    timeout: 30000,
  });
  await page.waitForTimeout(700);
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'pipe',
    detached: true,
  });
  server.stderr.on('data', (d) => process.stderr.write(`[preview] ${d}`));
  try {
    await waitForServer(BASE);
    console.log('Preview server up.');

    const executablePath = findChromium();
    if (!executablePath) throw new Error('No Chromium executable found');
    console.log('Using browser:', executablePath);

    const browser = await chromium.launch({
      executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--disable-gpu-sandbox',
      ],
    });

    const errors = [];
    const shoot = async (page, name) => {
      await page.screenshot({ path: join(OUT, name) });
      console.log('  saved', name);
    };

    // ---- Desktop flow ------------------------------------------------
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(String(err)));

    console.log('Desktop: initial exhibit');
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await waitReady(page);
    console.log('  model source:', await page.evaluate(() => globalThis.__exhibit.modelSource));
    await shoot(page, '01-initial-desktop.png');

    console.log('Desktop: subsystem selected (primary mirror, x-ray)');
    await page.evaluate(() => globalThis.__exhibit.select('primary-mirror'));
    await settle(page);
    await shoot(page, '02-subsystem-selected.png');

    console.log('Desktop: guided tour — optics stop');
    await page.evaluate(() => globalThis.__exhibit.gotoStep(2));
    await settle(page);
    await shoot(page, '03-tour-optics.png');

    console.log('Desktop: guided tour — power stop');
    await page.evaluate(() => globalThis.__exhibit.gotoStep(7));
    await settle(page);
    await shoot(page, '04-tour-power.png');

    console.log('Desktop: lighting presets');
    await page.evaluate(() => {
      globalThis.__exhibit.exitTour();
      globalThis.__exhibit.setLighting('sunlit');
    });
    await settle(page);
    await shoot(page, '06-lighting-sunlit.png');
    await page.evaluate(() => globalThis.__exhibit.setLighting('orbitNight'));
    await page.waitForTimeout(1500);
    await shoot(page, '07-lighting-orbit-night.png');
    await page.evaluate(() => globalThis.__exhibit.setLighting('studio'));

    if (DEBUG_SHOT) {
      console.log('Desktop: debug calibration view');
      await page.goto(`${BASE}/?debug=1`, { waitUntil: 'domcontentloaded' });
      await waitReady(page);
      await page.evaluate(() => globalThis.__exhibit.setViewMode('xray'));
      await page.waitForTimeout(900);
      await shoot(page, '00-debug-calibration.png');
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      await waitReady(page);
    }

    // ---- Narrow viewport --------------------------------------------
    console.log('Tablet-narrow: selected subsystem bottom sheet');
    const narrow = await browser.newPage({ viewport: { width: 820, height: 1080 } });
    narrow.on('pageerror', (err) => errors.push(String(err)));
    await narrow.goto(BASE, { waitUntil: 'domcontentloaded' });
    await waitReady(narrow);
    await narrow.evaluate(() => globalThis.__exhibit.select('solar-arrays'));
    await settle(narrow);
    await shoot(narrow, '05-narrow-viewport.png');

    await browser.close();

    if (errors.length) {
      console.log('\nPage errors captured:');
      for (const e of errors) console.log('  ✗', e);
      process.exitCode = 2;
    } else {
      console.log('\nNo page errors. Screenshots in verification/.');
    }
  } finally {
    try {
      process.kill(-server.pid, 'SIGTERM');
    } catch {
      server.kill('SIGTERM');
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
