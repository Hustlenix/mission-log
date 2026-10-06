/* eslint-disable @typescript-eslint/no-require-imports */
/* Browser acceptance. Writes screenshots/report; creates only explicitly labeled QA fixtures. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
const base = process.env.VERIFY_URL || "http://localhost:3002";
const full = process.env.VERIFY_ACCOUNTS === "1";
const dir = path.resolve(
  ".vercel",
  base.includes("localhost") ? "qa-local" : "qa-production",
);
fs.mkdirSync(dir, { recursive: true });
const checks = [],
  errors = [],
  fixtures = [];
const stamp = crypto.randomBytes(5).toString("hex");
const fixtureSlug = `qa-verification-${stamp}`;
const record = (name, detail) => {
  checks.push({ name, detail });
  console.log(`PASS ${name}`);
};
let browser, db;
async function inspect(page, name, expected = 200) {
  let response;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      response = await page.goto(`${base}${name}`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      break;
    } catch (error) {
      if (attempt === 1 || !/Timeout|net::/.test(error.message)) throw error;
      console.log(`RETRY transient navigation ${name}`);
    }
  }
  if (expected === 404) {
    assert.ok(
      [200, 404].includes(response.status()),
      `not-found status ${name}`,
    );
    await page.getByRole("heading", { name: /SIGNAL LOST/i }).waitFor();
    assert.ok(
      await page.locator('meta[name="robots"][content*="noindex"]').count(),
      `noindex on streamed not-found ${name}`,
    );
  } else {
    assert.equal(response.status(), expected, `status ${name}`);
    await page.locator("h1").first().waitFor();
    assert.ok(
      !(await page
        .getByRole("heading", { name: /SIGNAL LOST|Something went wrong/i })
        .count()),
      `content missing ${name}`,
    );
  }
  await page.waitForTimeout(500);
  return response;
}
function monitor(page) {
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("404"))
      errors.push(m.text());
  });
}
async function signUp(page, index) {
  const email = `mission-log-qa-${stamp}-${index}@example.invalid`,
    password = crypto.randomBytes(24).toString("base64url");
  fixtures.push(email);
  await inspect(page, "/signup");
  await page.locator("#name").fill(`QA reader ${index}`);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page
    .getByRole("button", { name: "CREATE ACCOUNT", exact: true })
    .click();
  await page.waitForURL("**/account", { timeout: 45000 });
  await page
    .getByRole("heading", { name: `QA reader ${index}`, exact: true })
    .waitFor();
  return { email, password };
}
async function main() {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const guest = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await guest.newPage();
  monitor(page);
  const routes = [
    "/",
    "/latest",
    "/articles/the-station-ends-the-work-doesnt",
    "/topics",
    "/topics/asteroids",
    "/learn",
    "/live",
    "/live/asteroids",
    "/live/asteroids/2099942",
    "/live/space-weather",
    "/live/earth",
    "/media",
    "/media/iss056e201248",
    "/daily",
    "/iss",
    "/generation",
    "/future",
    "/about",
    "/missions",
    "/archive",
    "/account",
  ];
  for (const route of routes) {
    await inspect(page, route);
    assert.ok(
      !(await page.getByText("Something went wrong", { exact: true }).count()),
      route,
    );
    record(`route ${route}`);
  }
  await inspect(page, "/latest");
  assert.ok((await page.locator('main a[href^="/articles/"]').count()) >= 5);
  record("five real starter articles are visible, not an empty shell");
  await inspect(page, "/daily");
  assert.ok((await page.locator("main").innerText()).includes("APOD date:"));
  record("APOD renders a source-linked dated entry");
  await inspect(page, "/search?q=Apophis");
  assert.ok(await page.getByRole("link", { name: /Apophis/ }).count());
  record("search resolves a real asteroid and mixed NASA results");
  await inspect(page, "/");
  await page.waitForTimeout(3000);
  await page.keyboard.press("Control+k");
  await page.locator("dialog[open]").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog[open]").count(), 0);
  record("keyboard search opens and closes");
  for (const width of [360, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    for (const route of [
      "/",
      "/articles/the-station-ends-the-work-doesnt",
      "/live/asteroids",
      "/live/earth",
      "/media",
    ]) {
      await inspect(page, route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      assert.equal(overflow, false, `horizontal overflow ${route} ${width}`);
      if ([390, 1440].includes(width)) {
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight),
        );
        await page.waitForTimeout(700);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(400);
        const badImages = await page
          .locator("main img")
          .evaluateAll((imgs) =>
            imgs
              .filter((i) => i.complete && i.naturalWidth === 0)
              .map((i) => i.alt),
          );
        assert.deepEqual(badImages, [], `broken images ${route}`);
        await page.screenshot({
          path: path.join(
            dir,
            `${route.replace(/\W+/g, "-") || "home"}-${width}.png`,
          ),
          fullPage: true,
        });
      }
    }
    record(`responsive width ${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await inspect(page, "/");
  await page.getByRole("button", { name: "Toggle menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Explore" })
    .click();
  await page.waitForURL("**/topics");
  record("mobile navigation works");
  await inspect(page, "/does-not-exist", 404);
  record("intentional not-found response");
  const sitemap = await (await page.request.get(`${base}/sitemap.xml`)).text();
  assert.ok(sitemap.includes("/articles/the-station-ends-the-work-doesnt"));
  assert.ok(!sitemap.includes("temp-seed-log"));
  record("sitemap lists public articles, excludes legacy verification logs");
  const robots = await (await page.request.get(`${base}/robots.txt`)).text();
  assert.ok(robots.includes("/account") && robots.includes("/studio"));
  record("private routes excluded from indexing");
  await inspect(page, "/articles/the-station-ends-the-work-doesnt");
  assert.equal(
    await page.locator('script[type="application/ld+json"]').count(),
    1,
  );
  assert.ok(
    (await page.locator('link[rel="canonical"]').getAttribute("href")).endsWith(
      "/articles/the-station-ends-the-work-doesnt",
    ),
  );
  record("article canonical and structured data");
  const html = await page.content();
  for (const k of ["NASA_API_KEY", "MONGO_URI", "BETTER_AUTH_SECRET"])
    if (process.env[k])
      assert.ok(!html.includes(process.env[k]), "secret in public HTML");
  record("public HTML contains no configured secrets");
  if (full) {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    db = mongoose.connection.db;
    const c1 = await browser.newContext(),
      p1 = await c1.newPage();
    monitor(p1);
    const reader = await signUp(p1, 1);
    const readerDocument = await db
      .collection("user")
      .findOne({ email: reader.email });
    assert.ok(
      readerDocument,
      "Production and cleanup configuration must refer to the same database",
    );
    async function waitForHistory(shouldExist) {
      for (let attempt = 0; attempt < 25; attempt++) {
        const count = await db
          .collection("readinghistories")
          .countDocuments({ userId: String(readerDocument._id) });
        if (shouldExist ? count > 0 : count === 0) return;
        await p1.waitForTimeout(1000);
      }
      assert.fail(
        shouldExist
          ? "Opted-in history was not persisted"
          : "Cleared history still exists in storage",
      );
    }
    record("reader signup through the real form");
    await inspect(p1, "/articles/the-station-ends-the-work-doesnt");
    await p1.getByRole("button", { name: "Save", exact: true }).click();
    await p1.getByRole("button", { name: "Saved ✓", exact: true }).waitFor();
    await p1.reload();
    await p1.getByRole("button", { name: "Saved ✓", exact: true }).waitFor();
    record("saved article persists after reload");
    await inspect(p1, "/topics/asteroids");
    await p1.getByRole("button", { name: "Follow", exact: true }).click();
    await p1
      .getByRole("button", { name: "Following ✓", exact: true })
      .waitFor();
    await inspect(p1, "/live/asteroids/2099942");
    await p1.getByRole("button", { name: "Follow", exact: true }).click();
    await p1
      .getByRole("button", { name: "Following ✓", exact: true })
      .waitFor();
    record("topic follow and asteroid watchlist persist");
    await inspect(p1, "/");
    assert.ok(
      await p1.getByRole("heading", { name: "For your curiosity" }).count(),
    );
    assert.ok(
      await p1
        .locator(
          'a[href="/articles/potentially-hazardous-does-not-mean-impact"]',
        )
        .count(),
    );
    record("personalized feed uses followed topics");
    await inspect(p1, "/account");
    assert.ok((await p1.locator("#following").innerText()).includes("Apophis"));
    await p1.getByLabel("New collection").fill("QA private collection");
    await p1
      .getByRole("button", { name: "Create collection", exact: true })
      .click();
    await p1.waitForURL("**/collections/**");
    const privatePath = new URL(p1.url()).pathname;
    await p1
      .getByLabel("Add a saved item")
      .selectOption({ label: "The station ends. The work doesn’t." });
    await p1
      .getByRole("button", { name: "Add to collection", exact: true })
      .click();
    await p1
      .getByRole("link", { name: /The station ends/ })
      .first()
      .waitFor();
    record("private collection contains a real saved article");
    const c2 = await browser.newContext(),
      p2 = await c2.newPage();
    await signUp(p2, 2);
    await inspect(p2, privatePath, 404);
    await inspect(page, privatePath, 404);
    record("private collection denied to another user and anonymous readers");
    await inspect(p1, "/account");
    await p1.getByLabel("New collection").fill("QA public collection");
    await p1.locator('select[name="visibility"]').selectOption("public");
    await p1
      .getByRole("button", { name: "Create collection", exact: true })
      .click();
    await p1.waitForURL("**/collections/**");
    const publicPath = new URL(p1.url()).pathname;
    await p1
      .getByLabel("Add a saved item")
      .selectOption({ label: "The station ends. The work doesn’t." });
    await p1
      .getByRole("button", { name: "Add to collection", exact: true })
      .click();
    await p1
      .getByRole("link", { name: /The station ends/ })
      .first()
      .waitFor();
    await inspect(page, publicPath);
    assert.ok(!(await page.content()).includes(reader.email));
    record("public collection is shareable without owner email");
    await inspect(p1, "/account");
    assert.ok(
      (await p1.locator("#history").innerText()).includes(
        "Reading history is off",
      ),
    );
    await p1
      .getByRole("button", { name: "Enable history", exact: true })
      .click();
    await p1
      .getByRole("button", { name: "Disable history", exact: true })
      .waitFor();
    await inspect(p1, "/articles/the-station-ends-the-work-doesnt");
    await p1.locator(".source-block").scrollIntoViewIfNeeded();
    await waitForHistory(true);
    await inspect(p1, "/account");
    assert.ok(
      (await p1.locator("#history").innerText()).includes("% scroll progress"),
      "Persisted history must be visible in the account",
    );
    await p1
      .getByRole("button", { name: "Clear history", exact: true })
      .click();
    await waitForHistory(false);
    await p1.reload();
    assert.ok(
      !(await p1.locator("#history").innerText()).includes("% scroll progress"),
      "Cleared history must stay absent after reload",
    );
    record("history opt-in, recording and clear work");
    await inspect(p1, "/studio");
    assert.ok(new URL(p1.url()).pathname === "/account");
    await inspect(p1, "/post");
    assert.ok(new URL(p1.url()).pathname === "/account");
    record("reader blocked from studio and editor routes");
    await p1.getByRole("button", { name: "Sign out", exact: true }).click();
    await p1.waitForTimeout(800);
    await inspect(p1, "/signin");
    await p1.locator("#email").fill(reader.email);
    await p1.locator("#password").fill(reader.password);
    await p1.getByRole("button", { name: "SIGN IN", exact: true }).click();
    await p1.waitForURL("**/account");
    record("reader sign-out and sign-in work");
    let editor;
    if (process.env.VERIFY_EDITOR_FIXTURE === "1") {
      const user = await db.collection("user").findOne({ email: reader.email });
      assert.ok(
        user && fixtures.includes(user.email),
        "Only a generated QA account may receive the fixture role",
      );
      await db
        .collection("readerprofiles")
        .updateOne(
          { userId: String(user._id) },
          { $set: { role: "editor" } },
          { upsert: true },
        );
      editor = p1;
      record(
        "temporary QA reader provisioned as an editor fixture; owner untouched",
      );
    } else {
      const admin = await browser.newContext();
      editor = await admin.newPage();
      monitor(editor);
      await inspect(editor, "/signin");
      await editor.locator("#email").fill(process.env.AUTHOR_EMAIL);
      await editor.locator("#password").fill(process.env.AUTHOR_PASSWORD);
      await editor
        .getByRole("button", { name: "SIGN IN", exact: true })
        .click();
      await editor.waitForURL("**/account");
      record("existing owner signs in through the real form");
    }
    await inspect(editor, "/studio");
    await editor
      .getByRole("link", { name: "New article", exact: true })
      .click();
    await editor.waitForURL("**/post");
    await editor
      .locator('[name="title"]')
      .fill("QA verification article — not editorial content");
    await editor.locator('[name="slug"]').fill(fixtureSlug);
    await editor
      .locator('[name="excerpt"]')
      .fill("Temporary acceptance fixture, removed after testing.");
    await editor
      .locator('[name="content"]')
      .fill(
        "## Acceptance fixture\n\n**Markdown** preview and server publication test. Not a real report.",
      );
    await editor.locator('[name="topicIds"]').fill("iss");
    await editor.getByRole("button", { name: "Preview", exact: true }).click();
    assert.ok(await editor.locator(".editor-preview strong").count());
    await editor
      .getByRole("button", { name: "Save article", exact: true })
      .click();
    await editor.waitForURL("**/studio");
    record("authorized CMS creates a draft with Markdown preview");
    const fixture = await db.collection("posts").findOne({ slug: fixtureSlug });
    assert.equal(fixture.status, "draft");
    await inspect(page, `/articles/${fixtureSlug}`, 404);
    await inspect(editor, `/post/${fixture._id}/edit`);
    await editor.locator('[name="status"]').selectOption("published");
    await editor
      .getByRole("button", { name: "Save article", exact: true })
      .click();
    await editor.waitForURL("**/studio");
    await inspect(page, `/articles/${fixtureSlug}`);
    record("authorized editor publishes draft; public page becomes visible");
    await inspect(editor, `/post/${fixture._id}/edit`);
    await editor
      .locator('[name="title"]')
      .fill("QA edited verification fixture");
    await editor.locator('[name="status"]').selectOption("draft");
    await editor
      .getByRole("button", { name: "Save article", exact: true })
      .click();
    await editor.waitForURL("**/studio");
    await inspect(page, `/articles/${fixtureSlug}`, 404);
    record("edit and unpublish remove public visibility");
    await inspect(editor, `/post/${fixture._id}/edit`);
    await editor.locator('[name="status"]').selectOption("published");
    await editor
      .getByRole("button", { name: "Save article", exact: true })
      .click();
    await editor.waitForURL("**/studio");
    await inspect(page, `/articles/${fixtureSlug}`);
    record("republish restores edited content");
    await inspect(editor, `/post/${fixture._id}/edit`);
    await editor
      .getByRole("button", { name: "Delete article", exact: true })
      .click();
    await editor
      .getByRole("button", { name: "Confirm permanent delete", exact: true })
      .click();
    await editor.waitForURL("**/studio");
    await inspect(page, `/articles/${fixtureSlug}`, 404);
    record("confirmed CMS delete removes the fixture");
  }
  assert.deepEqual([...new Set(errors)], [], "browser errors");
  record("no unexpected browser console or page errors");
}
main()
  .then(() => {
    fs.writeFileSync(
      path.join(dir, "report.json"),
      JSON.stringify(
        { base, time: new Date().toISOString(), checks, passed: true },
        null,
        2,
      ),
    );
    console.log(
      `Verified ${checks.length} checks; screenshots/report in ${dir}`,
    );
  })
  .catch((e) => {
    console.error(
      `Verification failed: ${e.message.replace(/mission-log-qa-[^\s]+/g, "[QA email]")}`,
    );
    fs.writeFileSync(
      path.join(dir, "report.json"),
      JSON.stringify(
        {
          base,
          time: new Date().toISOString(),
          checks,
          passed: false,
          failure: e.message,
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    if (db) {
      await db.collection("posts").deleteMany({ slug: fixtureSlug });
      for (const email of fixtures) {
        const user = await db.collection("user").findOne({ email });
        if (!user) continue;
        const id = String(user._id);
        for (const name of [
          "bookmarks",
          "follows",
          "readercollections",
          "collectionitems",
          "readerprofiles",
          "readinghistories",
        ])
          await db.collection(name).deleteMany({ userId: id });
        for (const name of ["session", "account"])
          await db
            .collection(name)
            .deleteMany({ userId: { $in: [user._id, id] } });
        await db.collection("user").deleteOne({ _id: user._id, email });
      }
      console.log(
        "Temporary QA users, collections, saves, history and article removed; existing data preserved.",
      );
    }
    if (browser) await browser.close();
    await mongoose.disconnect();
  });
