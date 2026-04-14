/**
 * P1 batch2 targeted checks for TailLog production.
 * Covers selected AUTH/DASH/COACH/NET cases with reproducible artifacts.
 */
import fs from 'node:fs';
import path from 'node:path';

function getArg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const fallback = path.join(process.cwd(), 'Frontend', 'node_modules', 'playwright', 'index.mjs');
    return await import(fallback);
  }
}

function statusPass(note = '', details = {}) {
  return { status: 'PASS', note, details };
}

function statusFail(note = '', details = {}) {
  return { status: 'FAIL', note, details };
}

function statusBlocked(note = '', details = {}) {
  return { status: 'BLOCKED', note, details };
}

async function main() {
  const frontendUrl = (getArg('frontend-url', 'https://www.mungai.co.kr') || '').replace(/\/+$/, '');
  const backendUrl = (getArg('backend-url', 'https://backend-production-61c6.up.railway.app') || '').replace(/\/+$/, '');
  const profileDir = getArg('profile-dir', path.join(process.cwd(), 'tmp_qa_profile_snapshot'));
  const supabaseRef = getArg('supabase-ref', 'kvknerzsqgmmdmyxlorl');
  const outDir = getArg('out-dir', path.join(process.cwd(), 'docs', 'qa', 'artifacts', todayStamp(), 'p1_parallel_run', 'batch2_targeted'));
  fs.mkdirSync(outDir, { recursive: true });

  const rawPath = path.join(outDir, 'p1_batch2_targeted_raw.json');
  const reportPath = path.join(outDir, 'p1_batch2_targeted_report.md');

  const { chromium } = await loadPlaywright();

  const caseResults = [];

  async function runCase(caseId, title, fn) {
    const startedAt = Date.now();
    try {
      const result = await fn();
      caseResults.push({
        caseId,
        title,
        ...result,
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      caseResults.push({
        caseId,
        title,
        ...statusFail(String(error)),
        durationMs: Date.now() - startedAt,
      });
    }
  }

  const persistent = await chromium.launchPersistentContext(profileDir, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
  });
  const page = persistent.pages()[0] || (await persistent.newPage());

  // Resolve logged-in token from localStorage once.
  await page.goto(`${frontendUrl}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  const authState = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (!key) return { hasToken: false, key: null, token: null };
    const raw = localStorage.getItem(key);
    if (!raw) return { hasToken: false, key, token: null };
    try {
      const parsed = JSON.parse(raw);
      const token = parsed?.access_token || parsed?.session?.access_token || parsed?.currentSession?.access_token || null;
      return { hasToken: !!token, key, token };
    } catch {
      return { hasToken: false, key, token: null };
    }
  });

  // AUTH-05
  await runCase('AUTH-05', 'OAuth callback returnTo survey', async () => {
    if (!authState.hasToken) return statusBlocked('logged-in token missing in profile');
    await page.goto(`${frontendUrl}/auth/callback?returnTo=/survey`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForURL(/\/survey/, { timeout: 30000 });
    return statusPass('redirected to /survey', { url: page.url() });
  });

  // AUTH-06
  await runCase('AUTH-06', 'OAuth callback returnTo dashboard', async () => {
    if (!authState.hasToken) return statusBlocked('logged-in token missing in profile');
    await page.goto(`${frontendUrl}/auth/callback?returnTo=/dashboard`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    return statusPass('redirected to /dashboard', { url: page.url() });
  });

  // AUTH-09
  await runCase('AUTH-09', 'migrate-guest failure should not block callback routing', async () => {
    if (!authState.hasToken) return statusBlocked('logged-in token missing in profile');

    const pattern = '**/api/v1/auth/migrate-guest';
    await page.route(pattern, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'forced migrate-guest failure for QA' }),
      });
    });

    try {
      await page.goto(`${frontendUrl}/auth/callback?returnTo=/dashboard`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForURL((url) => {
        const u = url.toString();
        return u.includes('/dashboard') || u.includes('/survey');
      }, { timeout: 30000 });
      return statusPass('callback routing continued despite migrate-guest 500', { url: page.url() });
    } finally {
      await page.unroute(pattern).catch(() => {});
    }
  });

  // DASH-16
  await runCase('DASH-16', 'Quick log repeated taps stability', async () => {
    if (!authState.hasToken) return statusBlocked('logged-in token missing in profile');
    await page.goto(`${frontendUrl}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForFunction(() => {
      const t = document.body.innerText || '';
      return t.toUpperCase().includes('INSIGHT DASHBOARD') || t.includes('누적 기록');
    }, { timeout: 30000 });

    const textBefore = await page.locator('body').innerText();
    const mBefore = textBefore.match(/누적 기록\s+(\d+)\s+Total/i);
    const before = mBefore ? Number(mBefore[1]) : null;

    const button = page.getByRole('button', { name: '짖음' }).first();
    for (let i = 0; i < 3; i += 1) {
      await button.click({ force: true });
    }

    await page.waitForFunction(() => (document.body.innerText || '').includes('기록이 저장되었습니다!'), { timeout: 20000 });

    let after = null;
    if (Number.isFinite(before)) {
      await page.waitForFunction((b) => {
        const t = document.body.innerText || '';
        const m = t.match(/누적 기록\s+(\d+)\s+Total/i);
        if (!m) return false;
        const cur = Number(m[1]);
        return cur >= b + 1;
      }, before, { timeout: 25000 });
      const textAfter = await page.locator('body').innerText();
      const mAfter = textAfter.match(/누적 기록\s+(\d+)\s+Total/i);
      after = mAfter ? Number(mAfter[1]) : null;
    }

    return statusPass('repeated taps did not break quick-log flow', { before, after });
  });

  // DASH-05 (API patch)
  await runCase('DASH-05', 'Log edit save via API patch', async () => {
    if (!authState.hasToken) return statusBlocked('logged-in token missing in profile');
    const dashResp = await fetch(`${backendUrl}/api/v1/dashboard/`, {
      headers: { Authorization: `Bearer ${authState.token}` },
    });
    if (dashResp.status !== 200) return statusFail('dashboard API not 200', { status: dashResp.status });

    const dashData = await dashResp.json();
    const recent = Array.isArray(dashData?.recent_logs) ? dashData.recent_logs : [];
    if (!recent.length || !recent[0]?.id) return statusBlocked('no recent log id found for patch');

    const logId = recent[0].id;
    const prev = Number(recent[0]?.intensity ?? 5);
    const next = prev >= 10 ? 9 : prev + 1;

    const patchResp = await fetch(`${backendUrl}/api/v1/logs/${logId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authState.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ intensity: next }),
    });

    if (patchResp.status !== 200) {
      const body = await patchResp.text();
      return statusFail('log patch failed', { status: patchResp.status, body });
    }

    const patched = await patchResp.json();
    const patchedIntensity = Number(patched?.intensity ?? -1);
    if (patchedIntensity !== next) {
      return statusFail('patched intensity mismatch', { expected: next, got: patchedIntensity });
    }

    return statusPass('log patch 200 and intensity updated', { logId, prev, next });
  });

  // COACH-09 (settings data action visibility)
  await runCase('COACH-09', 'Settings data delete/export guidance visible', async () => {
    await page.goto(`${frontendUrl}/settings`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForFunction(() => {
      const t = document.body.innerText || '';
      return t.includes('데이터 및 관리') && t.includes('기록 데이터 내보내기') && t.includes('전체 데이터 초기화');
    }, { timeout: 30000 });
    return statusPass('data management/export/delete guidance rendered');
  });

  await persistent.close();

  // AUTH-04 (callback without session)
  await runCase('AUTH-04', 'Auth callback without session', async () => {
    const browser = await chromium.launch({ headless: true, channel: 'chrome' });
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.goto(`${frontendUrl}/auth/callback`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.waitForFunction(() => {
      const t = document.body.innerText || '';
      return t.includes('로그인에 실패했습니다') && t.includes('로그인 페이지로 이동');
    }, { timeout: 30000 });
    await ctx.close();
    await browser.close();
    return statusPass('error UI shown for missing callback session');
  });

  // AUTH-03 + NET-14 (invalid token recovery at /login)
  await runCase('AUTH-03', 'Expired/invalid token re-entry to /login', async () => {
    const browser = await chromium.launch({ headless: true, channel: 'chrome' });
    const ctx = await browser.newContext();
    const p = await ctx.newPage();

    const authKey = `sb-${supabaseRef}-auth-token`;
    await p.goto(`${frontendUrl}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.evaluate((k) => {
      localStorage.setItem(k, JSON.stringify({
        access_token: 'invalid-token',
        refresh_token: 'invalid-refresh',
        token_type: 'bearer',
        expires_at: 1,
        user: { is_anonymous: false },
      }));
    }, authKey);

    await p.goto(`${frontendUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.waitForFunction(() => {
      const t = document.body.innerText || '';
      const hasLoginUi = t.includes('시작하기') || t.includes('Google로 시작하기') || t.includes('카카오로 시작하기');
      const notSpinnerOnly = !t.includes('로그인 중입니다');
      return hasLoginUi && notSpinnerOnly;
    }, { timeout: 30000 });

    await ctx.close();
    await browser.close();
    return statusPass('invalid token did not cause infinite loading; login UI recovered');
  });

  // AUTH-10
  await runCase('AUTH-10', 'Corrupted localStorage auth token recovery', async () => {
    const browser = await chromium.launch({ headless: true, channel: 'chrome' });
    const ctx = await browser.newContext();
    const p = await ctx.newPage();

    const authKey = `sb-${supabaseRef}-auth-token`;
    await p.goto(`${frontendUrl}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.evaluate((k) => {
      localStorage.setItem(k, '{not-json-corrupted');
    }, authKey);

    await p.goto(`${frontendUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.waitForFunction(() => {
      const t = document.body.innerText || '';
      return t.includes('시작하기') || t.includes('Google로 시작하기') || t.includes('카카오로 시작하기');
    }, { timeout: 30000 });

    await ctx.close();
    await browser.close();
    return statusPass('corrupted localStorage token did not break login page rendering');
  });

  await runCase('NET-14', 'Login session refresh expired recovery', async () => {
    const auth03 = caseResults.find((c) => c.caseId === 'AUTH-03');
    if (!auth03) return statusBlocked('AUTH-03 result missing');
    if (auth03.status !== 'PASS') return statusFail('recovery failed in AUTH-03 path', { linkedCase: auth03.status });
    return statusPass('same invalid/expired token recovery path verified via /login');
  });

  // NET-06 blocked by nature (deploy setting-level case)
  await runCase('NET-06', 'Deploy rootDirectory validation', async () => {
    return statusBlocked('runtime QA cannot deterministically prove deploy rootDirectory config without deployment mutation');
  });

  const summary = caseResults.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const payload = {
    generatedAt: new Date().toISOString(),
    frontendUrl,
    backendUrl,
    profileDir,
    summary,
    caseResults,
  };
  fs.writeFileSync(rawPath, JSON.stringify(payload, null, 2));

  const md = `# P1 Batch2 Targeted Report\n\n- Frontend: ${frontendUrl}\n- Backend: ${backendUrl}\n- Profile: ${profileDir}\n- Generated at: ${payload.generatedAt}\n\n## Summary\n- PASS: ${summary.PASS || 0}\n- FAIL: ${summary.FAIL || 0}\n- BLOCKED: ${summary.BLOCKED || 0}\n\n## Cases\n${caseResults.map((r, i) => `${i + 1}. ${r.caseId} [${r.status}] ${r.title} (${r.durationMs}ms)${r.note ? ` - ${r.note}` : ''}`).join('\n')}\n`;
  fs.writeFileSync(reportPath, md);

  console.log(`[done] Raw: ${rawPath}`);
  console.log(`[done] Report: ${reportPath}`);
  console.log(`[done] Summary: PASS=${summary.PASS || 0}, FAIL=${summary.FAIL || 0}, BLOCKED=${summary.BLOCKED || 0}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
