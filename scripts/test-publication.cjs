/* eslint-disable @typescript-eslint/no-require-imports */
/* Regression tests execute the real TypeScript modules with explicit boundary mocks. */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
function load(file, mocks = {}) {
  const filename = path.resolve(file);
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const result = { exports: {} };
  const localRequire = (id) => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (id === "server-only") return {};
    if (id.startsWith("."))
      return load(path.resolve(path.dirname(filename), id) + ".ts", mocks);
    return require(id);
  };
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, {
    filename,
  })(localRequire, result, result.exports);
  return result.exports;
}
const norm = load("src/lib/nasa/normalize.ts");
test("Repeated query parameters are bounded and normalized to a scalar", () => {
  assert.equal(norm.queryValue([" Earth ", "Mars"]), "Earth");
  assert.equal(norm.queryValue({ bad: true }), "");
  assert.equal(norm.queryValue("x".repeat(200)).length, 120);
});
test("Space-weather categories distinguish an unavailable feed from a true empty response", async () => {
  const weather = load("src/lib/nasa/donki.ts", {
    "./client": {
      cachedNasa: async (key) => ({
        data: key.startsWith("donki:GST") ? null : [],
        stale: false,
        fetchedAt: null,
      }),
    },
  });
  const result = await weather.getSpaceWeather();
  assert.equal(result.unavailable, 1);
  assert.equal(
    result.categories.find((c) => c.type === "Solar flare").available,
    true,
  );
  assert.equal(
    result.categories.find((c) => c.type === "Geomagnetic storm").available,
    false,
  );
});
test("Knowing an allowlisted email does not create an admin role", async () => {
  const previous = process.env.AUTHORIZED_AUTHOR_EMAILS;
  process.env.AUTHORIZED_AUTHOR_EMAILS = "owner@example.invalid";
  try {
    const roles = load("src/lib/session.ts", {
      "next/headers": {},
      "./auth": {},
      "@/models/Reader": {
        ReaderProfile: { findOne: () => ({ lean: async () => null }) },
      },
    });
    assert.equal(
      await roles.getRole({ id: "new-signup", email: "owner@example.invalid" }),
      "user",
    );
  } finally {
    if (previous === undefined) delete process.env.AUTHORIZED_AUTHOR_EMAILS;
    else process.env.AUTHORIZED_AUTHOR_EMAILS = previous;
  }
});
test("Public URLs reject credentials, secret query strings and executable schemes", () => {
  for (const u of [
    "javascript:alert(1)",
    "http://example.org",
    "https://user:pass@example.org",
    "https://api.nasa.gov/?api_key=fixture",
    "https://example.org/?API_KEY=fixture",
    "https://example.org/?token=fixture",
  ])
    assert.equal(norm.safeUrl(u), "");
  assert.equal(
    norm.safeUrl("https://science.nasa.gov/earth/"),
    "https://science.nasa.gov/earth/",
  );
});
test("Date validation rejects impossible dates and uses UTC across month/year boundaries", () => {
  assert.equal(
    norm.validDate("2026-02-31"),
    new Date().toISOString().slice(0, 10),
  );
  assert.equal(norm.validDate("2026-10-06"), "2026-10-06");
  assert.equal(norm.addDays("2026-12-31", 1), "2027-01-01");
});
test("NEO normalization whitelists fields, removes API links and non-Earth approaches", () => {
  const raw = {
    id: "2099942",
    name: "Apophis",
    links: { self: "https://api.nasa.gov/?api_key=fixture" },
    is_potentially_hazardous_asteroid: true,
    estimated_diameter: {
      meters: { estimated_diameter_min: 300, estimated_diameter_max: 400 },
    },
    close_approach_data: ["Earth", "Mars"].map((orbiting_body) => ({
      orbiting_body,
      close_approach_date: "2029-04-13",
      epoch_date_close_approach: 1870732800000,
      miss_distance: { kilometers: "38000", lunar: "0.1" },
      relative_velocity: { kilometers_per_hour: "30000" },
    })),
  };
  const out = norm.normalizeAsteroid(raw);
  assert.equal(out.approaches.length, 1);
  assert.equal(out.hazardous, true);
  assert.equal(out.approaches[0].distance, 38000);
  assert.ok(!JSON.stringify(out).includes("fixture"));
  assert.ok(!("links" in out));
  assert.throws(() => norm.normalizeAsteroid({ id: "bad" }));
});
function cacheBoundary() {
  const records = new Map();
  const model = {
    findOne: ({ key }) => ({ lean: async () => records.get(key) || null }),
    updateOne: async ({ key }, op) => {
      let r = records.get(key);
      if (!r) {
        r = { ...op.$setOnInsert };
        records.set(key, r);
      }
      Object.assign(r, op.$set || {});
    },
    findOneAndUpdate: async ({ key, lockUntil }, op) => {
      const r = records.get(key);
      if (r.lockUntil > lockUntil.$lte) return null;
      Object.assign(r, op.$set);
      return r;
    },
  };
  const mocks = {
    "../db": { connectToDatabase: async () => {} },
    "../rate-limit": { withinLimit: async () => true },
    "@/models/NasaCache": { NasaCache: model },
  };
  return { records, client: () => load("src/lib/nasa/client.ts", mocks) };
}
test("Shared NASA cache leases deduplicate requests across separate process instances", async () => {
  const b = cacheBoundary(),
    a = b.client(),
    c = b.client();
  let calls = 0;
  const loader = async () => {
    calls++;
    await new Promise((r) => setTimeout(r, 20));
    return [{ value: 42 }];
  };
  const replies = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      (i % 2 ? a : c).cachedNasa(
        "fixture:lease",
        "https://nasa.gov",
        300,
        loader,
      ),
    ),
  );
  assert.equal(calls, 1);
  assert.ok(replies.some((r) => r.data?.[0].value === 42));
  const next = await c.cachedNasa(
    "fixture:lease",
    "https://nasa.gov",
    300,
    loader,
  );
  assert.equal(next.data[0].value, 42);
  assert.equal(calls, 1);
});
test("NASA upstream failure serves dated stale data and applies a retry cooldown", async () => {
  const b = cacheBoundary(),
    c = b.client();
  await c.cachedNasa("fixture:stale", "https://nasa.gov", 300, async () => [1]);
  for (const r of b.records.values()) r.expiresAt = new Date(0);
  let calls = 0;
  const fail = async () => {
    calls++;
    throw new Error("upstream down");
  };
  const out = await c.cachedNasa(
    "fixture:stale",
    "https://nasa.gov",
    300,
    fail,
  );
  assert.deepEqual(out.data, [1]);
  assert.equal(out.stale, true);
  assert.ok(out.fetchedAt);
  await c.cachedNasa("fixture:stale", "https://nasa.gov", 300, fail);
  assert.equal(calls, 1);
});
test("NASA cache never bypasses an unavailable database with unbounded upstream requests", async () => {
  let calls = 0;
  const c = load("src/lib/nasa/client.ts", {
    "../db": {
      connectToDatabase: async () => {
        throw Error("offline");
      },
    },
    "../rate-limit": { withinLimit: async () => true },
    "@/models/NasaCache": { NasaCache: {} },
  });
  const out = await c.cachedNasa(
    "fixture:offline",
    "https://nasa.gov",
    30,
    async () => {
      calls++;
      return [];
    },
  );
  assert.equal(out.data, null);
  assert.equal(calls, 0);
});
function editorial(role, post) {
  let writes = 0;
  const api = load("src/lib/actions/posts.ts", {
    "next/cache": { revalidatePath: () => {} },
    "../session": {
      getSession: async () => (role ? { user: { id: "owner" } } : null),
      getRole: async () => role,
    },
    "../rate-limit": { withinLimit: async () => true },
    "../catalog": { topics: [{ slug: "iss" }] },
    "../nasa/normalize": norm,
    "@/models/Post": {
      Post: {
        findById: async () => post,
        exists: async () => false,
        create: async (data) => {
          writes++;
          return data;
        },
      },
    },
  });
  return { module: api, writes: () => writes };
}
function draft(status = "draft") {
  const f = new FormData();
  for (const [k, v] of Object.entries({
    title: "Fixture article",
    slug: "fixture-article",
    excerpt: "A test, not reporting.",
    content: "# Test",
    status,
    contentType: "explainer",
    project: "Test",
    topicIds: "iss",
  }))
    f.set(k, v);
  return f;
}
test("Anonymous and reader accounts cannot publish via direct server actions", async () => {
  for (const role of [null, "user"]) {
    const b = editorial(role);
    assert.ok((await b.module.createPost(draft("published"))).error);
    assert.equal(b.writes(), 0);
  }
});
test("Authors can create a draft but cannot publish or edit another author’s work", async () => {
  const a = editorial("author", { authorId: "other", status: "draft" });
  assert.ok((await a.module.createPost(draft("published"))).error);
  assert.ok((await a.module.updatePost("a".repeat(24), draft())).error);
  assert.equal(a.writes(), 0);
  assert.equal((await a.module.createPost(draft())).success, true);
});
test("Authors cannot demote or modify their own already-published work", async () => {
  const a = editorial("author", { authorId: "owner", status: "published" });
  assert.ok((await a.module.updatePost("a".repeat(24), draft())).error);
});
test("Editorial scheduling rejects past dates; unsafe source/image input is rejected", async () => {
  const a = editorial("admin");
  const f = draft("scheduled");
  f.set("scheduledAt", "2000-01-01T00:00");
  assert.ok((await a.module.createPost(f)).error);
  const g = draft();
  g.set("sources", "Bad | javascript:alert(1)");
  assert.ok((await a.module.createPost(g)).error);
  const h = draft();
  h.set("coverImage", "https://evil.example/image.png");
  assert.ok((await a.module.createPost(h)).error);
  assert.equal(a.writes(), 0);
});
test("Collections enforce ownership of both collection and bookmark on writes", async () => {
  const queries = [];
  let writes = 0;
  const empty = {
    findOne: async (q) => {
      queries.push(q);
      return null;
    },
  };
  const r = load("src/lib/actions/reader.ts", {
    "next/cache": { revalidatePath: () => {} },
    "next/navigation": { redirect: () => {} },
    "../session": { getSession: async () => ({ user: { id: "current" } }) },
    "../metrics": { countEvent: async () => {} },
    "../rate-limit": { withinLimit: async () => true },
    "../publication": {},
    "../catalog": {},
    "../nasa/neo": {},
    "../nasa/media": {},
    "@/models/Reader": {
      Bookmark: empty,
      ReaderCollection: empty,
      CollectionItem: { updateOne: async () => writes++ },
    },
  });
  const f = new FormData();
  f.set("collectionId", "a".repeat(24));
  f.set("bookmarkId", "b".repeat(24));
  await r.addToCollection(f);
  assert.equal(queries.length, 2);
  assert.ok(queries.every((q) => q.userId === "current"));
  assert.equal(writes, 0);
});
test("Reading progress is not recorded without the account’s explicit opt-in", async () => {
  let writes = 0;
  const r = load("src/lib/actions/reader.ts", {
    "next/cache": {},
    "next/navigation": {},
    "../session": { getSession: async () => ({ user: { id: "current" } }) },
    "../metrics": {},
    "../rate-limit": {},
    "../publication": {},
    "../catalog": {},
    "../nasa/neo": {},
    "../nasa/media": {},
    "@/models/Reader": {
      ReaderProfile: { findOne: async () => ({ recordHistory: false }) },
      ReadingHistory: { updateOne: async () => writes++ },
    },
  });
  await r.recordReading("fixture", 50);
  assert.equal(writes, 0);
});
