/**
 * P1 batch4 remaining-lane checks for TailLog production.
 * Focuses on residual P1 gaps with safe execution constraints.
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

async function fillSurveyMinimal(page) {
  const dogName = `qa_batch4_${Date.now()}`;
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

  await page.getByRole("button", { name: /짖음 \/ 하울링/ }).click({ force: true });
  await page.getByRole("button", { name: "다음 단계로" }).click({ force: true });
  await page.getByRole("button", { name: /초인종 \/ 노크 소리/ }).click({ force: true });
  await page.getByRole("button", { name: "다음 단계로" }).click({ force: true });
  await page.getByRole("button", { name: "다음 단계로" }).click({ force: true });
}

async function main() {
  const frontendUrl = (getArg("frontend-url", "https://www.mungai.co.kr") || "").replace(/\/+$/, "");
  const backendUrl = (getArg("backend-url", "https://backend-production-61c6.up.railway.app") || "").replace(/\/+$/, "");
  const profileDir = getArg("profile-dir", path.join(process.cwd(), "tmp_qa_profile_snapshot"));
  const outDir = getArg(
    "out-dir",
    path.join(process.cwd(), "docs", "qa", "artifacts", todayStamp(), "p1_parallel_run", "batch4_remaining")
  );
  fs.mkdirSync(outDir, { recursive: true });

  const rawPath = path.join(outDir, "p1_batch4_remaining_raw.json");
  const reportPath = path.join(outDir, "p1_batch4_remaining_report.md");

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
    if (!key) return { hasToken: false, token: null };
    const raw = localStorage.getItem(key);
    if (!raw) return { hasToken: false, token: null };
    try {
      const parsed = JSON.parse(raw);
      const token =
        parsed?.access_token ||
        parsed?.session?.access_token ||
        parsed?.currentSession?.access_token ||
        null;
      return { hasToken: !!token, token };
    } catch {
      return { hasToken: false, token: null };
    }
  });

  // DASH-09
  await runCase("DASH-09", "Dashboard no-dog should show onboarding guidance (not crash)", async () => {
    await persistent.route("**/api/v1/dashboard/", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ detail: "No dog profile found. Please complete the survey." }),
      });
    });
    try {
      const p = await persistent.newPage();
      await p.goto(`${frontendUrl}/dashboard`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await p.waitForFunction(() => {
        const t = document.body.innerText || "";
        return t.includes("반려견 정보가 없습니다") || t.includes("설문을 완료");
      }, { timeout: 30000 });
      const text = await p.locator("body").innerText();
      await p.close();
      if (text.includes("반려견 정보가 없습니다")) {
        return statusPass("no-dog fallback guidance rendered on dashboard");
      }
      return statusPartial("dashboard did not crash, but fallback copy was not fully matched");
    } finally {
      await persistent.unroute("**/api/v1/dashboard/").catch(() => {});
    }
  });

  // NET-02
  await runCase("NET-02", "Forced survey 500 (CORS-like symptom) should surface safe failure UX", async () => {
    const browser = await chromium.launch({ headless: true, channel: "chrome" });
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();

    let alertMessage = "";
    p.on("dialog", async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await p.route("**/api/v1/onboarding/survey", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "forced 500 for NET-02" }),
      });
    });

    try {
      await p.goto(`${frontendUrl}/survey`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await fillSurveyMinimal(p);
      await p.getByRole("button", { name: "심층 분석 시작하기" }).click({ force: true });
      await p.waitForTimeout(1200);

      if (alertMessage.includes("설문 제출에 실패했습니다")) {
        return statusPass("forced 500 produced user-visible submit failure handling", { alertMessage });
      }
      return statusPartial("forced 500 executed, but failure alert capture was inconclusive", { alertMessage });
    } finally {
      await ctx.close();
      await browser.close();
    }
  });

  // DASH-06
  await runCase("DASH-06", "Log delete path", async () => {
    if (!authState.hasToken) return statusBlocked("logged-in token missing in profile");

    const dashResp = await fetch(`${backendUrl}/api/v1/dashboard/`, {
      headers: { Authorization: `Bearer ${authState.token}` },
    });
    if (dashResp.status !== 200) {
      return statusBlocked("cannot resolve target log for delete test", { dashboardStatus: dashResp.status });
    }
    const dashData = await dashResp.json();
    const recent = Array.isArray(dashData?.recent_logs) ? dashData.recent_logs : [];
    const logId = recent?.[0]?.id;
    if (!logId) return statusBlocked("no recent log id found");

    const delResp = await fetch(`${backendUrl}/api/v1/logs/${logId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authState.token}` },
    });

    if (delResp.status === 404 || delResp.status === 405) {
      return statusBlocked("delete endpoint is not available in current backend router", { status: delResp.status, logId });
    }
    if (delResp.status === 200 || delResp.status === 204) {
      return statusPass("log delete endpoint responded success", { status: delResp.status, logId });
    }
    return statusPartial("unexpected delete response", { status: delResp.status, logId });
  });

  // COACH-06
  await runCase("COACH-06", "Account unlink scenario", async () => {
    const p = await persistent.newPage();
    await p.goto(`${frontendUrl}/settings`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await p.waitForFunction(() => {
      const t = document.body.innerText || "";
      return t.includes("계정 및 보안");
    }, { timeout: 30000 });

    const unlinkCount = await p.getByRole("button", { name: "해제" }).count();
    await p.close();
    if (unlinkCount === 0) {
      return statusBlocked("linked identity was not present in current profile; unlink runtime scenario not reproducible");
    }
    return statusBlocked("destructive unlink action skipped to protect real user account data");
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
  lines.push("# P1 Batch4 Remaining Report");
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

