# Portfolio OS

Ahmad Ibrahim’s interactive terminal portfolio, built with React, TypeScript,
and Vite. It supports English and French, downloadable CVs, a virtual filesystem,
a coding playground, themes, and optional audio and visual effects.

## Local development

Use the Node version in [`.node-version`](.node-version) and the pnpm version
pinned by `packageManager` in [`package.json`](package.json).

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## Commands and navigation

Use `help` for available commands and `help <command>` for syntax.

| Commands                                                   | Purpose                                   |
| ---------------------------------------------------------- | ----------------------------------------- |
| `about`, `highlights`, `skills`, `experience`, `education` | Career information                        |
| `projects`, `top-projects`                                 | Personal and academic projects            |
| `resume` / `cv`, `open resume`                             | Download or open the active language’s CV |
| `language en`, `language fr`                               | Change language and matching CV           |
| `mode`, `tour`, `recommend`, `contact`                     | Guided discovery and contact              |
| `ls`, `cd`, `cat`, `pwd`, `tree`, `find`, `grep`           | Explore the virtual filesystem            |
| `playground --demo`, `playground --challenge debugging`    | Open the coding workspace                 |
| `theme`, `music`, `effect`                                 | Configure appearance and effects          |

Locale selection follows `?lang=en|fr`, the saved preference, the browser’s French
language setting, then English. Language changes translate career output already
in terminal history. Shared commands retain the locale, for example
`?lang=fr&run=experience`. Executable commands, virtual paths, technical shell
output, boot logs, and playground tools use English vocabulary.

Help and Music sit in the title bar. Language and CV controls remain available
before and after boot. Initial command hints disappear after the first command.

## Maintaining content and assets

| Location                              | Contents                                                |
| ------------------------------------- | ------------------------------------------------------- |
| `src/data/content.ts`                 | English/French CV content and project descriptions      |
| `src/data/commands.tsx`               | Command registration and shell behavior                 |
| `src/i18n/locale.ts`                  | Locale preference, document metadata, and CV paths      |
| `src/i18n/paths.ts`                   | Translated perspectives and shortcut labels             |
| `src/utils/fileSystem.ts`             | Locale-specific virtual files with stable paths         |
| `src/components/Navigation/`          | Shared language/CV controls and path launcher           |
| [DESIGN.md](DESIGN.md)                | Visual direction, tokens, layout, and interaction rules |
| [docs/models/](docs/models/README.md) | Blender source, export format, and model maintenance    |

Keep profile, experience, education, stack, and spoken languages consistent with
the CVs. Personal and academic projects are labeled separately from work history.
When replacing a CV, update these public files together:

- `public/CV_Ahmad_IBRAHIM.pdf`: French.
- `public/CV_Ahmad_IBRAHIM_En.pdf`: English.
- `public/resume.pdf`: English compatibility URL.

### Audio

Music is off until enabled. Keep these filenames when replacing or recompressing
recordings:

- `public/audio/background.mp3`: regular soundtrack.
- `public/audio/let-it-snow.mp3`: first seasonal track.
- `public/audio/all-i-want-for-christmas-is-you.mp3`: second seasonal track.

The seasonal tracks loop in order. Missing or unplayable seasonal tracks are
skipped; if neither plays, the seasonal soundtrack stays silent. The regular
soundtrack returns when the seasonal appearance ends. Keep provenance and
redistribution-license records with audio assets; the code’s MIT license does
not license third-party recordings.

### Seasonal appearance

From November 15 through January 15 inclusive, using the visitor’s local calendar,
the portfolio uses its Christmas palette, snowfall, and interactive Santa hat.
Theme commands cannot override the event or replace the saved theme. January 16
restores the saved appearance and regular soundtrack. Open tabs recheck the date
every 30 seconds and on focus.

Drag the hat’s pom-pom, or focus it and press Enter. Reduced motion removes
settling animation and makes snow stationary; hidden tabs pause animation. An
illustration replaces the hat if its model or WebGL is unavailable.

Preview either appearance with `?season=christmas` or `?season=normal` on the local
development server. Production builds ignore these overrides.

## Checks

```bash
pnpm lint
pnpm lint:css
pnpm exec prettier --check <changed-files>
pnpm test:unit
pnpm build
pnpm exec playwright install chromium webkit
pnpm test:e2e --workers=2
```

Unit tests use jsdom-owned browser storage rather than Node’s native Web Storage.
Playwright runs desktop Chromium, mobile Chrome, and mobile Safari. Its committed
image baselines live under `tests/e2e/christmas-layout.spec.ts-snapshots/`; review
visual changes before updating them. Local traces, screenshots, and reports are
ignored by Git. CI uploads browser artifacts on failure.

To reproduce CI’s production build and GitHub Pages base path, keep port 4173 free
and run:

```bash
CI=true GITHUB_ACTIONS=true GITHUB_REPOSITORY=dr-developer1/portfolio pnpm test:e2e --workers=2
```

## Deployment and releases

On pull requests, CI installs the pinned Node/pnpm versions with the frozen lockfile, then runs
lint, CSS lint, unit tests, production build, and browser checks. The Pages workflow
builds and deploys `main`; Vite derives its base path from `GITHUB_REPOSITORY`
when `GITHUB_ACTIONS` is set. The generated site is in `dist/`.

After deployment, the workflow publishes a release tagged with the stable version
in `package.json`, such as `v3.1.0`. Existing releases are skipped. Bump the version
when preparing a release; rerun the release job if publication fails.
