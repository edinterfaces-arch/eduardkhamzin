import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function scrollAt(page, selector, fraction = 0) {
  await page
    .locator(selector)
    .evaluate(
      (el, fraction) =>
        scrollTo(
          0,
          el.getBoundingClientRect().top +
            scrollY +
            el.offsetHeight * fraction -
            innerHeight * 0.25,
        ),
      fraction,
    );
  await page.waitForTimeout(80);
}
async function chooseLanguage(page, name) {
  const box = await page
    .getByRole("button", { name, exact: true })
    .boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(50);
}
async function readingPosition(page, selector) {
  return page
    .locator(selector)
    .evaluate(
      (el) =>
        (innerHeight * 0.25 - el.getBoundingClientRect().top) / el.offsetHeight,
    );
}

test("complete forward/reverse scroll, deterministic boundaries, resize and refresh", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("[data-project]")).toHaveCount(9);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  for (const [id, shell] of [
    ["project-1", "present"],
    ["project-4", "social"],
    ["project-7", "early"],
  ]) {
    await scrollAt(page, "#" + id, 0.2);
    await expect(page.locator(`[data-shell=${shell}]`)).toHaveCSS(
      "opacity",
      "1",
    );
  }
  await scrollAt(page, "#ending", 0.3);
  await expect(page.locator(".device-stage")).toHaveCSS("visibility", "hidden");
  for (const [id, shell] of [
    ["project-7", "early"],
    ["project-4", "social"],
    ["project-1", "present"],
  ]) {
    await scrollAt(page, "#" + id, 0.2);
    await expect(page.locator(`[data-shell=${shell}]`)).toHaveCSS(
      "opacity",
      "1",
    );
  }
  const boundary = await page
    .locator("#social")
    .evaluate(
      (el) => el.getBoundingClientRect().top + scrollY - innerHeight * 0.44,
    );
  await page.evaluate((y) => scrollTo(0, y), boundary);
  await page.waitForTimeout(80);
  const opacity = Number(
    await page
      .locator("[data-shell=social]")
      .evaluate((el) => el.style.opacity),
  );
  expect(opacity).toBeGreaterThan(0.48);
  expect(opacity).toBeLessThan(0.52);
  await page.evaluate((y) => scrollTo(0, y + 700), boundary);
  await page.evaluate((y) => scrollTo(0, y), boundary);
  await page.waitForTimeout(80);
  expect(
    Number(
      await page
        .locator("[data-shell=social]")
        .evaluate((el) => el.style.opacity),
    ),
  ).toBeCloseTo(opacity, 2);
  await page.setViewportSize({ width: 1024, height: 600 });
  await scrollAt(page, "#project-5", 0.3);
  const before = await page.evaluate(() => scrollY);
  await page.reload();
  await page.waitForTimeout(200);
  expect(Math.abs((await page.evaluate(() => scrollY)) - before)).toBeLessThan(
    5,
  );
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(80);
  await expect(page.locator(".duo-leaf")).toHaveAttribute(
    "style",
    /rotateY\(-168deg\)/,
  );
  expect(errors).toEqual([]);
});

test("language changes platforms while preserving project reading position", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  for (const id of ["project-2", "project-5", "project-8"]) {
    await scrollAt(page, "#" + id, 0.4);
    const before = await readingPosition(page, "#" + id);
    await chooseLanguage(page, "RU");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    expect(
      Math.abs((await readingPosition(page, "#" + id)) - before),
    ).toBeLessThan(0.02);
    await expect(page.locator(".platform-telegram")).toHaveCount(1);
    await expect(page.locator(".platform-vk")).toHaveCount(1);
    await chooseLanguage(page, "EN");
    expect(
      Math.abs((await readingPosition(page, "#" + id)) - before),
    ).toBeLessThan(0.02);
  }
});

test("mobile sizes, both languages, no horizontal or nested scrolling", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 844 });
    for (const lang of ["RU", "EN"]) {
      await chooseLanguage(page, lang);
      await expect(page.locator(".device-stage")).toHaveCSS("display", "none");
      for (const id of ["project-1", "project-4", "project-7", "ending"]) {
        await scrollAt(page, "#" + id, 0.2);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
    }
  }
  const trapped = await page
    .locator("main *")
    .evaluateAll((elements) =>
      elements
        .filter(
          (el) =>
            ["auto", "scroll"].includes(getComputedStyle(el).overflowY) &&
            el.scrollHeight > el.clientHeight + 1,
        )
        .map((el) => el.className),
    );
  expect(trapped).toEqual([]);
});

test("reduced motion and keyboard access keep all content available", async ({
  page,
  browserName,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await scrollAt(page, "#project-5");
  await expect(page.locator("[data-shell=social]")).toHaveCSS(
    "transform",
    "none",
  );
  await expect(page.locator(".duo-leaf")).toHaveAttribute(
    "style",
    /rotateY\(0deg\)/,
  );
  await expect(page.locator("[data-project]")).toHaveCount(9);
  await page.evaluate(() => {
    const text = Array.from(
      document.querySelectorAll("main :is(h1,h2,h3,h4,p,a,li)"),
    ).filter((el) => !el.closest('[aria-hidden="true"]'));
    const sizes = text.map((el) => parseFloat(getComputedStyle(el).fontSize));
    text.forEach((el, i) => (el.style.fontSize = `${sizes[i] * 2}px`));
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("prototype supports two projects per era and reversible transitions", async ({
  page,
}) => {
  await page.goto("/prototype/");
  await expect(page.locator("[data-project]")).toHaveCount(4);
  await scrollAt(page, "#project-4", 0.3);
  await expect(page.locator("[data-shell=social]")).toHaveCSS("opacity", "1");
  await scrollAt(page, "#project-1", 0.3);
  await expect(page.locator("[data-shell=present]")).toHaveCSS("opacity", "1");
});

test("static HTML retains both language narratives without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("[data-project]")).toHaveCount(9);
  await expect(
    page.getByRole("heading", { name: "Making complexity feel simple" }),
  ).toBeVisible();
  await page.goto("/ru/");
  await expect(page.locator(".platform-telegram")).toHaveCount(1);
  await expect(page.locator(".platform-vk")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Делать сложное понятным" }),
  ).toBeVisible();
  await context.close();
});

test("automated accessibility scan in both languages", async ({ page }) => {
  await page.goto("/");
  for (const language of ["EN", "RU"]) {
    await chooseLanguage(page, language);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
});

test("touch viewport survives resize, language switch and reverse movement", async ({
  browser,
  browserName,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("/");
  await scrollAt(page, "#project-5", 0.3);
  const position = await readingPosition(page, "#project-5");
  const box = await page
    .getByRole("button", { name: "RU", exact: true })
    .boundingBox();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  expect(
    Math.abs((await readingPosition(page, "#project-5")) - position),
  ).toBeLessThan(0.02);
  await page.setViewportSize({ width: 390, height: 650 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  if (browserName === "chromium") {
    const cdp = await context.newCDPSession(page);
    const before = await page.evaluate(() => scrollY);
    await cdp.send("Input.synthesizeScrollGesture", {
      x: 180,
      y: 420,
      yDistance: 300,
      gestureSourceType: "touch",
      speed: 800,
    });
    expect(await page.evaluate(() => scrollY)).toBeLessThan(before);
  }
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await context.close();
});
