# Portfolio OS

Ahmad Ibrahim’s interactive portfolio, built with React, TypeScript, and Vite.
English and French career content follows the supplied CVs, with a matching PDF
available before boot and throughout the terminal session.

## Experience

- Persistent EN / FR controls next to a PDF download that names its language
- Locale precedence: valid `?lang=`, saved choice, French browser language, English
- One line of clickable command hints, hidden after the first command
- Optional guided paths remain available through explicit commands
- CV-backed profile, work history, education, core stack, and spoken languages
- Existing personal and academic projects clearly distinguished from professional work
- Career output already in terminal history translates when the language changes
- Shareable commands preserve the active language: `?lang=fr&run=experience`
- Original system boot prompt, oscilloscope name trace, CRT effects, and monospace typography
- Reduced-motion support; music off until enabled
- Virtual filesystem, search, themes, hidden commands, and a coding playground

Executable command names, virtual paths, technical shell output, boot logs,
playground tools, and hidden Easter eggs retain English vocabulary. Use `help`
for localized navigation and `help <command>` for technical syntax.

## Development

Use **Node 26 LTS** (exact version in `.node-version`) and **pnpm 12.15.0**
(pinned by `packageManager`). Install Node with your preferred runtime manager;
no nvm setup is required.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm-workspace.yaml` explicitly permits esbuild’s installation script. Other
dependency build scripts require their own policy decision.

```bash
pnpm lint
pnpm lint:css
pnpm exec prettier --check <changed-files>
pnpm test:unit
pnpm build
pnpm exec playwright install chromium webkit
pnpm test:e2e
```

The unit runner disables Node’s native Web Storage in its workers so jsdom owns
browser storage during tests. This matters on Node 26.

## Navigation

- `about`, `highlights`, `skills`, `experience`, `education`: CV-backed career information
- `projects`, `top-projects`: existing personal and academic projects
- `resume` / `cv`: the current language’s CV
- `open resume`: open the current language’s PDF
- `language en|fr`: change display language and CV
- `mode recruiter|engineer|founder|client|standard`: change perspective
- `tour`, `recommend`, `contact`: guided discovery and contact
- `ls`, `cd`, `cat`, `pwd`, `tree`, `find`, `grep`: explore the virtual filesystem
- `playground --demo` / `playground --challenge debugging`: coding workspace
- `theme`, `music`, `effect`: appearance and optional effects

## Content and design

- `src/data/content.ts`: English and French CV content; retained project data
- `src/i18n/locale.ts`: locale preference, document metadata, PDF routing
- `src/i18n/paths.ts`: translated perspectives and shortcut labels
- `src/components/Navigation/*`: shared language/CV toolbar and path launcher
- `src/components/Output/PortfolioSection.tsx`: reactive translated career output
- `src/data/commands.tsx`: command registry and technical shell commands
- `src/utils/fileSystem.ts`: locale-specific virtual files with stable paths
- `DESIGN.md`: visual direction, token ownership, accessibility, and locale boundaries

The supplied CVs live at `public/CV_Ahmad_IBRAHIM.pdf` (French) and
`public/CV_Ahmad_IBRAHIM_En.pdf` (English). The legacy `public/resume.pdf` URL
contains the updated English CV for compatibility. Update all three together
when replacing the CVs. PDF paths respect Vite’s base URL on GitHub Pages.

## Verification and deployment

Unit tests cover command execution, parser/completion, virtual files, locale
precedence and unavailable storage, CV routing, and mobile viewport helpers.
Playwright covers boot, both actual PDF downloads, language persistence and
keyboard switching, command hints, translation of existing history, and
mobile command focus/visibility in Chromium and WebKit.

CI and GitHub Pages builds install pinned pnpm, read Node from `.node-version`,
and use the frozen pnpm lockfile. CI runs lint, CSS lint, unit tests, and a
production build; a separate browser job runs Chromium and WebKit checks. Pages deploys only from `main`; feature branches do not deploy.
The static build is also compatible with Vercel, Netlify, and Cloudflare Pages.

After a successful Pages deployment from `main`, the workflow publishes a GitHub
release with generated notes using the version in `package.json` (for example,
`3.1.0` becomes `v3.1.0`). Existing releases are skipped, so redeploying a version
does not publish a duplicate. Bump `package.json` to a new stable version in a PR
when preparing the next release. Failed deployments do not publish releases.
To retry release publication, rerun the failed release job in GitHub Actions.

Browser checks follow the GitHub Pages base path in CI. To reproduce CI's cold
build and browser startup locally (with port 4173 free):

```bash
CI=true GITHUB_ACTIONS=true GITHUB_REPOSITORY=dr-developer1/portfolio pnpm test:e2e --workers=2
```
