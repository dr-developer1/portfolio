# PR #24 review fixes

The changes stay on `feat/annual-christmas-event`. The PR remains open.

Latest: [corrected title-bar placement and toolbar screenshots in English/French](follow-up/README.md).
The captures and investigation below document the first review round.

## Screenshots

Captured from the original PR commit `426caf4` and the corrected source, in
Chromium with reduced motion, English, and December 20 fixed in the visitor's
local calendar. These are full, unmasked captures. Desktop keeps its existing
layout; phones and tablets now use symmetric 8px outer margins.

| Viewport            | Before                        | After                       |
| ------------------- | ----------------------------- | --------------------------- |
| 320 × 640           | [Before](before-320x640.png)  | [After](after-320x640.png)  |
| 375 × 812           | [Before](before-375x812.png)  | [After](after-375x812.png)  |
| 390 × 844           | [Before](before-390x844.png)  | [After](after-390x844.png)  |
| 430 × 932           | [Before](before-430x932.png)  | [After](after-430x932.png)  |
| 768 × 1024          | [Before](before-768x1024.png) | [After](after-768x1024.png) |
| 740 × 360 landscape | [Before](before-740x360.png)  | [After](after-740x360.png)  |
| 1440 × 900          | [Before](before-1440x900.png) | [After](after-1440x900.png) |

At 390px the terminal grows from 286px to 374px; at 320px it grows from 216px to
304px. Controls wrap as complete units. Landscape visitors can scroll the
terminal body to the prompt without moving the toolbar.

Additional captures: [regenerated Blender model](regenerated-390x844.png) and
[illustration fallback](fallback-390x844.png). Automated screenshot baselines
cover desktop Chromium, mobile Chromium, and mobile WebKit in
`tests/e2e/christmas-layout.spec.ts-snapshots/`. Automated comparisons use the
repository’s bundled font to avoid host-installed font metric differences; the
manual before/after captures retain the normal runtime font selection.

## Defects and coverage

- Remove the mobile ornament gutter, scale the hat above the title bar, retain
  the entire 44px tip hit target, and use 44px language/music/help controls.
- Position the interactive tip during layout rather than after painting; ignore
  ResizeObserver's initial unchanged-size notification.
- The Safari failure reproduces when an immediate bounds read sees a stale
  composited transform. Pointer logs show all moves arriving; the next read
  shows the expected 34px displacement. Poll the original >10px assertion.
- Native Chromium and WebKit touch gestures exercise trusted touch pointers,
  release, and cancellation. The WebKit protocol adapter is test-only and tied
  to the locked Playwright version; recheck it on Playwright upgrades.
- Replace deferred caret animation frames with selection updates synchronized
  with the committed input value. The two regression tests fail against the
  original hook (selection jumps from 3 back to 4) and pass with the correction.
- Validate model alignment, header, finite values, complete triangles, nonzero
  normals, rig indices/fractions, and distinct joints before creating WebGL
  resources. Context loss shows the illustration; restoration rebuilds the GPU
  resources without another network request.
- Preserve calendar boundaries, production preview isolation, theme/Matrix
  preferences, reduced motion, music opt-in, playlist skipping, and soundtrack
  restoration. Existing tests cover these; new coverage checks hidden-tab snow,
  phone widths/centering, rotation, native touch, corrupt data, and context recovery.

## Blender and performance

Blender 5.2.2 LTS regenerated the editable `.blend` and binary in `/tmp`, without
replacing either approved repository asset. Both binaries have 72,552 vertices,
24,184 triangles, 3,192,348 bytes, identical bounds, and the same position
multiset rounded to five decimals. Stream order differs, so byte hashes differ;
see [model-validation.json](model-validation.json). Regenerated appearance was
checked in the browser. The model is about 374KB with gzip; static hosting
compression policy determines actual wire size.

The GPU vertex buffer is about 3.04MiB; render resolution is capped at 2× device
pixels and the hat does not run an animation loop at rest. A 6× CPU-throttled
headless Chromium sample is recorded in [performance.json](performance.json).
It includes software WebGL and other page effects, and is not a physical-device
GPU benchmark. Low-end phone GPU/battery profiling remains a hardware check;
there is insufficient evidence to replace the approved mesh with a lower-detail
export in this fix.

## Audio provenance

The owner confirmed redistribution rights in this task and asked that both MP3s
remain. The owner will add provenance/license records later. No recording was
removed or replaced, and no independent license verification is claimed.

## Verification

- `pnpm lint`: passed.
- `pnpm lint:css`: passed.
- `pnpm test:unit`: 58 passed.
- `pnpm build`: passed, including TypeScript.
- `CI=true GITHUB_ACTIONS=true GITHUB_REPOSITORY=dr-developer1/portfolio pnpm test:e2e --workers=2`: 66 passed, 3 intentional skips. This includes the committed screenshot comparisons.
- Previously failing drag/history checks: 60 passed across ten repetitions per browser project.
- Strict static UI audit: no findings.
- Blender regeneration: exited successfully, produced both files; original assets retained.
