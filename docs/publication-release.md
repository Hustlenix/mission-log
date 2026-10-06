# Public publication release

## Audit — 5 October 2026

KEEP: Next.js App Router, Better Auth, Atlas, Markdown, existing Git/Vercel projects, engineering journal and Hackatime.

IMPROVE: post schema, author permissions, article reading, navigation, metadata and failure handling.

REPLACE: personal landing page, custom cursor, uncached/fragile NASA scraping and journal-only search.

ADD: sourced publication inventory, topic hubs, Learn, unified discovery, shared NASA cache, live explorers and persistent reader saves/follows/history.

Legacy verification slugs are excluded from public discovery; the publication code does not delete them. During acceptance testing, the posts collection was found empty. The five source-guided explainers were restored using an insert-only import, without inventing or overwriting personal journals. AI assistance is disclosed alongside each explainer.

## Verification story

Anonymous visitor discovers a story through search/topic → reads it → explores NASA data; authenticated reader saves/follows → sees persistent private account data; authorized editor maintains articles. Verify each boundary, then deploy and repeat against production.

## Marketing gate

Do not call this paid-marketing ready until live workflows, privacy, real NASA cache, mobile layouts and secret rotation have passed. Email verification/reset delivery, advanced community and newsletters are not implied by a successful build.

## Implemented — 6 October 2026

- Editorial homepage, Latest, Markdown articles with sources/credits, seven topic hubs, Learn and unified publication/NASA-media/asteroid search.
- Shared MongoDB NASA cache: normalized records, cross-instance refresh leases, stale fallback, failure cooldowns and hourly upstream budgets. Current APOD endpoint, NeoWs, five DONKI feeds, natural/enhanced EPIC and NASA media adapters.
- Asteroid filtering/details/watchlist; space-weather observation timeline with per-feed availability; Earth frame/date/product controls; NASA archive search/detail pages.
- Persistent saves and follows, topic-based home feed, private/unlisted/public collections, optional reading history with clear/disable controls.
- Server-managed user/author/editor/admin roles. Authors cannot change another author's work or published/scheduled work. Editor/admin CMS supports preview, sources, SEO, review, scheduled visibility and publication.
- ISS/Generation/Future source-linked documentary pages, independent-publication About/editorial/privacy policy, canonical article URLs, Article JSON-LD, social metadata, sitemap and private-route indexing exclusions.
- Aggregate seven-day studio counters. No raw queries or visitor identifiers; these count renders/actions including bots and QA, not unique visitors. Aggregate retention is 90 days.

## Local evidence

- `npm test`: 15 regression tests passed. Boundary mocks exercise actual adapter/cache/action code, not live upstream outage claims.
- ESLint and optimized Next.js build passed. The isolated checkout shares dependencies through a Windows junction, so the local build uses `--webpack`; Vercel performs its own normal build.
- 56 browser acceptance checks passed against the production-mode local server: real signup/sign-in, saved persistence, follows/watchlist, collections and cross-user denial, history, and draft → publish → edit/unpublish → republish → confirmed delete.
- CMS acceptance used a generated editor fixture. The existing owner was not silently reset. Its user record currently has no credential account; owner credential repair is awaiting explicit approval.
- Breakpoint checks: 360, 390, 430, 768, 1024, 1280, 1440 and 1920 px. No horizontal overflow on the five main editorial/data layouts. Actual desktop/mobile screenshots were inspected; duplicate imagery, an inaccurate image description and cramped Earth links were corrected.
- 67 compiled client bundles scanned: no configured MongoDB URI, NASA key or auth secret found. Public article HTML also checked.
- Temporary QA accounts, their reader data and the acceptance article were removed using exact fixture identities. Production aggregate counters include testing, as disclosed.

Screenshots: [desktop](screenshots/publication-home-desktop.png), [mobile](screenshots/publication-home-mobile.png). Machine reports remain in ignored `.vercel/qa-local/report.json` and `.vercel/qa-production/report.json`.

## Deliberately incomplete

This is the first substantive public-publication release, not the entire long-term platform. Email verification/password-reset delivery, self-service account deletion, newsletters/alerts, moderated community, opportunity/role-management UI, advanced orbit visualization, rich search autocomplete and an archived editorial daily-edition pipeline remain work. The daily page is explicitly a data snapshot. NASA video/audio opens the original player rather than a custom inline player. Topic descriptions are curated in source; articles are CMS-managed.

Before paid promotion: repair the owner's credential, connect verified recovery email, add account deletion and production monitoring/security review, review the starter explainers editorially, and rotate the previously exposed NASA API key. The existing Hackatime configuration was not changed or its key rotated.
