/**
 * P1 batch3 gap-fill checks for TailLog production.
 * Fills remaining P1 gaps around auth/me 404 interpretation and no-dog handling.
 */
import fs from "node:fs";
import path from "node:path";

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
    return await import("playwright");
  } catch {
    const fallback = path.join(process.cwd(), "Frontend", "node_modules", "playwright", "index.mjs");
    return await import(fallback);
  }
}

function statusPass(note = "", details = {}) {
  return { status: "PASS", note, details };
}

function statusPartial(note = "", details = {}) {
  return { status: "PARTIAL", note, details };
}

function statusFail(note = "", details = {}) {
  return { status: "FAIL", note, details };
}

function statusBlocked(note = "", details = {}) {
  return { status: "BLOCKED", note, details };
}

async function main() {
  const frontendUrl = (getArg("frontend-url", "https://www.mungai.co.kr") || "").replace(/\/+$/, "");
  const backendUrl = (getArg("backend-url", "https://backend-production-61c6.up.railway.app") || "").replace(/\/+$/, "");
  const profileDir = getArg("profile-dir", path.join(process.cwd(), "tmp_qa_profile_snapshot"));
  const outDir = getArg(
    "out-dir",
    path.join(process.cwd(), "docs", "qa", "artifacts", todayStamp(), "p1_parallel_run", "batch3_gap_fill")
  );
  fs.mkdirSync(outDir, { recursive: true });

  const rawPath = path.join(outDir, "p1_batch3_gap_fill_raw.json");
  const reportPath = path.join(outDir, "p1_batch3_gap_fill_report.md");

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
    channel: "chrome",
    viewport: { width: 1440, height: 900 },
  });
  const page = persistent.pages()[0] || (await persistent.newPage());

  await page.goto(`${frontendUrl}/`, { waitUntil: "domcontentloaded", timeout: 45000 });

  const authState = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
    if (!key) return { hasToken: false, key: null, token: null };
    const raw = localStorage.getItem(key);
    if (!raw) return { hasToken: false, key, token: null };
    try {
      const parsed = JSON.parse(raw);
      const token =
        parsed?.access_token ||
        parsed?.session?.access_token ||
        parsed?.currentSession?.access_token ||
        null;
      return { hasToken: !!token, key, token };
    } catch {
      return { hasToken: false, key, token: null };
    }
  });

  async function withRoute(pattern, status, bodyObj, fn) {
    await persistent.route(pattern, async (route) => {
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(bodyObj),
      });
    });
    try {
      return await fn();
    } finally {
      await persistent.unroute(pattern).catch(() => {});
    }
  }

  // AUTH-08
  await runCase("AUTH-08", "/auth/me 404 should be interpreted as onboarding-needed", async () => {
    if (!authState.hasToken) return statusBlocked("logged-in token missing in profile");
    return await withRoute(
      "**/api/v1/auth/me",
      404,
      { detail: "User profile not found. Please complete onboarding." },
      async () => {
        const p = await persistent.newPage();
        await p.goto(`${frontendUrl}/login`, { waitUntil: "domcontentloaded", timeout: 45000 });
        await p.waitForURL(/\/survey/, { timeout: 30000 });
        const url = p.url();
        await p.close();
        return statusPass("404 from /auth/me routed to /survey", { url });
      }
    );
  });

  // AUTH-11
  await runCase("AUTH-11", "Valid token but no profile should start onboarding survey", async () => {
    if (!authState.hasToken) return statusBlocked("logged-in token missing in profile");
    return await withRoute(
      "**/api/v1/auth/me",
      404,
      { detail: "User profile not found. Please complete onboarding." },
      async () => {
        const p = await persistent.newPage();
        await p.goto(`${frontendUrl}/login`, { waitUntil: "domcontentloaded", timeout: 45000 });
        await p.waitForURL(/\/survey/, { timeout: 30000 });
        await p.waitForFunction(() => {
          const t = document.body.innerText || "";
          return (
            t.includes("다음 단계로") ||
            t.includes("반려견") ||
            t.includes("설문")
          );
        }, { timeout: 30000 });
        const url = p.url();
        await p.close();
        return statusPass("login session with profile-missing branch reached survey step", { url });
      }
    );
  });

  // SURVEY-02 (no-profile branch)
  await runCase("SURVEY-02", "Logged-in /survey should remain survey when profile missing", async () => {
    if (!authState.hasToken) return statusBlocked("logged-in token missing in profile");
    return await withRoute(
      "**/api/v1/auth/me",
      404,
      { detail: "User profile not found. Please complete onboarding." },
      async () => {
        const p = await persistent.newPage();
        await p.goto(`${frontendUrl}/survey`, { waitUntil: "domcontentloaded", timeout: 45000 });
        await p.waitForURL(/\/survey/, { timeout: 30000 });
        await p.waitForFunction(() => {
          const t = document.body.innerText || "";
          return t.includes("다음 단계로") || t.includes("반려견");
        }, { timeout: 30000 });
        const url = p.url();
        await p.close();
        return statusPass("logged-in survey route stayed on onboarding flow under profile-missing branch", { url });
      }
    );
  });

  // NET-15
  await runCase("NET-15", "404 body from /auth/me should drive profile-missing interpretation", async () => {
    if (!authState.hasToken) return statusBlocked("logged-in token missing in profile");
    return await withRoute(
      "**/api/v1/auth/me",
      404,
      { detail: "User profile not found. Please complete onboarding." },
      async () => {
        const p = await persistent.newPage();
        await p.goto(`${frontendUrl}/auth/callback`, { waitUntil: "domcontentloaded", timeout: 45000 });
        await p.waitForURL(/\/survey/, { timeout: 30000 });
        const url = p.url();
        await p.close();
        return statusPass("callback interpreted auth/me 404 as onboarding-needed and routed to survey", { url });
      }
    );
  });

  // AUTH-12
  await runCase("AUTH-12", "Valid token + dashboard no-dog branch should not hard-freeze", async () => {
    if (!authState.hasToken) return statusBlocked("logged-in token missing in profile");
    return await withRoute(
      "**/api/v1/dashboard/",
      404,
      { detail: "No dog profile found. Please complete the survey." },
      async () => {
        const p = await persistent.newPage();
        await p.goto(`${frontendUrl}/dashboard`, { waitUntil: "domcontentloaded", timeout: 45000 });
        await p.waitForFunction(() => {
          const t = document.body.innerText || "";
          return (
            t.includes("오류가 발생했습니다") ||
            t.includes("반려견 정보가 없습니다") ||
            t.includes("설문")
          );
        }, { timeout: 30000 });
        const text = await p.locator("body").innerText();
        await p.close();

        if (text.includes("반려견 정보가 없습니다") || text.includes("설문을 완료")) {
          return statusPass("dashboard rendered onboarding/no-dog guidance under 404", {});
        }
        if (text.includes("오류가 발생했습니다")) {
          return statusPartial("dashboard did not freeze, but showed generic error instead of no-dog onboarding UX", {});
        }
        return statusFail("unexpected dashboard state for no-dog 404");
      }
    );
  });

  // DASH-11
  await runCase("DASH-11", "/dogs/profile 404 should be handled without crash", async () => {
    if (!authState.hasToken) return statusBlocked("logged-in token missing in profile");
    return await withRoute(
      "**/api/v1/dogs/profile",
      404,
      { detail: "No dog found" },
      async () => {
        const p = await persistent.newPage();
        await p.goto(`${frontendUrl}/dog/profile`, { waitUntil: "domcontentloaded", timeout: 45000 });
        await p.waitForFunction(() => {
          const t = document.body.innerText || "";
          return t.includes("등록된 반려견이 없습니다") || t.includes("설문 시작하기");
        }, { timeout: 30000 });
        const text = await p.locator("body").innerText();
        await p.close();

        if (text.includes("등록된 반려견이 없습니다") && text.includes("설문 시작하기")) {
          return statusPass("dog profile page gracefully handled 404 and exposed onboarding CTA");
        }
        return statusFail("dog profile page did not render graceful no-dog fallback");
      }
    );
  });

  await persistent.close();

  const summary = caseResults.reduce(
    (acc, cur) => {
      const key = cur.status || "UNKNOWN";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    { PASS: 0, PARTIAL: 0, FAIL: 0, BLOCKED: 0 }
  );

  const payload = {
    generatedAt: new Date().toISOString(),
    frontendUrl,
    backendUrl,
    profileDir,
    summary,
    cases: caseResults,
  };
  fs.writeFileSync(rawPath, JSON.stringify(payload, null, 2), "utf8");

  const lines = [];
  lines.push("# P1 Batch3 Gap-Fill Report");
  lines.push("");
  lines.push(`- Frontend: ${frontendUrl}`);
  lines.push(`- Backend: ${backendUrl}`);
  lines.push(`- Profile: ${profileDir}`);
  lines.push(`- Generated at: ${payload.generatedAt}`);
  lines.push("");
  lines.push("## Summary");
  lines.push(`- PASS: ${summary.PASS || 0}`);
  lines.push(`- PARTIAL: ${summary.PARTIAL || 0}`);
  lines.push(`- FAIL: ${summary.FAIL || 0}`);
  lines.push(`- BLOCKED: ${summary.BLOCKED || 0}`);
  lines.push("");
  lines.push("## Cases");
  caseResults.forEach((c, idx) => {
    lines.push(`${idx + 1}. ${c.caseId} [${c.status}] ${c.title} (${c.durationMs}ms) - ${c.note || ""}`.trim());
  });
  lines.push("");
  lines.push("## Artifacts");
  lines.push(`- Raw JSON: \`${path.basename(rawPath)}\``);
  lines.push(`- This report: \`${path.basename(reportPath)}\``);

  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");

  console.log(`[done] Summary: PASS=${summary.PASS || 0}, PARTIAL=${summary.PARTIAL || 0}, FAIL=${summary.FAIL || 0}, BLOCKED=${summary.BLOCKED || 0}`);
  console.log(`[done] raw: ${rawPath}`);
  console.log(`[done] report: ${reportPath}`);
}

main().catch((error) => {
  console.error("[fatal]", error);
  process.exit(1);
});
