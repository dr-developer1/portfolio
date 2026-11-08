# PR #24: corrected title bar and mobile toolbar

Implements the [corrected follow-up review](https://github.com/dr-developer1/portfolio/pull/24#issuecomment-6723991740), against reviewed commit `34ad64b`.

Help and Music stay in the top title bar in every season. The Christmas title bar
uses three columns and a 60px right inset to keep its actions clear of the hat.
The middle title truncates within the space between the dots and actions.
Language and CV alone occupy the lower toolbar: opposite ends above 400px,
centered language and full-width CV rows at 400px and below. The full-width
mobile frame, desktop gutter, hat geometry, audio and seasonal behavior remain.
Mobile title-bar buttons have 44px targets in both seasons.

## Before and after

Unmasked Chromium captures, reduced motion, December 20 visitor-local calendar,
normal runtime fonts. Before is `34ad64b`; after is this follow-up. English and
French were captured independently at every requested viewport.

| Viewport   | English before                   | English after                  | French before                    | French after                   |
| ---------- | -------------------------------- | ------------------------------ | -------------------------------- | ------------------------------ |
| 320 × 640  | [Before](before-en-320x640.png)  | [After](after-en-320x640.png)  | [Before](before-fr-320x640.png)  | [After](after-fr-320x640.png)  |
| 375 × 812  | [Before](before-en-375x812.png)  | [After](after-en-375x812.png)  | [Before](before-fr-375x812.png)  | [After](after-fr-375x812.png)  |
| 390 × 844  | [Before](before-en-390x844.png)  | [After](after-en-390x844.png)  | [Before](before-fr-390x844.png)  | [After](after-fr-390x844.png)  |
| 430 × 932  | [Before](before-en-430x932.png)  | [After](after-en-430x932.png)  | [Before](before-fr-430x932.png)  | [After](after-fr-430x932.png)  |
| 440 × 956  | [Before](before-en-440x956.png)  | [After](after-en-440x956.png)  | [Before](before-fr-440x956.png)  | [After](after-fr-440x956.png)  |
| 600 × 900  | [Before](before-en-600x900.png)  | [After](after-en-600x900.png)  | [Before](before-fr-600x900.png)  | [After](after-fr-600x900.png)  |
| 768 × 1024 | [Before](before-en-768x1024.png) | [After](after-en-768x1024.png) | [Before](before-fr-768x1024.png) | [After](after-fr-768x1024.png) |
| 740 × 360  | [Before](before-en-740x360.png)  | [After](after-en-740x360.png)  | [Before](before-fr-740x360.png)  | [After](after-fr-740x360.png)  |
| 1440 × 900 | [Before](before-en-1440x900.png) | [After](after-en-1440x900.png) | [Before](before-fr-1440x900.png) | [After](after-fr-1440x900.png) |

## Regression checks

The new title-bar test fails against the reviewed code because Help is outside
that bar. Checks cover containment, point hit testing, title spacing/truncation,
44px action targets, hat/action separation, lower-row separation, full mobile
width, both localized CV URLs, keyboard Help/escape/focus restoration, music
touch/click and keyboard toggling, and regular-season controls. Hat hit probes
sample its circular target at the center and four cardinal edges; rectangular
controls include their corners. Existing hat drag and terminal caret assertions
remain unchanged. The three intentional screenshot baseline changes reflect the
restored title-bar actions and corrected lower row.

The keyboard test resizes to the viewport area available with a keyboard and
checks prompt focus/reachability and toolbar actions. Emulation cannot open a
physical operating-system keyboard; this is not a physical-device claim.

## Validation

- `pnpm lint`: passed.
- `pnpm lint:css`: passed.
- `pnpm test:unit`: 63 passed across 14 files.
- Production TypeScript/build: passed through Playwright's `pnpm build` web server setup.
- `CI=true GITHUB_ACTIONS=true GITHUB_REPOSITORY=dr-developer1/portfolio pnpm test:e2e --workers=2`: **104 passed, 4 intentional skips** (4.5 minutes), including all screenshot comparisons.
- Additional finalized toolbar checks against the dev preview: 21 passed across Chromium, mobile Chrome and mobile Safari.
- Prettier, `git diff --check`, and the strict premium UI static audit: passed, no findings.

Delivery gate: responsive width/overflow and hit targets PASS (geometry and point tests);
keyboard/focus and actions PASS (actual Tab, Enter, Escape, click and touch checks);
locale and layout consistency PASS (both CV URLs, 36 captures, three browser baselines);
existing visual identity and asset integrity PASS (existing tokens/typography and approved
hat/audio assets retained; no new product claims or decoration).

## CI focus race

The first follow-up push passed push CI, while PR CI caught the existing boot
language-keyboard race (`languages.spec.ts:87`). Its trace ended in the terminal
in English: Enter started boot instead of activating the focused French button.
`StartPrompt` had a 100ms autofocus timer that could run between explicit button
focus and Enter. The fix sets initial focus in the layout phase only when the
body owns focus, so it cannot steal a visitor's chosen control. Both deterministic
unit regressions fail against the old timer and pass with the fix. No browser
assertion, timeout or retry was weakened.

The language keyboard scenario also passed 30 repeats (10 per browser) on the
corrected source. A concurrently loaded local run then exposed the existing
slow-frame hat settling issue: physics discarded elapsed time above 100ms while
the browser test measures real time. The integrator now catches up through up to
one second per frame using its existing stable 180Hz substeps. Unit checks cover
250ms, 500ms and 1s frame intervals; the latter two fail with the old cap. Normal
frame timing and the existing eight-second browser settling assertion are unchanged.
The unchanged normal-motion browser settling test passed in all three browsers
with the corrected integrator, including under concurrent browser load.
