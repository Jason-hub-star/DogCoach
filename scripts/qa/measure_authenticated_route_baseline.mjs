#!/usr/bin/env node
// Authenticated baseline measurement:
// 1) Opens login page (or attaches CDP), optionally injects a Supabase session JSON
// 2) Waits for authenticated Supabase session in localStorage
// 3) Measures app route data-ready timings in same browser context

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

function readFrontendEnvValue(key) {
  const envPath = path.join(process.cwd(), "Frontend", ".env.local");
  if (!fs.existsSync(envPath)) return null;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    if (!line.startsWith(`${key}=`)) continue;
    return line.slice(key.length + 1).trim();
  }
  return null;
}

function detectDefaultAuthStorageKey() {
  const supabaseUrl = readFrontendEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseUrl) return null;
  try {
    const host = new URL(supabaseUrl).hostname;
    const projectRef = host.split(".")[0];
    if (!projectRef) return null;
    return `sb-${projectRef}-auth-token`;
  } catch {
    return null;
  }
}

function loadSessionFromFile(sessionJsonPath) {
  const raw = fs.readFileSync(sessionJsonPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Injected session JSON is empty.");
  }
  if (!parsed.access_token || !parsed.user?.id) {
    throw new Error("Injected session JSON must include access_token and user.id.");
  }
  return parsed;
}

async function injectSessionToPage(page, { session, storageKey }) {
  await page.evaluate(
    ({ key, tokenPayload }) => {
      localStorage.setItem(key, JSON.stringify(tokenPayload));
    },
    { key: storageKey, tokenPayload: session },
  );
}

const ROUTES = [
  { key: "dashboard", path: "/dashboard", skeletonTexts: ["대시보드를 준비하고 있어요..."] },
  { key: "log", path: "/log", skeletonTexts: ["기록을 불러오고 있어요..."] },
  { key: "coach", path: "/coach", skeletonTexts: [] },
  { key: "settings", path: "/settings", skeletonTexts: [] },
  { key: "dog_profile", path: "/dog/profile", skeletonTexts: ["로딩 중..."] },
];

const API_PATTERNS = [
  "/api/v1/dashboard/",
  "/api/v1/logs/",
  "/api/v1/settings/",
  "/api/v1/dogs/profile",
];

async function waitForAuthenticatedSession(page, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (page.isClosed()) {
      return { ok: false, reason: "page_closed" };
    }

    try {
      const state = await page.evaluate(() => {
        const keys = Object.keys(localStorage || {});
        const tokenKey = keys.find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
        if (!tokenKey) {
          return { ok: false, reason: "no_token_key" };
        }
        const raw = localStorage.getItem(tokenKey);
        if (!raw) {
          return { ok: false, reason: "empty_token_value" };
        }
        try {
          const parsed = JSON.parse(raw);
          const user = parsed?.user || parsed?.currentSession?.user || null;
          const accessToken = parsed?.access_token || parsed?.currentSession?.access_token || null;
          const isAnonymous = Boolean(user?.is_anonymous);
          const email = user?.email || null;
          const userId = user?.id || null;
          if (accessToken && userId && !isAnonymous) {
            return { ok: true, userId, email };
          }
          return { ok: false, reason: "session_not_authenticated", userId, email, isAnonymous };
        } catch {
          return { ok: false, reason: "token_parse_error" };
        }
      });
      if (state.ok) return state;
    } catch (err) {
      // OAuth redirect/navigation can temporarily invalidate execution context.
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("Execution context was destroyed")) {
        throw err;
      }
    }

    try {
      await page.waitForTimeout(1000);
    } catch {
      return { ok: false, reason: "page_closed" };
    }
  }
  return { ok: false, reason: "timeout" };
}

async function waitForRouteReady(page, routeKey, timeout = 30000) {
  try {
    await page.waitForFunction(
      (key) => {
        const text = document.body.innerText || "";
        const upper = text.toUpperCase();
        if (key === "dashboard") {
          const hasMainDashboard =
            upper.includes("INSIGHT DASHBOARD") && (upper.includes("TOTAL") || text.includes("누적 기록"));
          const hasNoDogState = text.includes("반려견 정보가 없습니다.") && text.includes("설문을 완료하고 맞춤형 코칭을 받아보세요.");
          const hasCoreDataRequiredState = text.includes("필수 정보가 부족합니다") && text.includes("설문 완료하기");
          const hasErrorState = text.includes("오류가 발생했습니다") && text.includes("다시 시도하기");
          return hasMainDashboard || hasNoDogState || hasCoreDataRequiredState || hasErrorState;
        }
        if (key === "log") {
          const hasTimelineTab = text.includes("타임라인");
          const hasCount = /총\s+\d+개/.test(text) && text.includes("기록이 있어요");
          const hasEmpty = text.includes("아직 기록이 없어요.");
          const isLoading = text.includes("기록을 불러오고 있어요...");
          return hasTimelineTab && !isLoading && (hasCount || hasEmpty);
        }
        if (key === "coach") {
          return text.includes("훈련 아카데미") && text.includes("모든 훈련 프로그램");
        }
        if (key === "settings") {
          return text.includes("환경 설정");
        }
        if (key === "dog_profile") {
          return text.includes("반려견 프로필");
        }
        return false;
      },
      routeKey,
      { timeout },
    );
    return { ready: true, error: null };
  } catch (err) {
    return { ready: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function createMeasurementSession({ chromium, frontendUrl, cdpUrl }) {
  if (cdpUrl) {
    const browser = await chromium.connectOverCDP(cdpUrl);
    const context = browser.contexts()[0];
    if (!context) {
      throw new Error("No browser context found on CDP target.");
    }

    const existingPages = context.pages();
    const page =
      existingPages.find((p) => {
        const url = p.url() || "";
        return url.startsWith(frontendUrl) || url === "about:blank";
      }) || (await context.newPage());

    return { browser, page, shouldCloseBrowser: false };
  }

  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    ignoreDefaultArgs: ["--enable-automation"],
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  return { browser, page, shouldCloseBrowser: true };
}

async function measureRoutes(page, frontendUrl, runs, quietWindowMs) {
  const rows = [];
  for (let i = 1; i <= runs; i += 1) {
    for (const route of ROUTES) {
      console.log(`[measure] run ${i}/${runs} route ${route.path}`);
      const startedMap = new Map();
      const apiDurations = [];
      const apiStatuses = [];
      const apiResponseAt = [];
      const apiRequestCount5s = [];
      const routeStarted = Date.now();

      const onRequest = (req) => {
        const url = req.url();
        const matched = API_PATTERNS.find((p) => url.includes(p));
        if (!matched) return;
        const now = Date.now();
        startedMap.set(req, { t: now, matched });
        if (now - routeStarted <= 5000) {
          apiRequestCount5s.push(now);
        }
      };

      const onResponse = (res) => {
        const req = res.request();
        const started = startedMap.get(req);
        if (!started) return;
        const now = Date.now();
        apiDurations.push({
          pattern: started.matched,
          ms: now - started.t,
        });
        apiStatuses.push({
          pattern: started.matched,
          status: res.status(),
        });
        apiResponseAt.push(now);
      };

      page.on("request", onRequest);
      page.on("response", onResponse);

      await page.goto(`${frontendUrl}${route.path}`, { waitUntil: "domcontentloaded", timeout: 30000 });

      let skeletonShownAt = null;
      let skeletonHiddenAt = null;
      if (route.skeletonTexts.length) {
        try {
          await page.waitForFunction(
            (texts) => texts.some((txt) => document.body.innerText.includes(txt)),
            route.skeletonTexts,
            { timeout: 5000 },
          );
          skeletonShownAt = Date.now();
        } catch {
          // no-op
        }
      }

      if (skeletonShownAt) {
        try {
          await page.waitForFunction(
            (texts) => texts.every((txt) => !document.body.innerText.includes(txt)),
            route.skeletonTexts,
            { timeout: 30000 },
          );
          skeletonHiddenAt = Date.now();
        } catch {
          // no-op
        }
      }

      const ready = await waitForRouteReady(page, route.key, 30000);
      const readyAt = ready.ready ? Date.now() : null;
      const stableCandidateAt =
        readyAt == null
          ? null
          : apiResponseAt.length
            ? Math.max(readyAt, Math.max(...apiResponseAt) + quietWindowMs)
            : readyAt;
      if (stableCandidateAt != null) {
        const waitMs = stableCandidateAt - Date.now();
        if (waitMs > 0) {
          await page.waitForTimeout(waitMs);
        }
      }

      const h1 = await page.locator("h1").first().textContent().catch(() => null);

      page.off("request", onRequest);
      page.off("response", onResponse);

      rows.push({
        run: i,
        route: route.key,
        path: route.path,
        dataReadyMs: readyAt == null ? null : readyAt - routeStarted,
        skeletonVisibleMs: skeletonShownAt == null ? null : skeletonShownAt - routeStarted,
        skeletonToDataMs: skeletonShownAt && skeletonHiddenAt ? skeletonHiddenAt - skeletonShownAt : null,
        stableUiMs: stableCandidateAt == null ? null : stableCandidateAt - routeStarted,
        apiCount5s: apiRequestCount5s.length,
        apiDurations,
        apiStatuses,
        readyTimedOut: !ready.ready,
        readyError: ready.error,
        h1Text: h1?.trim() ?? null,
      });
    }
  }
  return rows;
}

function buildMarkdownReport({ frontendUrl, userState, rows, quietWindowMs }) {
  const lines = [];
  lines.push("# App Route Baseline Report (Authenticated)");
  lines.push("");
  lines.push("## Scope");
  lines.push(`- Frontend: ${frontendUrl}`);
  lines.push(`- User: ${userState.email || userState.userId || "-"}`);
  lines.push(`- User ID: ${userState.userId || "-"}`);
  lines.push("");
  lines.push("## Routes");
  lines.push(ROUTES.map((r) => `- ${r.path}`).join("\n"));
  lines.push("");

  for (const route of ROUTES) {
    const filtered = rows.filter((r) => r.route === route.key);
    const dataReady = summarize(filtered.map((r) => r.dataReadyMs));
    const skeletonVisible = summarize(filtered.map((r) => r.skeletonVisibleMs));
    const stableUi = summarize(filtered.map((r) => r.stableUiMs));
    const apiCount5s = summarize(filtered.map((r) => r.apiCount5s));
    const timeoutCount = filtered.filter((r) => r.readyTimedOut).length;
    lines.push(`## ${route.path}`);
    lines.push(`- data-ready: min ${formatMs(dataReady.min)}, p50 ${formatMs(dataReady.p50)}, p90 ${formatMs(dataReady.p90)}, max ${formatMs(dataReady.max)}, avg ${formatMs(dataReady.avg)}`);
    lines.push(`- skeleton-visible: p50 ${formatMs(skeletonVisible.p50)}`);
    lines.push(`- stable-ui: p50 ${formatMs(stableUi.p50)}`);
    lines.push(`- api_count_5s: p50 ${apiCount5s.p50 ?? "-"} calls`);
    lines.push(`- timeout runs: ${timeoutCount}/${filtered.length}`);
    lines.push("");
  }

  lines.push("## Notes");
  lines.push("- This report is measured after authenticated session detection (manual OAuth or injected session).");
  lines.push(`- stable-ui uses quiet window ${quietWindowMs}ms after latest matched API response.`);
  lines.push("");
  return `${lines.join("\n")}\n`;
}

async function main() {
  const frontendUrl = getArg("frontend-url", "http://localhost:3002").replace(/\/+$/, "");
  const cdpUrl = getArg("cdp-url", "").trim();
  const sessionJsonPath = getArg("session-json", "").trim();
  const authStorageKeyArg = getArg("auth-storage-key", "").trim();
  const outDir = getArg(
    "out-dir",
    path.join(process.cwd(), "docs", "qa", "artifacts", todayStamp(), "live_perf_check"),
  );
  const runs = getArgInt("runs", 1);
  const quietWindowMs = getArgInt("quiet-window-ms", 600);
  const authWaitMs = getArgInt("auth-wait-ms", 180000);

  fs.mkdirSync(outDir, { recursive: true });

  console.log(`[info] frontend: ${frontendUrl}`);
  console.log(`[info] out-dir:  ${outDir}`);
  console.log(`[info] runs:     ${runs}`);
  console.log(`[info] quiet window(ms): ${quietWindowMs}`);
  console.log(`[info] auth wait timeout(ms): ${authWaitMs}`);
  if (cdpUrl) {
    console.log(`[info] cdp-url: ${cdpUrl}`);
  }
  if (sessionJsonPath) {
    console.log(`[info] session-json: ${sessionJsonPath}`);
  }

  const { chromium } = await loadPlaywright();
  const session = await createMeasurementSession({ chromium, frontendUrl, cdpUrl });
  const { browser, page, shouldCloseBrowser } = session;

  try {
    await page.goto(`${frontendUrl}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
    if (sessionJsonPath) {
      const sessionPayload = loadSessionFromFile(sessionJsonPath);
      const storageKey = authStorageKeyArg || detectDefaultAuthStorageKey();
      if (!storageKey) {
        throw new Error("Could not infer auth storage key. Pass --auth-storage-key.");
      }
      await injectSessionToPage(page, { session: sessionPayload, storageKey });
      await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
      console.log(`[action] Injected session into localStorage key=${storageKey}`);
    } else if (cdpUrl) {
      console.log("[action] Connected to existing Chrome via CDP. Please complete OAuth login in that Chrome window.");
    } else {
      console.log("[action] Opened login page. Please complete OAuth login in the opened browser window.");
    }

    const userState = await waitForAuthenticatedSession(page, authWaitMs);
    if (!userState.ok) {
      throw new Error(`Authenticated session was not detected: ${userState.reason || "unknown"}`);
    }

    console.log(`[auth] detected user=${userState.email || userState.userId || "-"}`);
    const rows = await measureRoutes(page, frontendUrl, runs, quietWindowMs);

    const rawPath = path.join(outDir, "app_route_baseline_authenticated_raw.json");
    const reportPath = path.join(outDir, "app_route_baseline_authenticated_report.md");
    const report = buildMarkdownReport({ frontendUrl, userState, rows, quietWindowMs });

    fs.writeFileSync(rawPath, JSON.stringify({ generatedAt: new Date().toISOString(), userState, rows }, null, 2));
    fs.writeFileSync(reportPath, report);

    console.log(`[done] raw: ${rawPath}`);
    console.log(`[done] report: ${reportPath}`);
  } finally {
    if (shouldCloseBrowser) {
      await browser.close();
    }
  }
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
