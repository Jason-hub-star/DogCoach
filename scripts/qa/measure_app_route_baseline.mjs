#!/usr/bin/env node
// Measures landing -> app route baseline timing for guest flow.
// Seeds a guest dog, injects anonymous cookie, and records route-level render timing.

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
    name: `qa_route_${unique}`,
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

const ROUTES = [
  {
    key: "dashboard",
    path: "/dashboard",
    skeletonTexts: ["대시보드를 준비하고 있어요..."],
  },
  {
    key: "log",
    path: "/log",
    skeletonTexts: ["기록을 불러오고 있어요..."],
  },
  {
    key: "coach",
    path: "/coach",
    skeletonTexts: [],
  },
  {
    key: "settings",
    path: "/settings",
    skeletonTexts: [],
  },
  {
    key: "dog_profile",
    path: "/dog/profile",
    skeletonTexts: ["로딩 중..."],
  },
];

const API_PATTERNS = [
  "/api/v1/dashboard/",
  "/api/v1/logs/",
  "/api/v1/settings/",
  "/api/v1/dogs/profile",
];

async function measureRouteSet({
  chromium,
  frontendUrl,
  backendUrl,
  cookie,
  runs,
  formFactor,
  quietWindowMs,
  contextOptions = {},
}) {
  const backendHost = new URL(backendUrl).hostname;
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const rows = [];

  for (let run = 1; run <= runs; run += 1) {
    for (const route of ROUTES) {
      console.log(`[run] ${formFactor} ${route.key} ${run}/${runs}`);
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
          sameSite: "None",
        },
      ]);

      const page = await context.newPage();
      const startedMap = new Map();
      const apiDurations = [];
      const apiStatuses = [];
      const apiResponseAt = [];
      const apiRequestCount5s = [];
      let routeStartedAt = 0;

      page.on("request", (req) => {
        const url = req.url();
        const matched = API_PATTERNS.find((p) => url.includes(p));
        if (matched) {
          const now = Date.now();
          startedMap.set(req, { t: now, matched });
          if (routeStartedAt > 0 && now - routeStartedAt <= 5000) {
            apiRequestCount5s.push(now);
          }
        }
      });

      page.on("response", (res) => {
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
      });

      await page.goto(`${frontendUrl}/`, { waitUntil: "domcontentloaded" });

      const tRouteStart = Date.now();
      routeStartedAt = tRouteStart;
      await page.goto(`${frontendUrl}${route.path}`, { waitUntil: "domcontentloaded" });

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

      let readyTimedOut = false;
      let readyError = null;
      try {
        await page.waitForFunction(
          (routeKey) => {
            const text = document.body.innerText || "";
            const upper = text.toUpperCase();
            if (routeKey === "dashboard") {
              const hasHeader = upper.includes("INSIGHT DASHBOARD");
              const hasStats = upper.includes("TOTAL") || text.includes("누적 기록");
              const hasDogLink = Boolean(document.querySelector('a[href="/dog/profile"]'));
              return hasHeader && hasStats && hasDogLink;
            }
            if (routeKey === "log") {
              const hasTimelineTab = text.includes("타임라인");
              const hasCount = /총\s+\d+개/.test(text) && text.includes("기록이 있어요");
              const hasEmpty = text.includes("아직 기록이 없어요.");
              const isLoading = text.includes("기록을 불러오고 있어요...");
              return hasTimelineTab && !isLoading && (hasCount || hasEmpty);
            }
            if (routeKey === "coach") {
              return text.includes("훈련 아카데미") && text.includes("모든 훈련 프로그램");
            }
            if (routeKey === "settings") {
              return text.includes("환경 설정");
            }
            if (routeKey === "dog_profile") {
              return text.includes("반려견 프로필") && (text.includes("등록된 반려견이 없습니다") || text.includes("Profile"));
            }
            return false;
          },
          route.key,
          { timeout: 30000 },
        );
      } catch (err) {
        readyTimedOut = true;
        readyError = err instanceof Error ? err.message : String(err);
      }

      const tDataReady = readyTimedOut ? null : Date.now();
      const tStableCandidate =
        tDataReady == null
          ? null
          : apiResponseAt.length
            ? Math.max(tDataReady, Math.max(...apiResponseAt) + quietWindowMs)
            : tDataReady;
      const stableUiMs = tStableCandidate == null ? null : tStableCandidate - tRouteStart;
      if (tStableCandidate != null) {
        const waitMs = tStableCandidate - Date.now();
        if (waitMs > 0) {
          await page.waitForTimeout(waitMs);
        }
      }
      const routeState = await page.evaluate((routeKey) => {
        const text = document.body.innerText || "";
        const upper = text.toUpperCase();
        if (routeKey === "dashboard") {
          const hasHeader = upper.includes("INSIGHT DASHBOARD");
          const hasStats = upper.includes("TOTAL") || text.includes("누적 기록");
          const hasDogLink = Boolean(document.querySelector('a[href="/dog/profile"]'));
          if (hasHeader && hasStats && hasDogLink) return "dashboard_loaded";
          return "dashboard_not_ready";
        }
        if (routeKey === "log") {
          if (text.includes("타임라인") && text.includes("기록")) return "log_loaded";
          return "log_not_ready";
        }
        if (routeKey === "coach") {
          if (text.includes("훈련 아카데미")) return "coach_loaded";
          return "coach_not_ready";
        }
        if (routeKey === "settings") {
          if (text.includes("환경 설정")) return "settings_loaded";
          return "settings_not_ready";
        }
        if (routeKey === "dog_profile") {
          if (text.includes("반려견 프로필")) return "dog_profile_loaded";
          return "dog_profile_not_ready";
        }
        return "unknown";
      }, route.key);
      const h1Text = await page.locator("h1").first().textContent().catch(() => null);

      rows.push({
        formFactor,
        route: route.key,
        path: route.path,
        run,
        dataReadyMs: tDataReady == null ? null : tDataReady - tRouteStart,
        skeletonVisibleMs: skeletonShownAt == null ? null : skeletonShownAt - tRouteStart,
        stableUiMs,
        skeletonToDataMs: skeletonShownAt && skeletonHiddenAt ? skeletonHiddenAt - skeletonShownAt : null,
        skeletonDetected: Boolean(skeletonShownAt),
        apiCount5s: apiRequestCount5s.length,
        apiDurations,
        apiStatuses,
        h1Text: h1Text?.trim() ?? null,
        routeState,
        readyTimedOut,
        readyError,
      });

      await context.close();
    }
  }

  await browser.close();
  return rows;
}

function aggregateByRoute(rows, formFactor) {
  const out = {};
  for (const route of ROUTES) {
    const filtered = rows.filter((r) => r.formFactor === formFactor && r.route === route.key);
    out[route.key] = {
      dataReady: summarize(filtered.map((r) => r.dataReadyMs)),
      skeletonVisible: summarize(filtered.map((r) => r.skeletonVisibleMs)),
      stableUi: summarize(filtered.map((r) => r.stableUiMs)),
      skeletonToData: summarize(filtered.map((r) => r.skeletonToDataMs)),
      skeletonDetectedRuns: filtered.filter((r) => r.skeletonDetected).length,
      timeoutRuns: filtered.filter((r) => r.readyTimedOut).length,
      totalRuns: filtered.length,
      apiCount5s: summarize(filtered.map((r) => r.apiCount5s)),
    };
  }
  return out;
}

function buildMarkdownReport({ frontendUrl, backendUrl, seedResponse, rows, quietWindowMs }) {
  const desktop = aggregateByRoute(rows, "desktop");
  const mobile = aggregateByRoute(rows, "mobile");

  const lines = [];
  lines.push("# App Route Baseline Report (Guest)");
  lines.push("");
  lines.push("## Scope");
  lines.push(`- Frontend: ${frontendUrl}`);
  lines.push(`- Backend: ${backendUrl}`);
  lines.push(`- Seeded dog id: ${seedResponse?.id ?? "-"}`);
  lines.push("");
  lines.push("## Routes");
  lines.push(ROUTES.map((r) => `- ${r.path} (${r.key})`).join("\n"));
  lines.push("");

  for (const route of ROUTES) {
    const d = desktop[route.key];
    const m = mobile[route.key];
    lines.push(`## ${route.path}`);
    lines.push(`- Desktop data-ready: min ${formatMs(d.dataReady.min)}, p50 ${formatMs(d.dataReady.p50)}, p90 ${formatMs(d.dataReady.p90)}, max ${formatMs(d.dataReady.max)}, avg ${formatMs(d.dataReady.avg)}`);
    lines.push(`- Mobile data-ready: min ${formatMs(m.dataReady.min)}, p50 ${formatMs(m.dataReady.p50)}, p90 ${formatMs(m.dataReady.p90)}, max ${formatMs(m.dataReady.max)}, avg ${formatMs(m.dataReady.avg)}`);
    lines.push(`- Desktop skeleton-visible: p50 ${formatMs(d.skeletonVisible.p50)}`);
    lines.push(`- Mobile skeleton-visible: p50 ${formatMs(m.skeletonVisible.p50)}`);
    lines.push(`- Desktop stable-ui: p50 ${formatMs(d.stableUi.p50)}`);
    lines.push(`- Mobile stable-ui: p50 ${formatMs(m.stableUi.p50)}`);
    lines.push(`- Desktop skeleton->data: detected ${d.skeletonDetectedRuns}/${d.totalRuns}, p50 ${formatMs(d.skeletonToData.p50)}`);
    lines.push(`- Mobile skeleton->data: detected ${m.skeletonDetectedRuns}/${m.totalRuns}, p50 ${formatMs(m.skeletonToData.p50)}`);
    lines.push(`- Timeout runs: desktop ${d.timeoutRuns}/${d.totalRuns}, mobile ${m.timeoutRuns}/${m.totalRuns}`);
    lines.push(`- Desktop api_count_5s p50: ${d.apiCount5s.p50 ?? "-"} calls`);
    lines.push(`- Mobile api_count_5s p50: ${m.apiCount5s.p50 ?? "-"} calls`);
    lines.push("");
  }

  lines.push("## Notes");
  lines.push("- Guest flow only (anonymous cookie 기반).");
  lines.push(`- stable-ui uses quiet window ${quietWindowMs}ms after latest matched API response.`);
  lines.push("- Authenticated flow baseline은 별도 계정/토큰 기반 측정이 추가로 필요.");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

async function main() {
  const frontendUrl = getArg("frontend-url", "https://www.mungai.co.kr").replace(/\/+$/, "");
  const backendUrl = getArg("backend-url", "https://backend-production-61c6.up.railway.app").replace(/\/+$/, "");
  const outDir = getArg(
    "out-dir",
    path.join(process.cwd(), "docs", "qa", "artifacts", todayStamp(), "live_perf_check"),
  );
  const runs = getArgInt("runs", 1);
  const quietWindowMs = getArgInt("quiet-window-ms", 600);

  fs.mkdirSync(outDir, { recursive: true });
  console.log(`[info] frontend: ${frontendUrl}`);
  console.log(`[info] backend:  ${backendUrl}`);
  console.log(`[info] out-dir:  ${outDir}`);
  console.log(`[info] runs per form factor: ${runs}`);
  console.log(`[info] quiet window(ms): ${quietWindowMs}`);

  const { chromium, devices } = await loadPlaywright();
  const seeded = await seedGuestAndGetCookie(backendUrl);
  console.log(`[seed] dog_id=${seeded.seedResponse?.id ?? "-"}`);

  const desktopRows = await measureRouteSet({
    chromium,
    frontendUrl,
    backendUrl,
    cookie: seeded.cookie,
    runs,
    formFactor: "desktop",
    quietWindowMs,
    contextOptions: {},
  });

  const mobileRows = await measureRouteSet({
    chromium,
    frontendUrl,
    backendUrl,
    cookie: seeded.cookie,
    runs,
    formFactor: "mobile",
    quietWindowMs,
    contextOptions: devices["iPhone 13"],
  });

  const rows = [...desktopRows, ...mobileRows];
  const report = buildMarkdownReport({
    frontendUrl,
    backendUrl,
    seedResponse: seeded.seedResponse,
    rows,
    quietWindowMs,
  });

  const rawPath = path.join(outDir, "app_route_baseline_raw.json");
  const reportPath = path.join(outDir, "app_route_baseline_report.md");
  fs.writeFileSync(rawPath, JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2));
  fs.writeFileSync(reportPath, report);

  console.log(`[done] raw: ${rawPath}`);
  console.log(`[done] report: ${reportPath}`);
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
