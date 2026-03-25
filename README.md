# Portfolio OS

Interactive terminal-style portfolio built with React, TypeScript, and Vite. The site is fully client-side and combines a terminal shell, hidden modes, a lightweight coding playground, and recruiter-friendly guided navigation.

## Highlights

- Recruiter-first terminal UX with guided commands like `tour`, `highlights`, `top-projects`, and `why-me`
- Virtual filesystem commands: `ls`, `cd`, `cat`, `pwd`, `tree`
- Search and navigation commands: `find`, `grep`, `open`, `recommend`
- Hidden depth: `sudo`, `vault`, `interview`, `legacy`, `incident`, `openai`, `coffee`
- Persistent themes, Matrix/music toggles, local achievements, and visitor stats
- Monaco-based playground with demo and challenge presets

## Stack

- React 19
- TypeScript
- Vite
- Monaco Editor
- CSS Modules
- Web Workers for playground execution

## Local Development

This project expects Node to be managed with `nvm`.

```bash
source ~/.nvm/nvm.sh
nvm use
npm install
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run lint:css
npm run test:unit
npm run test:e2e
```

## Core Commands

- `help`: grouped command overview
- `highlights`: strongest recruiter-facing wins
- `tour`: guided recruiter path
- `mode recruiter|engineer|founder|client`: switch visitor path
- `projects` / `top-projects`: portfolio project views
- `playground --demo` / `playground --challenge debugging`
- `find <keyword>` / `grep <term> <target>`
- `stats`: local usage and discovery progress

## Architecture Notes

- `src/hooks/useTerminal.tsx`: terminal state, command execution, virtual shell behavior
- `src/data/commands.tsx`: typed command registry and grouped command surface
- `src/utils/fileSystem.ts`: in-memory filesystem generated from portfolio content
- `src/utils/portfolioInsights.tsx`: highlights, guided paths, search, and open-target helpers
- `src/components/Playground/*`: playground UI and mobile variant

## Testing

Unit tests cover parser, completion, command registry behavior, filesystem basics, and secret-code detection.

Playwright smoke coverage is scaffolded for the boot flow and guided experience.

## CI

GitHub Actions runs:

- ESLint
- Stylelint
- Unit tests
- Production build

The workflow reads the Node version from `.nvmrc`.

## Deployment

The app is static and can be deployed to:

- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages

Build output is generated with:

```bash
npm run build
```
