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
- `pnpm test:unit`: 58 passed across 13 files.
- Production TypeScript/build: passed through Playwright's `pnpm build` web server setup.
- `CI=true GITHUB_ACTIONS=true GITHUB_REPOSITORY=dr-developer1/portfolio pnpm test:e2e --workers=2`: **104 passed, 4 intentional skips** (4.5 minutes), including all screenshot comparisons.
- Additional finalized toolbar checks against the dev preview: 21 passed across Chromium, mobile Chrome and mobile Safari.
- Prettier, `git diff --check`, and the strict premium UI static audit: passed, no findings.

Delivery gate: responsive width/overflow and hit targets PASS (geometry and point tests);
keyboard/focus and actions PASS (actual Tab, Enter, Escape, click and touch checks);
locale and layout consistency PASS (both CV URLs, 36 captures, three browser baselines);
existing visual identity and asset integrity PASS (existing tokens/typography and approved
hat/audio assets retained; no new product claims or decoration).
