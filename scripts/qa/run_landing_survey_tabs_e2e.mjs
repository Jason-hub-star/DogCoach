/**
 * Landing -> Survey submit -> Dashboard tabs E2E smoke.
 * Verifies core tab features with a real browser session and writes QA artifacts.
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
  const outDirArg = getArg("out-dir", "");
  const outDir = outDirArg || path.join(process.cwd(), "docs", "qa", "artifacts", todayStamp());
  fs.mkdirSync(outDir, { recursive: true });

  const rawPath = path.join(outDir, "landing_survey_tabs_e2e_raw.json");
  const reportPath = path.join(outDir, "landing_survey_tabs_e2e_report.md");

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

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
  const dogName = `qa_tabs_${Date.now()}`;

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
      const screenshotPath = path.join(outDir, `landing_survey_tabs_e2e_fail_${steps.length + 1}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
      steps.push({
        name,
        ...fail(String(error), { screenshotPath }),
        durationMs: Date.now() - startedAt,
        url: page.url(),
      });
    }
  }

  await runStep("Landing -> Survey CTA", async () => {
    await page.goto(`${frontendUrl}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
    const cta = page.getByRole("link", { name: /무료 리포트 받기|내 대시보드로 이동/i }).first();
    if ((await cta.count()) > 0) {
      await cta.click();
    } else {
      await page.goto(`${frontendUrl}/survey`, { waitUntil: "domcontentloaded", timeout: 30000 });
    }
    await page.waitForURL(/\/survey/, { timeout: 30000 });
    return ok();
  });

  await runStep("Survey submit (7-step)", async () => {
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
    await page.waitForURL(/\/result/, { timeout: 45000 });
    return ok();
  });

  await runStep("Result -> Dashboard entry", async () => {
    await page.goto(`${frontendUrl}/dashboard`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForFunction(() => {
      const text = document.body.innerText || "";
      const upper = text.toUpperCase();
      return (
        upper.includes("INSIGHT DASHBOARD") ||
        text.includes("반려견 정보가 없습니다.") ||
        text.includes("오류가 발생했습니다")
      );
    }, { timeout: 30000 });

    const text = await page.locator("body").innerText();
    if (text.includes("Authentication required") || text.includes("오류가 발생했습니다")) {
      return fail("dashboard returned authentication error");
    }
    if (text.includes("반려견 정보가 없습니다.")) {
      return fail("dashboard landed in no_dog state");
    }
    const m = text.match(/누적 기록\s+(\d+)\s+Total/i);
    initialTotal = m ? Number(m[1]) : null;
    return ok({ initialTotalLogs: initialTotal });
  });

  await runStep("Dashboard quick log", async () => {
    await page.getByRole("button", { name: "짖음" }).first().click();
    await page.waitForFunction(() => {
      const text = document.body.innerText || "";
      return text.includes("기록이 저장되었습니다!");
    }, { timeout: 15000 });

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

  await runStep("Log tab timeline", async () => {
    await page.getByRole("link", { name: "기록 & 분석" }).click().catch(async () => {
      await page.goto(`${frontendUrl}/log`, { waitUntil: "domcontentloaded", timeout: 30000 });
    });
    await page.waitForURL(/\/log/, { timeout: 30000 });
    await page.waitForFunction(() => (document.body.innerText || "").includes("전체 기록"), { timeout: 20000 });
    const text = await page.locator("body").innerText();
    if (!text.includes("총 ") || text.includes("총 0개")) {
      return fail("timeline did not show expected log count");
    }
    return ok();
  });

  await runStep("Log tab analytics", async () => {
    await page.getByRole("button", { name: "분석 & 코칭" }).click();
    await page.waitForFunction(() => {
      const text = document.body.innerText || "";
      return text.includes("맞춤 솔루션") && text.includes("데이터 문진표 저장하기");
    }, { timeout: 25000 });
    await page.getByRole("button", { name: "맞춤 코칭 플랜 시작하기" }).first().isVisible();
    return ok();
  });

  await runStep("Coach tab", async () => {
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

  await runStep("Settings tab", async () => {
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

  await runStep("Quick-record tab open", async () => {
    await page.getByRole("link", { name: "빠른 기록하기" }).click().catch(async () => {
      await page.goto(`${frontendUrl}/dashboard?openDetailLog=1`, { waitUntil: "domcontentloaded", timeout: 30000 });
    });
    await page.waitForURL(/openDetailLog=1/, { timeout: 30000 });
    await page.waitForFunction(() => (document.body.innerText || "").includes("상세 기록 추가"), { timeout: 20000 });
    await page.keyboard.press("Escape").catch(() => {});
    return ok();
  });

  await context.close();
  await browser.close();

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
    dogName,
    status,
    passCount,
    failCount,
    steps,
    apiSummary,
  };
  fs.writeFileSync(rawPath, JSON.stringify(payload, null, 2));

  const md = `# Landing -> Survey -> Tabs E2E Report

- Frontend: ${frontendUrl}
- Generated at: ${payload.generatedAt}
- Overall: **${status}**
- Steps: ${passCount} passed / ${failCount} failed

## Step Results
${steps.map((s, i) => `${i + 1}. [${s.status}] ${s.name} (${s.durationMs}ms)${s.reason ? ` - ${s.reason}` : ""}`).join("\n")}

## API Summary
${Object.entries(apiSummary).length ? Object.entries(apiSummary).map(([k, v]) => `- ${k}: ${v}`).join("\n") : "- (no /api/v1 traffic captured)"}
`;
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
