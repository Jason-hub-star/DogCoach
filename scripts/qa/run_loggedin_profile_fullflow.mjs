/**
 * Logged-in profile reuse E2E for TailLog production.
 * Reuses existing Chrome user data dir session to verify login->app full flow.
 */
import fs from "node:fs";
import path from "node:path";

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function getArg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const fallback = path.join(process.cwd(), "Frontend", "node_modules", "playwright", "index.mjs");
    return await import(fallback);
  }
}

function ok(details = {}) {
  return { status: "PASS", details };
}

function fail(reason, details = {}) {
  return { status: "FAIL", reason, details };
}

async function run() {
  const frontendUrl = (getArg("frontend-url", "https://www.mungai.co.kr") || "").replace(/\/+$/, "");
  const backendUrl = (getArg("backend-url", "https://backend-production-61c6.up.railway.app") || "").replace(/\/+$/, "");
  const defaultProfileDir = path.join(process.env.HOME || "/Users/family", "Library", "Caches", "ms-playwright", "mcp-chrome-8a5edab");
  const profileDir = getArg("profile-dir", defaultProfileDir);
  const outDirArg = getArg("out-dir", "");
  const outDir = outDirArg || path.join(process.cwd(), "docs", "qa", "artifacts", todayStamp(), "p0p1_parallel", "e2e_loggedin_profile");
  fs.mkdirSync(outDir, { recursive: true });

  const rawPath = path.join(outDir, "loggedin_profile_fullflow_raw.json");
  const reportPath = path.join(outDir, "loggedin_profile_fullflow_report.md");

  const { chromium } = await loadPlaywright();
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: true,
    channel: "chrome",
    viewport: { width: 1440, height: 900 },
  });
  const page = context.pages()[0] || (await context.newPage());

  const network = [];
  page.on("response", async (res) => {
    const url = res.url();
    if (!url.includes("/api/v1/")) return;
    network.push({
      url,
      status: res.status(),
      method: res.request().method(),
      ts: Date.now(),
    });
  });

  const steps = [];
  let initialTotal = null;
  const dogName = `qa_loggedin_${Date.now()}`;

  async function runStep(name, fn) {
    const startedAt = Date.now();
    try {
      const result = await fn();
      steps.push({
        name,
        ...result,
        durationMs: Date.now() - startedAt,
        url: page.url(),
      });
    } catch (error) {
      const screenshotPath = path.join(outDir, `loggedin_profile_fail_${steps.length + 1}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
      steps.push({
        name,
        ...fail(String(error), { screenshotPath }),
        durationMs: Date.now() - startedAt,
        url: page.url(),
      });
    }
  }

  await runStep("Session present and API token valid (or onboarding-needed)", async () => {
    await page.goto(`${frontendUrl}/`, { waitUntil: "domcontentloaded", timeout: 45000 });

    const authState = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const key = keys.find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
      if (!key) return { found: false };
      const raw = localStorage.getItem(key);
      if (!raw) return { found: false, key };
      try {
        const parsed = JSON.parse(raw);
        const accessToken = parsed?.access_token || parsed?.currentSession?.access_token || parsed?.session?.access_token || null;
        const user = parsed?.user || parsed?.currentSession?.user || parsed?.session?.user || null;
        return {
          found: !!accessToken,
          key,
          accessToken,
          email: user?.email || null,
          uid: user?.id || null,
        };
      } catch {
        return { found: false, key, parseError: true };
      }
    });

    if (!authState?.found || !authState?.accessToken) {
      return fail("supabase auth token not found in profile localStorage", { profileDir });
    }

    const meResp = await fetch(`${backendUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${authState.accessToken}` },
    });
    const authMeStatus = meResp.status;

    if (![200, 404].includes(authMeStatus)) {
      return fail(`unexpected /auth/me status=${authMeStatus}`, {
        authMeStatus,
        email: authState.email,
        uid: authState.uid,
      });
    }

    return ok({ email: authState.email, uid: authState.uid, authMeStatus });
  });

  await runStep("/login redirect with logged-in session", async () => {
    await page.goto(`${frontendUrl}/login`, { waitUntil: "domcontentloaded", timeout: 45000 });

    try {
      await page.waitForURL((url) => {
        const href = url.toString();
        return href.includes("/dashboard") || href.includes("/survey") || href.includes("/result");
      }, { timeout: 20000 });
    } catch {
      const now = page.url();
      if (now.includes("/login")) {
        return fail("not redirected to dashboard/survey", { currentUrl: now });
      }
    }

    return ok({ redirectedTo: page.url() });
  });

  await runStep("Complete survey as logged-in user if needed", async () => {
    if (!page.url().includes("/survey")) {
      return ok({ skipped: true, reason: "current route is not /survey" });
    }

    await page.getByPlaceholder("예: 머루").fill(dogName);
    await page.getByPlaceholder("견종 검색 또는 입력...").fill("믹스");
    await page.keyboard.press("Escape");
    await page.locator("body").click({ position: { x: 40, y: 40 } });
    await page.getByRole("button", { name: "다음 단계로" }).click({ force: true });
    await page.getByRole("button", { name: "다음 단계로" }).click({ force: true });
    await page.getByRole("button", { name: "다음 단계로" }).click({ force: true });
    const skipKakao = page.getByRole("button", { name: "그냥 계속 진행할게요" });
    if ((await skipKakao.count()) > 0) {
      await skipKakao.click();
    }
    await page.getByRole("button", { name: /짖음 \/ 하울링/ }).click();
    await page.getByRole("button", { name: "다음 단계로" }).click({ force: true });
    await page.getByRole("button", { name: /초인종 \/ 노크 소리/ }).click();
    await page.getByRole("button", { name: "다음 단계로" }).click({ force: true });
    await page.getByRole("button", { name: "다음 단계로" }).click({ force: true });
    await page.getByRole("button", { name: "심층 분석 시작하기" }).click({ force: true });
    await page.waitForURL(/\/result/, { timeout: 60000 });

    return ok();
  });

  await runStep("Result -> Dashboard load", async () => {
    await page.goto(`${frontendUrl}/dashboard`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForFunction(() => {
      const text = document.body.innerText || "";
      const upper = text.toUpperCase();
      return (
        upper.includes("INSIGHT DASHBOARD") ||
        text.includes("반려견 정보가 없습니다.") ||
        text.includes("오류가 발생했습니다") ||
        text.includes("Authentication required")
      );
    }, { timeout: 30000 });

    const text = await page.locator("body").innerText();
    if (text.includes("Authentication required") || text.includes("오류가 발생했습니다")) {
      return fail("dashboard auth/error", {});
    }
    if (text.includes("반려견 정보가 없습니다.")) {
      return fail("dashboard no_dog state", {});
    }

    const m = text.match(/누적 기록\s+(\d+)\s+Total/i);
    initialTotal = m ? Number(m[1]) : null;
    return ok({ initialTotalLogs: initialTotal });
  });

  await runStep("Dashboard quick log create", async () => {
    await page.getByRole("button", { name: "짖음" }).first().click({ timeout: 20000 });
    await page.waitForFunction(() => {
      const text = document.body.innerText || "";
      return text.includes("기록이 저장되었습니다!");
    }, { timeout: 20000 });

    if (Number.isFinite(initialTotal)) {
      await page.waitForFunction((prev) => {
        const text = document.body.innerText || "";
        const match = text.match(/누적 기록\s+(\d+)\s+Total/i);
        if (!match) return false;
        return Number(match[1]) >= prev + 1;
      }, initialTotal, { timeout: 20000 });
    }

    return ok();
  });

  await runStep("Log tab timeline + analytics", async () => {
    await page.getByRole("link", { name: "기록 & 분석" }).click().catch(async () => {
      await page.goto(`${frontendUrl}/log`, { waitUntil: "domcontentloaded", timeout: 30000 });
    });
    await page.waitForURL(/\/log/, { timeout: 30000 });
    await page.waitForFunction(() => (document.body.innerText || "").includes("전체 기록"), { timeout: 20000 });

    const text = await page.locator("body").innerText();
    if (!text.includes("총 ") || text.includes("총 0개")) {
      return fail("timeline did not show expected log count");
    }

    await page.getByRole("button", { name: "분석 & 코칭" }).click();
    await page.waitForFunction(() => {
      const t = document.body.innerText || "";
      return t.includes("맞춤 솔루션") && t.includes("데이터 문진표 저장하기");
    }, { timeout: 25000 });

    return ok();
  });

  await runStep("Coach tab open", async () => {
    await page.getByRole("link", { name: "AI 코칭" }).click().catch(async () => {
      await page.goto(`${frontendUrl}/coach`, { waitUntil: "domcontentloaded", timeout: 30000 });
    });
    await page.waitForURL(/\/coach/, { timeout: 30000 });
    await page.waitForFunction(() => {
      const text = document.body.innerText || "";
      return text.includes("훈련 아카데미") && text.includes("모든 훈련 프로그램");
    }, { timeout: 25000 });
    return ok();
  });

  await runStep("Settings tab open", async () => {
    await page.getByRole("link", { name: "설정" }).click().catch(async () => {
      await page.goto(`${frontendUrl}/settings`, { waitUntil: "domcontentloaded", timeout: 30000 });
    });
    await page.waitForURL(/\/settings/, { timeout: 30000 });
    await page.waitForFunction(() => {
      const text = document.body.innerText || "";
      return text.includes("환경 설정") && text.includes("앱 정보");
    }, { timeout: 20000 });
    return ok();
  });

  await context.close();

  const passCount = steps.filter((s) => s.status === "PASS").length;
  const failCount = steps.length - passCount;
  const status = failCount === 0 ? "PASS" : "FAIL";
  const apiSummary = network.reduce((acc, n) => {
    const key = `${n.method} ${new URL(n.url).pathname} ${n.status}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const payload = {
    generatedAt: new Date().toISOString(),
    frontendUrl,
    backendUrl,
    profileDir,
    status,
    passCount,
    failCount,
    steps,
    apiSummary,
  };
  fs.writeFileSync(rawPath, JSON.stringify(payload, null, 2));

  const md = `# Logged-in Profile Full Flow Report\n\n- Frontend: ${frontendUrl}\n- Backend: ${backendUrl}\n- Profile: ${profileDir}\n- Generated at: ${payload.generatedAt}\n- Overall: **${status}**\n- Steps: ${passCount} passed / ${failCount} failed\n\n## Step Results\n${steps.map((s, i) => `${i + 1}. [${s.status}] ${s.name} (${s.durationMs}ms)${s.reason ? ` - ${s.reason}` : ""}`).join("\n")}\n\n## API Summary\n${Object.entries(apiSummary).length ? Object.entries(apiSummary).map(([k, v]) => `- ${k}: ${v}`).join("\n") : "- (no /api/v1 traffic captured)"}\n`;
  fs.writeFileSync(reportPath, md);

  console.log(`[done] Raw: ${rawPath}`);
  console.log(`[done] Report: ${reportPath}`);
  console.log(`[done] Overall: ${status} (${passCount} pass / ${failCount} fail)`);

  if (status === "FAIL") process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
