#!/usr/bin/env node
// Measures landing -> dashboard render timing with real backend data.
// Seeds a guest dog record, injects backend cookie, and records skeleton/data timings.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const fallback = path.join(process.cwd(), "Frontend", "node_modules", "playwright", "index.mjs");
    return await import(pathToFileURL(fallback).href);
  }
}

function getArg(name, defaultValue) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return defaultValue;
  return process.argv[i + 1] ?? defaultValue;
}

function getArgInt(name, defaultValue) {
  const raw = getArg(name, String(defaultValue));
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return defaultValue;
  return parsed;
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

function summarize(values) {
  const filtered = values.filter((v) => typeof v === "number" && Number.isFinite(v)).sort((a, b) => a - b);
  if (!filtered.length) return { count: 0, min: null, p50: null, p90: null, max: null, avg: null };
  const sum = filtered.reduce((a, b) => a + b, 0);
  return {
    count: filtered.length,
    min: filtered[0],
    p50: percentile(filtered, 50),
    p90: percentile(filtered, 90),
    max: filtered[filtered.length - 1],
    avg: Math.round(sum / filtered.length),
  };
}

function formatMs(v) {
  return v == null ? "-" : `${v}ms`;
}

function todayStamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseCookieFromSetCookie(setCookie) {
  if (!setCookie) return null;
  const firstPart = setCookie.split(";")[0] ?? "";
  const [name, ...rest] = firstPart.split("=");
  if (!name || !rest.length) return null;
  return { name: name.trim(), value: rest.join("=").trim() };
}

async function seedGuestAndGetCookie(backendUrl) {
  const unique = Date.now();
  const payload = {
    name: `qa_perf_${unique}`,
    breed: "mixed",
    chronic_issues: { top_issues: ["barking"] },
    triggers: { ids: ["doorbell"] },
  };

  const res = await fetch(`${backendUrl}/api/v1/onboarding/survey`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Guest seed failed: ${res.status} ${body}`);
  }

  const setCookie = res.headers.get("set-cookie");
  const cookie = parseCookieFromSetCookie(setCookie);
  if (!cookie) {
    throw new Error("Guest seed succeeded but Set-Cookie missing.");
  }

  const responseBody = await res.json();
  return { cookie, seedResponse: responseBody };
}

async function measureDashboardRender({
  chromium,
  frontendUrl,
  backendUrl,
  cookie,
  runs,
  label,
  contextOptions = {},
}) {
  const backendHost = new URL(backendUrl).hostname;
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const runResults = [];

  for (let i = 1; i <= runs; i += 1) {
    console.log(`[run] ${label} ${i}/${runs}`);
    const context = await browser.newContext(contextOptions);
    context.setDefaultNavigationTimeout(30000);
    context.setDefaultTimeout(30000);
    await context.addCookies([
      {
        name: cookie.name,
        value: cookie.value,
        domain: backendHost,
        path: "/",
        httpOnly: true,
        secure: true,
        // Dashboard API is cross-site when frontend and backend domains differ.
        // Match production cookie policy to ensure guest cookie is sent.
        sameSite: "None",
      },
    ]);

    const page = await context.newPage();
    const reqStarted = new Map();
    let dashboardApiMs = null;
    let dashboardApiStatus = null;

    page.on("request", (req) => {
      if (req.url().includes("/api/v1/dashboard/")) {
        reqStarted.set(req, Date.now());
      }
    });

    page.on("response", (res) => {
      if (!res.url().includes("/api/v1/dashboard/")) return;
      dashboardApiStatus = res.status();
      const started = reqStarted.get(res.request());
      if (started) {
        dashboardApiMs = Date.now() - started;
      }
    });

    const tLandingStart = Date.now();
    await page.goto(`${frontendUrl}/`, { waitUntil: "domcontentloaded" });
    const tLandingLoaded = Date.now();

    const tDashStart = Date.now();
    await page.goto(`${frontendUrl}/dashboard`, { waitUntil: "domcontentloaded" });

    const skeletonText = "대시보드를 준비하고 있어요...";
    let skeletonShownAt = null;
    let skeletonHiddenAt = null;

    try {
      await page.waitForFunction((txt) => document.body.innerText.includes(txt), skeletonText, { timeout: 5000 });
      skeletonShownAt = Date.now();
    } catch {
      // Skeleton may be too fast to catch on warm/fast runs.
    }

    if (skeletonShownAt) {
      try {
        await page.waitForFunction((txt) => !document.body.innerText.includes(txt), skeletonText, { timeout: 30000 });
        skeletonHiddenAt = Date.now();
      } catch {
        // Keep null; data wait below will still fail if page is stuck.
      }
    }

    await page.waitForFunction(() => {
      const text = document.body.innerText || "";
      const upper = text.toUpperCase();

      // Main dashboard content loaded with DB-backed profile/stats
      const hasHeader = upper.includes("INSIGHT DASHBOARD");
      const hasStats = upper.includes("TOTAL") || text.includes("누적 기록");
      const hasDogLink = Boolean(document.querySelector('a[href="/dog/profile"]'));
      const dashboardReady = hasHeader && hasStats && hasDogLink;

      // Alternate non-loading dashboard end states
      const coreDataBanner = text.includes("필수 정보가 부족합니다");
      const emptyState = text.includes("반려견 정보가 없습니다.");
      const errorState = text.includes("오류가 발생했습니다");

      return dashboardReady || coreDataBanner || emptyState || errorState;
    }, { timeout: 30000 });

    const tDataReady = Date.now();
    const stateSnapshot = await page.evaluate(() => {
      const text = document.body.innerText || "";
      const upper = text.toUpperCase();
      const hasHeader = upper.includes("INSIGHT DASHBOARD");
      const hasStats = upper.includes("TOTAL") || text.includes("누적 기록");
      const hasDogLink = Boolean(document.querySelector('a[href="/dog/profile"]'));
      if (hasHeader && hasStats && hasDogLink) return "dashboard_loaded";
      if (text.includes("필수 정보가 부족합니다")) return "core_data_required";
      if (text.includes("반려견 정보가 없습니다.")) return "no_dog";
      if (text.includes("오류가 발생했습니다")) return "error";
      return "unknown";
    });
    const h1Text = await page.locator("h1").first().textContent().catch(() => null);

    runResults.push({
      label,
      run: i,
      landingDomMs: tLandingLoaded - tLandingStart,
      dashboardDataReadyMs: tDataReady - tDashStart,
      skeletonToDataMs:
        skeletonShownAt && skeletonHiddenAt ? skeletonHiddenAt - skeletonShownAt : null,
      dashboardApiMs,
      dashboardApiStatus,
      h1Text: h1Text?.trim() ?? null,
      skeletonDetected: Boolean(skeletonShownAt),
      renderState: stateSnapshot,
    });

    await context.close();
  }

  await browser.close();
  return runResults;
}

async function measureApiOnly({ backendUrl, cookie, runs }) {
  const values = [];
  for (let i = 0; i < runs; i += 1) {
    const start = Date.now();
    const res = await fetch(`${backendUrl}/api/v1/dashboard/`, {
      headers: {
        Cookie: `${cookie.name}=${cookie.value}`,
      },
    });
    const end = Date.now();
    values.push({ ms: end - start, status: res.status });
  }
  return values;
}

function buildMarkdownReport({
  frontendUrl,
  backendUrl,
  seedResponse,
  desktopRuns,
  mobileRuns,
  apiRuns,
}) {
  const desktopReady = summarize(desktopRuns.map((r) => r.dashboardDataReadyMs));
  const desktopSkeleton = summarize(desktopRuns.map((r) => r.skeletonToDataMs));
  const desktopApi = summarize(desktopRuns.map((r) => r.dashboardApiMs));
  const mobileReady = summarize(mobileRuns.map((r) => r.dashboardDataReadyMs));
  const mobileSkeleton = summarize(mobileRuns.map((r) => r.skeletonToDataMs));
  const mobileApi = summarize(mobileRuns.map((r) => r.dashboardApiMs));
  const apiOnly = summarize(apiRuns.map((r) => r.ms));

  const skeletonHitDesktop = desktopRuns.filter((r) => r.skeletonDetected).length;
  const skeletonHitMobile = mobileRuns.filter((r) => r.skeletonDetected).length;
  const stateSummary = (rows) =>
    rows.reduce((acc, r) => {
      const key = r.renderState || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  const desktopStates = stateSummary(desktopRuns);
  const mobileStates = stateSummary(mobileRuns);

  return `# Dashboard Render Performance Report

## Scope
- Frontend: ${frontendUrl}
- Backend: ${backendUrl}
- Seeded dog id: ${seedResponse?.id ?? "-"}

## Test Matrix
- Desktop (Chrome headless): ${desktopRuns.length} runs
- Mobile (iPhone 13 emulation): ${mobileRuns.length} runs
- API only (/api/v1/dashboard/ with cookie): ${apiRuns.length} runs

## Key Result (Landing -> Dashboard -> Real Data)
- Desktop data-ready: min ${formatMs(desktopReady.min)}, p50 ${formatMs(desktopReady.p50)}, p90 ${formatMs(desktopReady.p90)}, max ${formatMs(desktopReady.max)}, avg ${formatMs(desktopReady.avg)}
- Mobile data-ready: min ${formatMs(mobileReady.min)}, p50 ${formatMs(mobileReady.p50)}, p90 ${formatMs(mobileReady.p90)}, max ${formatMs(mobileReady.max)}, avg ${formatMs(mobileReady.avg)}

## Skeleton -> Data Duration
- Desktop: detected ${skeletonHitDesktop}/${desktopRuns.length} runs, min ${formatMs(desktopSkeleton.min)}, p50 ${formatMs(desktopSkeleton.p50)}, p90 ${formatMs(desktopSkeleton.p90)}, max ${formatMs(desktopSkeleton.max)}, avg ${formatMs(desktopSkeleton.avg)}
- Mobile: detected ${skeletonHitMobile}/${mobileRuns.length} runs, min ${formatMs(mobileSkeleton.min)}, p50 ${formatMs(mobileSkeleton.p50)}, p90 ${formatMs(mobileSkeleton.p90)}, max ${formatMs(mobileSkeleton.max)}, avg ${formatMs(mobileSkeleton.avg)}

## Render End State
- Desktop: ${JSON.stringify(desktopStates)}
- Mobile: ${JSON.stringify(mobileStates)}

## Dashboard API (Browser-captured)
- Desktop: min ${formatMs(desktopApi.min)}, p50 ${formatMs(desktopApi.p50)}, p90 ${formatMs(desktopApi.p90)}, max ${formatMs(desktopApi.max)}, avg ${formatMs(desktopApi.avg)}
- Mobile: min ${formatMs(mobileApi.min)}, p50 ${formatMs(mobileApi.p50)}, p90 ${formatMs(mobileApi.p90)}, max ${formatMs(mobileApi.max)}, avg ${formatMs(mobileApi.avg)}

## Dashboard API (Direct request)
- API only: min ${formatMs(apiOnly.min)}, p50 ${formatMs(apiOnly.p50)}, p90 ${formatMs(apiOnly.p90)}, max ${formatMs(apiOnly.max)}, avg ${formatMs(apiOnly.avg)}

## Notes
- This suite uses real backend data by creating a guest survey record first.
- Dashboard render completion is detected with case-insensitive header/stat + dog profile link (INSIGHT DASHBOARD, TOTAL, or 누적 기록).
- Skeleton duration is measured only when skeleton text is observed during run.
`;
}

async function main() {
  const { chromium, devices } = await loadPlaywright();
  const frontendUrl = (getArg("frontend-url", "https://www.mungai.co.kr") || "").replace(/\/+$/, "");
  const backendUrl = (getArg("backend-url", "https://backend-production-61c6.up.railway.app") || "").replace(/\/+$/, "");
  const desktopRunsCount = getArgInt("desktop-runs", 5);
  const mobileRunsCount = getArgInt("mobile-runs", 3);
  const apiRunsCount = getArgInt("api-runs", 15);
  const outDirArg = getArg("out-dir", "");
  const outDir =
    outDirArg ||
    path.join(process.cwd(), "docs", "qa", "artifacts", todayStamp());

  fs.mkdirSync(outDir, { recursive: true });

  console.log(`[suite] seed guest on ${backendUrl}`);
  const seeded = await seedGuestAndGetCookie(backendUrl);
  console.log(`[suite] desktop runs=${desktopRunsCount}`);

  const desktopRuns = await measureDashboardRender({
    chromium,
    frontendUrl,
    backendUrl,
    cookie: seeded.cookie,
    runs: desktopRunsCount,
    label: "desktop",
  });

  console.log(`[suite] mobile runs=${mobileRunsCount}`);
  const mobileRuns = await measureDashboardRender({
    chromium,
    frontendUrl,
    backendUrl,
    cookie: seeded.cookie,
    runs: mobileRunsCount,
    label: "mobile_iphone13",
    contextOptions: {
      ...devices["iPhone 13"],
    },
  });

  console.log(`[suite] api runs=${apiRunsCount}`);
  const apiRuns = await measureApiOnly({
    backendUrl,
    cookie: seeded.cookie,
    runs: apiRunsCount,
  });

  const reportMd = buildMarkdownReport({
    frontendUrl,
    backendUrl,
    seedResponse: seeded.seedResponse,
    desktopRuns,
    mobileRuns,
    apiRuns,
  });

  const raw = {
    generatedAt: new Date().toISOString(),
    frontendUrl,
    backendUrl,
    seeded,
    desktopRuns,
    mobileRuns,
    apiRuns,
  };

  const jsonPath = path.join(outDir, "dashboard_render_perf_raw.json");
  const mdPath = path.join(outDir, "dashboard_render_perf_report.md");
  fs.writeFileSync(jsonPath, JSON.stringify(raw, null, 2));
  fs.writeFileSync(mdPath, reportMd);

  console.log(`[ok] Wrote: ${jsonPath}`);
  console.log(`[ok] Wrote: ${mdPath}`);
}

main().catch((err) => {
  console.error(`[error] ${err?.stack || err}`);
  process.exit(1);
});
