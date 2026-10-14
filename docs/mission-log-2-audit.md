# Mission Log 2.0: milestone 1 audit — 14 October 2026

Branch: `codex/mission-log-2-audit`. This is an AI-assisted engineering audit and
first incremental implementation, **not** a completed rebuild or a submission.
The existing checkout was reused rather than cloning over private configuration
or discarding prior uncommitted security work. No database migration, credential
change, deployment, Git push or Stardance submission was performed.

## Evidence baseline

- A fresh MongoDB connection rejects configured credentials (authentication
  rejection, code 8000). The replacement password input remains empty. No current
  account, post count, saved-item count or cache contents can be established.
- Independent server-side NeoWs probe returned HTTP 200 and four objects for
  2026-10-14 UTC. The upstream service is reachable; this does not prove the
  application's MongoDB-backed cache works.
- Public HTTP probes: `/`, `/latest`, `/live/asteroids` returned 200 with
  unavailable content. `/about` and `/signin` returned 200 without that detected
  failure. A 200 or sign-in form is not evidence of working authentication.
- Source inventory covers every file under `src`, `scripts`, `docs`. Detailed
  inspection in this milestone focuses on the critical NASA/cache, publication,
  authentication, reader-action, collection and asteroid paths. It is not a claim
  that every route has been exercised or every content statement fact-checked.
- The baseline 15 application tests passed using explicit database/session
  boundary mocks. Historical live verification in `docs/publication-release.md`
  is time-specific and not current acceptance.

## Milestone 1 verification results

After the changes: 20 application tests and five secret scanner tests passed;
TypeScript `--noEmit`, full ESLint, targeted ESLint and `git diff --check` passed.
The candidate-source secret scan passed across 118 files. First optimized
webpack build failed during `/post` prerender authentication; after the dynamic
layout fix, the second optimized build passed, including compilation,
TypeScript, static generation and tracing. `/post` and `/post/[id]/edit` are
listed as dynamic. Webpack is used locally because this Windows checkout shares
installed dependencies through a junction; no dependency reinstall was done.

Local Next.js development server ran on port 3014. HTTP checks on `/about` and
`/live/asteroids` returned 200; the latter rendered the explorer title and its
unavailable state. The temporary server was stopped before production build.
Comparison component rendering is covered with an explicitly synthetic unit
record; this is not a screenshot or live NASA/database journey. No browser
keyboard, visual, authenticated persistence, responsive, contrast-conformance or
production performance acceptance was completed. Fresh HTTP probe timings are
private in `.vercel/diagnostic-2-report.json`, not a benchmark.

The owner reports the replacement database password was forgotten. They must
set another password for the existing Atlas database user and save it privately.
No forgotten password was guessed, retrieved, logged or sent to a third party.

## Critical findings and file references

| Priority | Finding | Evidence / implementation | Action |
| --- | --- | --- | --- |
| P0 | Revoked local credential prevents real data journeys | `src/lib/db.ts`, private fresh connection probe | Owner supplies replacement privately; obtain approval before applying config |
| P0 | Build attempted authenticated editor prerender | `src/app/post/layout.tsx` called `requireAuthor` during `/post` static generation; build failed code 8000 after successful compilation/typecheck | Marked editor layout request-time dynamic; authorization remains unchanged |
| P0 | NASA depends on the same failed DB | `src/lib/nasa/client.ts` calls DB before loading cache; budget uses `src/lib/rate-limit.ts` | Restore dependency, retain deliberate no-unbounded-upstream fallback |
| P0 | Articles fail harder than index | `src/lib/publication.ts`: index catches DB errors; `getArticle` throws; `src/app/articles/[slug]/page.tsx` metadata also calls it | Add explicit service-unavailable semantics after dependency recovery; never label outage as missing article |
| P1 | Selecting a historical approach loses context | `src/app/live/asteroids/page.tsx` formerly linked just ID; detail chose only next future approach | Fixed in milestone 1: exact timestamp query, validated selection, explicit missing-selection state |
| P1 | Distance diagram was decorative | Original detail `.distance-line` had no data-dependent geometry | Replaced with proportional shared-axis bars and text equivalents |
| P1 | Invalid numbers could reach plots | `src/lib/nasa/normalize.ts` previously accepted unordered/non-finite diameter and negative distances | Added range checks and invalid-approach exclusion; tests included |
| P1 | Cache failure reasons collapse together | `src/lib/nasa/client.ts` returns null for DB/read/lease failures; retry has no backoff; 429 not retried | Keep bounded requests; design typed diagnostic categories and test retry-after handling next |
| P1 | Follow toggle races | `src/lib/actions/reader.ts` reads then deletes/upserts; a source outage can block unfollow | Human-led idempotent desired-state mutation, stale-reference removal and concurrency tests |
| P1 | Saved object loses observation context | Reader `itemReference` stores object URL, not timestamp | Watchlist is currently object-level; decide separately whether saving an observation is wanted, do not silently change schema |
| P2 | Homepage can look populated during DB outage | `src/app/page.tsx` substitutes a documentary story while latest is unavailable | Make READ/EXPLORE/REMEMBER access explicit and explain data availability; no fake article feed |
| P2 | Author attribution is generic | `src/app/articles/[slug]/page.tsx` uses Mission Log for byline/JSON-LD despite `Post.authorId` | Owner-approved public byline model; never expose private email or fabricate reporting |
| P2 | Broad search has avoidable work | `src/lib/search.ts` always requests today's NEO feed and uses regex article scans with a 25-item limit | Test meaningful queries; avoid unused feeds; consider indexed text search with actual corpus |
| P2 | Error message claimed data survived | `src/app/error.tsx` previously asserted logs still in DB | Reworded: availability cannot be confirmed during interruption |
| P3 | Existing permission checks are substantive but not live-verified now | `src/lib/actions/posts.ts`, reader actions, `src/app/collections/[slug]/page.tsx` | Keep role/ownership validation; rerun real account/privacy lifecycle after P0 |

## Route inventory and test coverage gap

READ: `/`, `/latest`, `/articles`, `/articles/[slug]`, `/topics`,
`/topics/[slug]`, `/learn`, `/search`, `/about`.
EXPLORE: `/live`, `/live/asteroids`, `/live/asteroids/[id]`,
`/live/space-weather`, `/live/earth`, `/media`, `/media/[id]`, `/daily`.
REMEMBER: `/account`, `/collections/[slug]`, `/signin`, `/signup`, auth API.
EDITOR: `/studio`, `/dashboard`, `/post`, `/post/[id]/edit`.
DOCUMENTARY/LEGACY: `/iss`, `/generation`, `/future`, `/missions`,
`/missions/[slug]`, `/blogs`, `/blogs/[slug]`, `/archive`, `/login`, plus
robots/sitemap/loading/error routes. Legacy views increase the regression surface;
don't remove bookmarked URLs without an explicit redirect plan.

No claim of current working authentication, privacy, watchlist persistence,
article CRUD, all NASA services, accessibility conformance or mobile acceptance
is made. Full browser evidence is blocked on P0. Screenshots of a shell or an
unavailable page cannot stand in for a working authenticated demonstration.

## Minimum viable product and ranked backlog

The MVP is READ a sourced explanation → EXPLORE a dated Earth approach →
understand classification/distance → REMEMBER the object → reopen from account.
Other explorers remain secondary; no new dashboard, alert service or orbital
simulator is planned.

1. **P0 / owner + agent:** supply new DB credential privately, approve local and
   Vercel updates; verify replacement connection, old rejection, production build
   and browser acceptance before calling recovery complete.
2. **P1 / agent milestone delivered:** timestamp-preserving selection, linear
   lunar-distance comparison, numeric validation and focused loading state.
3. **P1 / owner-led:** typed feed status and safe diagnostic categories; bounded
   retry policy; desired-state watchlist mutations with concurrency tests.
4. **P2 / owner-led:** purpose-based editorial homepage, accessible explorer
   filters, attributable articles; research/write two original explainers tied to
   the dataset. Agent may review/cite briefs, not impersonate the author's work.
5. **P3:** execute new-reader login → follow asteroid → reload → account → reopen;
   cross-user collection privacy, malicious ID tests and unfollow during outage.
6. **P5:** desktop/mobile screenshots of real NASA results, keyboard checks,
   overflow checks, contrast audit, timing profiles, production error scan.
7. **P6:** accurate summary with implementation commits and separate live,
   mocked and untested evidence. Obtain deployment approval first.

## Authorship: actionable human-led rebuild

The known implementation includes substantial AI work. Neither Git line counts
nor renamed files prove that a 30% rule is met. Only the organizer can clarify
its denominator and evidence criteria. No compliance percentage is asserted.

Owner tasks should be independently implemented rather than copying this agent's
replacement code: (A) approach selection and comparison math/UI from a behavioral
specification; (B) idempotent watchlist action with ownership/rate-limit checks;
(C) feed-status model, retry policy and tests; (D) editorial layout and original
articles with a source notebook. Acceptance requirements: exact selected-time
round-trip, linear ratios below/above 1 LD, keyboard controls/text alternatives,
unknown versus empty feed distinction, stale timestamp preserved, no credential
logging, two-user isolation and no duplicate follow records under concurrency.

Maintain an honest per-file contribution record: original version, owner-authored
changes, assistance received, tests actually run and dated commits. Agent role is
specification, review and debugging for these human tasks. This milestone's
`approach.ts`, comparison component, route changes, validation and new tests are
AI-generated and must remain attributed accordingly. Existing code provenance
is not rewritten by this document.

## Comparison assumptions and sources

The comparison uses NASA's supplied `miss_distance.lunar`; it does not infer
position or an orbit from one scalar distance. One lunar-distance reference bar
and the approach bar share `max(1, supplied LD)` as their axis endpoint. There is
no minimum visible width that would misrepresent extremely close approaches.
Values remain readable as text, and body sizes are not shown to scale.

- [NASA NeoWs API](https://api.nasa.gov/) — dated feed and object lookup.
- [CNEOS PHA definition](https://cneos.jpl.nasa.gov/glossary/PHA.html) — classification
  uses minimum orbit intersection distance and absolute magnitude; it is not the
  selected approach's impact probability.

No editorial content was imported, rewritten as human-authored, or published.
