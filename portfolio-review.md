# Portfolio Code Review & Award-Submission Plan

**Reviewer:** Senior Engineer / Client perspective  
**Target:** Awwwards / CSS Design Awards submission  
**Verdict before fixes:** Not ready. Strong concept, real effort in mobile handling and the gamification layer — but multiple architectural mistakes, one critical broken feature, and a banner that is the weakest visual element on the page. All fixable. Read every section.

---

## Table of Contents

1. [Overall Assessment](#1-overall-assessment)
2. [Critical Blocking Issues](#2-critical-blocking-issues)
3. [Architecture Issues](#3-architecture-issues)
4. [Design & CSS Mistakes](#4-design--css-mistakes)
5. [Feature Gaps for Award Submission](#5-feature-gaps-for-award-submission)
6. [3D Banner — Concept & Specification](#6-3d-banner--concept--specification)
7. [SEO, Meta & Performance](#7-seo-meta--performance)
8. [Accessibility](#8-accessibility)
9. [Testing Gaps](#9-testing-gaps)
10. [Complete Action Plan](#10-complete-action-plan)

---

## 1. Overall Assessment

**What works well:**

- The keyboard viewport / mobile focus management (`useKeyboardViewport`, `useEnsureFocusedElementVisible`) is genuinely well-engineered. That problem is hard on iOS and this code handles it correctly.
- The theme system using CSS variables is clean and extensible.
- The tab-completion engine with cycling and path resolution is a nice UX detail.
- Pyodide + Monaco worker architecture for the in-browser playground is impressive.
- Prefers-reduced-motion is handled for the matrix rain. Good.

**What does not work:**

- The `history`, `ls`, `cd`, `pwd`, `cat`, and `tree` commands are all broken — they have empty `execute: () => {}` bodies registered in the command registry with zero implementation. A judge clicking around will hit this immediately.
- The ASCII banner at 5–6px on mobile is illegible. On an award submission the banner is the hero element. This is the first thing a judge sees.
- The `sudo` command silently grants admin access before checking arguments, making the entire "discover 6 commands to unlock the vault" mechanic trivially bypassed.

---

## 2. Critical Blocking Issues

These must be fixed before submission. They are functional regressions, not style opinions.

### 2.1 Six commands have empty execute bodies — they are completely broken

**File:** `src/data/commands.tsx`, lines 10124–10165

```ts
const historyCommand: Command = {
  name: 'history',
  execute: () => {}, // ← does nothing. Broken.
};
const lsCommand: Command = {
  name: 'ls',
  execute: () => {}, // ← broken
};
// ... same for cd, pwd, cat, tree
```

These commands are registered in the registry but produce zero output. Running `ls` or `history` in the terminal returns a blank line. A judge who types the most basic Unix commands will immediately think the project is unfinished — because it is, in this area.

**Why this happened:** These commands appear to be handled inside `useTerminal` (the state hook manages `cd` directory changes, `ls` renders the virtual filesystem) but the `Command` objects registered in the registry have been left as stubs. This creates a split execution model where some commands run through the registry and some are intercepted elsewhere. The two paths are invisible to each other, which will create bugs the moment the registry route is accidentally hit.

**Fix:** Either fully implement these commands inside the `execute` function (reading from the virtual filesystem, updating `currentDirectory` via context), or remove them from the registry entirely and document that they are handled by the terminal state machine. Mixing both paths is the real mistake.

### 2.2 `sudo` unconditionally calls `unlockAdmin()` before checking arguments

**File:** `src/data/commands.tsx`, line 10920

```ts
execute: (args, addOutput, context) => {
  unlockAdmin();                        // ← called for ANY sudo invocation
  context?.setBootMode?.('admin');
  if (args[0] === 'unlock' || args[0] === 'su') {
    unlockVault();                      // vault also unlocked
    ...
  }
  ...
}
```

Running bare `sudo` with no arguments permanently sets `adminUnlocked: true` in localStorage. The vault check `progress.adminUnlocked || progress.discoveredCommands.length >= 6` is now always satisfied. The entire discovery/exploration mechanic is dead on arrival — anyone who types `sudo` for any reason gets admin access silently.

**Fix:** Move `unlockAdmin()` inside the `args[0] === 'unlock'` branch. Bare `sudo` should give the "temporary shell" message without writing to progress state.

### 2.3 `getVisitorProgress()` called during render without memoization

**File:** `src/components/Terminal/TerminalOutput.tsx`, line 8580

```ts
export const TerminalOutput: React.FC = () => {
  const { history, visitorMode } = useTerminalContext();
  const progress = getVisitorProgress();   // ← direct localStorage read on every render
  const isReturningVisitor = progress.visits > 1;
  ...
```

`getVisitorProgress()` reads from localStorage synchronously on every render of `TerminalOutput`. This is a stale read — it captures progress at render time, not reactively. If an achievement is unlocked mid-session, the "Recruiter tour progress" counter will not update until the component re-renders for an unrelated reason. More importantly, synchronous storage reads in render are a React anti-pattern and will fail under React 18 concurrent features.

**Fix:** Move `getVisitorProgress()` into a `useMemo` or expose progress through the terminal context so it participates in React's reactivity model.

---

## 3. Architecture Issues

### 3.1 `commands.tsx` is a 10,000-line god file — this is not a style complaint, it is an architectural failure

The entire command system — 50+ commands, their JSX output, business logic, helper utilities, and the command registry — lives in one file. This creates:

- **Compile-time coupling:** Changing one command forces a full re-parse and re-type-check of 10,000 lines.
- **Untestable units:** You cannot unit-test `vaultCommand` in isolation without importing every other command in the file.
- **Merge conflicts:** Any two features added simultaneously will conflict.
- **Zero discoverability:** A new contributor reading the codebase has no idea where `weatherCommand` ends and `diagnoseCommand` begins.

The correct structure:

```
src/commands/
  core/
    help.tsx
    clear.tsx
    history.tsx
    echo.tsx
  career/
    about.tsx
    skills.tsx
    experience.tsx
    education.tsx
    projects.tsx
    contact.tsx
  system/
    date.tsx
    ping.tsx
    uptime.tsx
    neofetch.tsx
  playground/
    playground.tsx
  fun/
    vault.tsx
    sudo.tsx
    coffee.tsx
    matrix.tsx
  index.ts   ← assembles and exports basicCommands[]
```

Each file exports a single `Command` object. The `index.ts` aggregates them. This is the change that makes the codebase actually maintainable.

### 3.2 Achievement system uses a global event bus bypassing React state

**Files:** `src/utils/progressService.ts` (dispatch) + `src/components/Terminal/Terminal.tsx` (listen)

The progress service fires `window.dispatchEvent(new CustomEvent('achievement-unlocked', ...))`. The Terminal component listens on `window.addEventListener('achievement-unlocked', ...)`.

This creates hidden coupling between a utility module and a UI component through the global window object. This will not be caught by TypeScript. It cannot be tested without a real browser. If `Terminal.tsx` is unmounted while an async command is running, the event fires into nothing — silently dropped.

**Fix:** Thread achievement unlocks through the terminal context. `executeCommand` already returns a result — augment it to return `{ unlocked: Achievement[] }` and let the Terminal component react to that value through normal React state.

### 3.3 `CommandContext` uses optional callbacks for required operations

**File:** `src/types/index.ts`, lines 8288–8291

```ts
export interface CommandContext {
  bootMode: BootMode;
  currentDirectory: string;
  user: string;
  symbol: string;
  visitorMode: VisitorMode;
  sessionStartedAt: number;
  openPlayground?: (preset?: PlaygroundPresetId) => void; // optional
  closePlayground?: () => void; // optional
  setVisitorMode?: (mode: VisitorMode) => void; // optional
  setBootMode?: (mode: BootMode) => void; // optional
}
```

And the execute signature:

```ts
execute: (args: string[], addOutput: OutputFunction, context?: CommandContext) => void
```

`context` is optional. Commands that call `context?.setBootMode?.('admin')` will silently do nothing if context is absent. There is no TypeScript error, no runtime error — the operation simply doesn't happen. The `mode` command, `sudo`, and `playground` all depend on these optional callbacks and will silently break if context is not passed.

**Fix:** Make `context` required. If a command does not need context, it ignores it. The cost is zero; the benefit is that missing context causes a compile error instead of a silent no-op.

### 3.4 Prompt rendering is duplicated across three locations

The user/hostname/directory prompt string is manually composed in:

1. `TerminalInputDesktop.tsx` — inline spans, not using `PromptDisplay`
2. `TerminalInputMobile.tsx` — same inline spans
3. `PromptDisplay.tsx` — the actual shared component

The `PromptDisplay` component exists specifically to avoid this duplication, but it is only used inside command output rendering (`handleSubmit` when showing `^C`, empty line output) — not for the actual live input prompt. Both input components rebuild the prompt structure manually. Any prompt styling change must now be made in three places.

**Fix:** Use `PromptDisplay` in both input components for the prompt prefix. The component already accepts `children` for the input portion.

### 3.5 The `ping` command is misleading

**File:** `src/data/commands.tsx`, `pingCommand`

```ts
execute: async (_args, addOutput) => {
  addOutput(<span>Pinging host…</span>);
  const startedAt = performance.now();
  try {
    await fetch(`${window.location.origin}/`, { method: 'HEAD', cache: 'no-store' });
    const elapsed = Math.round(performance.now() - startedAt);
    addOutput(<span>pong {elapsed}ms</span>, 'success');
  }
```

This is an HTTP HEAD request to the site's own origin. It measures HTTP round-trip time, not ICMP ping latency. On a CDN-served site like GitHub Pages, this will mostly measure CDN cache hit time (typically 3–15ms), which is meaningless. Worse, it includes DNS resolution and TCP handshake on the first call. The result looks authoritative but is technically wrong.

**Fix:** Either rename it `http-ping` with a comment explaining what it measures, or use the `performance.timing` API to derive a real network latency estimate.

### 3.6 `soundService.ts` uses module-level mutable singletons

```ts
let ctx: AudioContext | null = null;
let lastKeyClickAt = 0;
```

These module-level variables are shared across all component instances. In React Strict Mode (double-invocation), two concurrent renders will share the same `AudioContext`. If the context enters `suspended` state and `void ctx.resume()` is called without awaiting, the promise is dropped silently. The `catch {}` block in `playKeyClick` swallows all errors with no logging.

This is low-severity for a portfolio site but will cause debugging nightmares if audio breaks in production — the empty catch makes the failure mode completely invisible.

---

## 4. Design & CSS Mistakes

### 4.1 Hardcoded `#000` in `PlaygroundMobile.module.css` breaks theming

**File:** `src/components/Playground/PlaygroundMobile.module.css`, line 1626

```css
.consoleOutput {
  ...
  background: #000;   /* ← hardcoded, ignores theme variables */
}
```

Every other background color in the codebase uses CSS variables (`var(--color-bg-primary)` etc.). This single hardcoded value means the console output background will not update if the theme changes. Use `var(--color-bg-code)` or define a new `--color-bg-console` token.

### 4.2 `!important` used as a specificity workaround in `PlaygroundMobile.module.css`

```css
.activeTab {
  color: var(--color-accent-blue) !important;
  border-top-color: var(--color-accent-blue) !important;
  background: rgb(255 255 255 / 5%) !important;
}
```

Three `!important` declarations on a single rule means the selector specificity is wrong. CSS Modules generates unique class names — there is no reason for specificity conflicts. The `.bottomNav button` rule overrides `.activeTab` because it targets the element type. Fix the selector order or use `.bottomNav .activeTab` — do not use `!important`.

### 4.3 Inline styles used for layout in `PlaygroundMobile.tsx`

**File:** `src/components/Playground/PlaygroundMobile.tsx`, lines 3752–3776

```tsx
<div
  style={{ padding: '0 1rem 1rem 1rem', borderBottom: '1px solid var(--color-border)' }}
>
  <label
    htmlFor="mobile-lang-select"
    style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}
  >
```

The rest of `PlaygroundMobile` uses CSS modules. These two inline style objects are inconsistent with the established pattern and will not be caught by the linter. They belong in `PlaygroundMobile.module.css`.

### 4.4 `fade-in-up` animation on every terminal line has no `prefers-reduced-motion` guard

**File:** `src/components/Terminal/TerminalOutput.module.css`

```css
.line {
  animation: fade-in-up 0.2s ease-out;
}
```

The `crt-on` startup animation in `Terminal.module.css` correctly wraps itself in `@media (prefers-reduced-motion: no-preference)`. The per-line `fade-in-up` does not. Every line rendered in the terminal animates unconditionally for users who have requested reduced motion. This is an accessibility and consistency failure.

**Fix:**

```css
@media (prefers-reduced-motion: no-preference) {
  .line {
    animation: fade-in-up 0.2s ease-out;
  }
}
```

### 4.5 Empty `.container {}` rules are dead CSS

**Files:** `JobEntry.module.css`, `ProjectCard.module.css`, `EducationEntry.module.css`

```css
.container {
}
```

These empty rules contribute nothing. They likely existed to hold future styles that were never added, or the styles were moved elsewhere. Delete them.

### 4.6 `outputUtilities.module.css` is a utility class anti-pattern in a CSS Modules codebase

`outputUtilities.module.css` contains 60+ utility classes (`.flexColumn`, `.marginTopSmall`, `.accentCyan`, `.bold`, etc.) that are imported and composed throughout `commands.tsx`. This is Tailwind-without-Tailwind. The CSS Modules pattern works best when styles are co-located with their component. Having a centralized utility stylesheet that every command imports creates the same coupling problem that CSS Modules was designed to eliminate.

Either commit to a proper utility CSS framework (Tailwind, UnoCSS) or structure command output as React components with their own co-located module CSS. The current hybrid is the worst of both approaches.

### 4.7 Banner font loaded with a waterfall that degrades to blur

**File:** `src/components/Terminal/TerminalOutput.tsx`

```tsx
style={
  isBannerFontReady
    ? undefined
    : { fontFamily: 'monospace', opacity: 0.75, filter: 'blur(0.2px)' }
}
```

The banner renders blurred with system monospace until `document.fonts.load()` resolves. On slow connections this can last 1–3 seconds. The blur is visible on load. For an award submission this is noticed.

**Fix:** Preload the font in `index.html` using `<link rel="preload" href="/fonts/JetBrainsMonoBanner-Regular.woff2" as="font" type="font/woff2" crossorigin>`. This eliminates the FOUT entirely.

---

## 5. Feature Gaps for Award Submission

Awwwards judges specifically look for: originality, creativity, design quality, usability, and content. Here are the gaps that will cost points.

### 5.1 No `og:` meta tags — the social preview is broken

The file `og-preview.png` exists in `/public` but there are no `<meta property="og:image">` tags in `index.html`. Sharing the portfolio URL on LinkedIn, Twitter, or Slack will show no preview image — a missed opportunity every time a recruiter or engineer shares the link.

**Required tags in `index.html`:**

```html
<meta property="og:title" content="Ahmad Ibrahim — Full Stack Engineer" />
<meta property="og:description" content="Interactive terminal portfolio. Type 'help' to explore." />
<meta property="og:image" content="https://yourdomain.com/og-preview.png" />
<meta property="og:url" content="https://yourdomain.com" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://yourdomain.com/og-preview.png" />
```

### 5.2 No `lang` attribute on `<html>`

The `index.html` `<html>` tag is missing `lang="en"`. This fails WCAG 2.1 criterion 3.1.1 and is the first check in any automated accessibility audit.

### 5.3 The "Who are you?" path system is incomplete

The `mode` command allows visitors to self-identify as `recruiter`, `engineer`, `founder`, or `client`. The `visitorMode` state is stored in context and persisted. However:

- The only visual change when setting a mode is that the quick-start title changes from "Quick start" to "Recruiter quick start" (only for recruiters).
- `mode engineer`, `mode founder`, and `mode client` produce no visible differentiation in the terminal output.
- Commands like `experience`, `projects`, and `highlights` render identically regardless of `visitorMode`.

This system was clearly designed to show different content to different visitors, but it is not implemented beyond the recruiter label. Either implement it fully or remove the feature — a half-built feature that promises personalization and delivers none is actively negative.

**Implementation spec for each mode:**

| Mode        | `highlights`                                       | `projects`                   | `about`                          | Extra command                              |
| ----------- | -------------------------------------------------- | ---------------------------- | -------------------------------- | ------------------------------------------ |
| `recruiter` | Lead with employment dates, availability           | Filter `featured: true` only | Tagline + availability           | `availability` auto-suggests               |
| `engineer`  | Lead with architecture decisions, tech stack depth | Show repo links, tech stack  | Focus on technical depth         | `playground` auto-suggests                 |
| `founder`   | Lead with ownership, shipped products, speed       | Lead with impact metrics     | Focus on delivery and ownership  | `highlights` filtered for product outcomes |
| `client`    | Lead with client-facing outcomes                   | Lead with `url` (live demos) | Focus on communication, autonomy | `contact-me` auto-suggests                 |

### 5.4 The `share` command generates a URL but does not produce an OG preview for shared commands

When `share tour` is run, the URL `?run=tour` is generated. But visiting that URL shows the same generic OG preview. A visitor who receives a shared `?run=highlights` link will see the same generic preview as someone visiting the root. Consider generating dynamic OG images (via Vercel OG or a static pre-render) based on the `run` parameter.

### 5.5 No loading state for Pyodide

The Python playground silently queues execution while Pyodide loads (~5MB WASM). The first time a user runs Python, there is no progress indicator — it just shows nothing for 3–8 seconds depending on connection speed. This looks like a crash.

**Fix:** Show a "Loading Python runtime… (first run only)" message while the worker is initializing.

### 5.6 Keyboard shortcut overlay is not triggered on mobile

The keyboard shortcuts overlay is triggered by `Ctrl + /`. On mobile, this shortcut is not available and there is no alternative entry point (no button in the title bar, no `?` command in the help output). Mobile users have no way to discover the shortcuts panel.

**Fix:** Add a `?` button in the title bar (desktop and mobile) that opens the overlay. Alternatively, make it discoverable via a `shortcuts` command.

### 5.7 The `weather` command exposes API key handling risk

Depending on implementation (not fully visible in the truncated sections), the weather command either uses a free API without a key (unreliable) or hardcodes a key in the bundle (insecure). If it is an unauthenticated free tier, it will fail for visitors at high traffic. For an award submission with spike traffic, this command should either be removed or backed by a proxied serverless function.

---

## 6. 3D Banner — Concept & Specification

Replace the ASCII art banner with a Three.js / React Three Fiber scene. The concept below is designed to be fast (< 100KB extra JS), visually striking, and on-brand for a terminal portfolio.

### Concept: "Particle Name Assembly" — The Hacker Materialization

The visitor sees a dark void. Glowing cyan particles drift randomly across the canvas — like terminal characters floating in space. Over 1.5 seconds, the particles converge and self-organize, morphing into the text **AHMAD IBRAHIM** in 3D. The text then hovers with a slow breathing glow, slightly rotating on the Y-axis.

When the visitor moves their cursor, the particles nearest the cursor repel softly — like a magnetic field — then drift back into formation.

This concept is:

- **On-brand:** Terminal aesthetic with particles that look like characters.
- **Original:** Not used in any mainstream portfolio template.
- **Performant:** Particle systems at ~2000 particles run at 60fps on any modern GPU.
- **Accessible:** Falls back to the ASCII banner if `prefers-reduced-motion` is set or WebGL is unavailable.

### Technical Specification

**Stack:** `@react-three/fiber` + `@react-three/drei` + `three`

**File:** `src/components/Banner/Banner3D.tsx`

```tsx
// Pseudo-spec — not complete implementation
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// 1. Sample target positions from a rendered text geometry
//    Use drei's <Text> to get glyph geometry, then sample N points
//    from its surface using THREE.Box3 + raycasting

// 2. Initialize particles at random screen positions (the "drift" state)
//    Each particle is a point in a BufferGeometry

// 3. On mount, animate each particle toward its target position
//    using lerp with staggered delays (index * 0.002s)
//    easing: easeOutExpo

// 4. Mouse interaction:
//    On mousemove, compute distance from cursor to each particle
//    Apply a repulsion vector: force = direction * (1 / distance^2) * strength
//    Blend with lerp back to target on each frame

// 5. The scene:
<Canvas
  camera={{ position: [0, 0, 5], fov: 50 }}
  style={{ position: 'absolute', inset: 0 }}
  gl={{ antialias: true, alpha: true }}
>
  <ParticleField targetText="AHMAD IBRAHIM" color="#58a6ff" />
</Canvas>;
```

**Performance constraints:**

- Max 3000 particles
- Use `InstancedMesh` or `BufferGeometry` — never individual `<mesh>` per particle
- Dispose geometry and material on unmount
- Wrap in `Suspense` with the ASCII banner as fallback
- Skip rendering (`frameloop="demand"`) when the banner is scrolled out of view (use IntersectionObserver)

**Fallback hierarchy:**

1. WebGL supported + `prefers-reduced-motion: no-preference` → 3D particle scene
2. WebGL supported + `prefers-reduced-motion: reduce` → static 3D text, no animation
3. WebGL not supported → current ASCII banner

**Integration in `TerminalOutput.tsx`:**

```tsx
const Banner = lazy(() =>
  import('./Banner3D').catch(() => ({ default: AsciiBanner }))
)

// In render:
<Suspense fallback={<AsciiBanner />}>
  <Banner />
</Suspense>
```

**Estimated implementation time:** 2–3 days for a polished result.

**Alternative concept (simpler, equally impressive): "CRT Terminal Monitor"**

Render a 3D CRT monitor model (low-poly, ~5KB geometry) floating in space. The monitor screen shows the ASCII banner with a CRT shader (scanlines, phosphor glow, slight barrel distortion). The monitor rotates slowly. On hover it tilts toward the camera. This is achievable with drei's `useGLTF` + a custom `ShaderMaterial`.

---

## 7. SEO, Meta & Performance

### 7.1 Missing `index.html` meta tags (complete list)

```html
<!-- Required -->
<meta
  name="description"
  content="Terminal portfolio of Ahmad Ibrahim, Full Stack Engineer based in Lyon, France. Interactive CLI with projects, skills, and experience."
/>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="canonical" href="https://yourdomain.com" />

<!-- Open Graph -->
<meta property="og:title" content="Ahmad Ibrahim — Full Stack Engineer · Terminal Portfolio" />
<meta
  property="og:description"
  content="An interactive terminal experience. Type 'help' to explore projects, skills, and experience."
/>
<meta property="og:image" content="https://yourdomain.com/og-preview.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://yourdomain.com" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="en_US" />

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Ahmad Ibrahim — Terminal Portfolio" />
<meta
  name="twitter:description"
  content="Interactive CLI portfolio. Projects, skills, experience."
/>
<meta name="twitter:image" content="https://yourdomain.com/og-preview.png" />

<!-- Preconnect for performance -->
<link
  rel="preload"
  href="/fonts/JetBrainsMonoBanner-Regular.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

<!-- Structured data -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Ahmad Ibrahim",
    "jobTitle": "Full Stack Software Engineer",
    "address": { "@type": "PostalAddress", "addressLocality": "Lyon", "addressCountry": "FR" },
    "url": "https://yourdomain.com",
    "sameAs": ["https://linkedin.com/in/ahmad-ibrahim1", "https://github.com/dr-developer1"]
  }
</script>
```

### 7.2 Vite bundle splitting

Monaco Editor and Pyodide are heavy. Verify `vite.config.ts` uses manual chunks:

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'monaco': ['@monaco-editor/react', 'monaco-editor'],
        'vendor': ['react', 'react-dom'],
      }
    }
  }
}
```

If Monaco is not split, it will block the initial parse. The playground is only opened on command — it should be fully lazy-loaded.

### 7.3 Background music autoplay

`background.mp3` has `audio.preload = 'auto'` which causes the browser to start downloading the MP3 immediately on page load, even if the user never enables music. On a slow connection this competes with font loading. Change to `preload = 'none'` and only load on user interaction.

---

## 8. Accessibility

| Issue                                                                                                                                                                                            | Location                       | WCAG Criterion | Fix                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | -------------- | ----------------------------------------------------------------------------------------------- |
| Missing `lang="en"` on `<html>`                                                                                                                                                                  | `index.html`                   | 3.1.1 (A)      | Add `lang="en"`                                                                                 |
| `<input>` in `TerminalInputDesktop` has no `aria-label`                                                                                                                                          | `TerminalInputDesktop.tsx`     | 4.1.2 (A)      | `aria-label="Terminal command input"`                                                           |
| Window control buttons (`close`, `minimize`, `maximize`) have `aria-label` but are `tabIndex={-1}` with no visible focus ring                                                                    | `Terminal.tsx`                 | 2.4.7 (AA)     | These are decorative — add `aria-hidden="true"` and `role="presentation"` to skip them entirely |
| `fade-in-up` animation not guarded by `prefers-reduced-motion`                                                                                                                                   | `TerminalOutput.module.css`    | 2.3.3 (AAA)    | Wrap in media query                                                                             |
| Keyboard shortcuts overlay is modal but `Escape` only closes via the overlay's internal button; pressing Escape while focus is outside the panel does close it (good) but there is no focus trap | `KeyboardShortcutsOverlay.tsx` | 2.1.2 (A)      | Add `focus-trap-react` or a native `<dialog>` element                                           |
| `BootMessages` uses `key={index}`                                                                                                                                                                | `BootMessages.tsx`             | —              | Assign stable IDs to `BootMessage` objects                                                      |
| PlaygroundMobile has clickable `<div>` elements for file selection                                                                                                                               | `PlaygroundMobile.tsx`         | 4.1.2 (A)      | Replace with `<button>` elements                                                                |

---

## 9. Testing Gaps

### 9.1 `vitest.config.ts` uses `environment: 'node'` — this will fail for any hook using browser APIs

```ts
export default defineConfig({
  test: {
    environment: 'node', // ← wrong
    include: ['src/**/*.test.ts'],
  },
});
```

The hook tests (`useKeyboardViewport.test.ts`, `useSecretCode.test.ts`, `commandParser.test.ts`) use `window`, `document`, and `localStorage`. With `environment: 'node'`, any test that touches these APIs will either throw or silently use `undefined`. The tests pass only because they are testing utilities that happen to not require a DOM — but the coverage is misleading.

**Fix:** Change to `environment: 'jsdom'`. Install `@vitest/browser` or `jsdom` as a dev dependency.

### 9.2 No tests for the command execution pipeline

The most complex and most bug-prone code path — command parsing → registry lookup → execute → output — has zero tests. The `commandParser.test.ts` and `commandRegistry.test.ts` files exist but test only the parsing and registry lookup utilities, not the full pipeline including context injection and achievement unlocking.

**Minimum test cases to add:**

- `sudo` with and without `unlock` arg — verify admin state transitions
- `vault` before and after `discoveredCommands.length >= 6`
- `share` with and without argument — verify URL format
- `mode recruiter` — verify `visitorMode` updates in context

### 9.3 Playwright config has no E2E tests in `tests/e2e/`

The `playwright.config.ts` exists and targets `./tests/e2e/`. There are no test files in that directory (excluded from repomix by ignore rules, but the directory structure shows no test files were committed). E2E smoke tests for the terminal would catch the broken `history`/`ls` commands immediately.

**Minimum E2E tests to add:**

```ts
test('help command renders command list', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="terminal-input-native"]');
  await page.keyboard.type('help');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Available commands')).toBeVisible();
});

test('ls command produces output', async ({ page }) => {
  // this test currently fails — proves the broken execute
});
```

---

## 10. Complete Action Plan

Organized by priority. **P0 must be done before any submission.**

### P0 — Fix before submission (blockers)

| #   | Task                                                            | File(s)                       | Effort |
| --- | --------------------------------------------------------------- | ----------------------------- | ------ |
| 1   | Implement `history`, `ls`, `cd`, `pwd`, `cat`, `tree` commands  | `commands.tsx`                | 1 day  |
| 2   | Fix `sudo` — move `unlockAdmin()` inside `unlock`/`su` branch   | `commands.tsx`                | 30 min |
| 3   | Add `lang="en"` to `<html>`                                     | `index.html`                  | 5 min  |
| 4   | Add all `og:` and `twitter:` meta tags                          | `index.html`                  | 30 min |
| 5   | Add `aria-label` to desktop terminal input                      | `TerminalInputDesktop.tsx`    | 5 min  |
| 6   | Preload banner font in HTML                                     | `index.html`                  | 5 min  |
| 7   | Guard `fade-in-up` with `prefers-reduced-motion`                | `TerminalOutput.module.css`   | 10 min |
| 8   | Replace `background: #000` with CSS variable                    | `PlaygroundMobile.module.css` | 5 min  |
| 9   | Fix `!important` in `.activeTab` — use proper selector          | `PlaygroundMobile.module.css` | 15 min |
| 10  | Change `preload="none"` for background audio                    | `BackgroundMusic.tsx`         | 5 min  |
| 11  | Move `getVisitorProgress()` out of render into `useMemo`        | `TerminalOutput.tsx`          | 20 min |
| 12  | Implement personalized output per `visitorMode` for all 4 modes | Multiple commands             | 2 days |

### P1 — High impact, do before submission if time allows

| #   | Task                                                            | File(s)                                                 | Effort   |
| --- | --------------------------------------------------------------- | ------------------------------------------------------- | -------- |
| 13  | **Implement the 3D banner** (React Three Fiber particle system) | New `Banner3D.tsx`                                      | 2–3 days |
| 14  | Split `commands.tsx` into per-command modules                   | Entire `src/commands/`                                  | 1 day    |
| 15  | Add Pyodide loading indicator in playground                     | `PlaygroundMobile.tsx`, `Playground.tsx`                | 2 hours  |
| 16  | Fix achievement system to use context instead of CustomEvent    | `progressService.ts`, `Terminal.tsx`, `useTerminal.tsx` | 3 hours  |
| 17  | Make `CommandContext` non-optional; make callbacks required     | `src/types/index.ts`                                    | 1 hour   |
| 18  | Add `<link rel="preload">` for banner font                      | `index.html`                                            | 5 min    |
| 19  | Replace clickable divs with buttons in PlaygroundMobile         | `PlaygroundMobile.tsx`                                  | 30 min   |
| 20  | Add keyboard shortcut discovery on mobile                       | `Terminal.tsx`, `KeyboardShortcutsOverlay.tsx`          | 1 hour   |

### P2 — Quality improvements, post-submission

| #   | Task                                                                                 | File(s)                        | Effort  |
| --- | ------------------------------------------------------------------------------------ | ------------------------------ | ------- |
| 21  | Change vitest environment to `jsdom`                                                 | `vitest.config.ts`             | 15 min  |
| 22  | Write E2E tests for command pipeline                                                 | `tests/e2e/`                   | 1 day   |
| 23  | Write unit tests for `sudo`/`vault` state transitions                                | New test files                 | 4 hours |
| 24  | Remove empty `.container {}` CSS rules                                               | Multiple `.module.css` files   | 10 min  |
| 25  | Replace inline styles in `PlaygroundMobile` with CSS modules                         | `PlaygroundMobile.tsx`         | 30 min  |
| 26  | Rename `ping` to `http-ping` or fix the description                                  | `commands.tsx`                 | 10 min  |
| 27  | Add structured data JSON-LD                                                          | `index.html`                   | 30 min  |
| 28  | Implement focus trap in keyboard shortcuts overlay                                   | `KeyboardShortcutsOverlay.tsx` | 1 hour  |
| 29  | Fix BootMessages `key={index}` → stable ID                                           | `BootMessages.tsx`             | 15 min  |
| 30  | Refactor `outputUtilities.module.css` — decision point: Tailwind or component styles | Global                         | 2 days  |

### Summary Timeline (aggressive but achievable)

```
Week 1, Days 1–2:  P0 items 1–12 (blockers + quick wins)
Week 1, Days 3–5:  3D banner implementation
Week 2, Days 1–2:  P1 items 14–20 (architecture + UX)
Week 2, Days 3–4:  Testing (vitest env fix, E2E skeleton)
Week 2, Day 5:     Final polish, OG preview screenshot update, submit
```

---

## Final Note — As a Client

The concept is genuinely clever. A terminal portfolio with a virtual filesystem, a playground, gamified achievement unlocking, and persona-based navigation is exactly the kind of project that wins awards — if it executes flawlessly. The problem is that right now `history`, `ls`, `cd`, `pwd`, `cat`, and `tree` are broken, the security theater collapses with one `sudo`, and the banner is an ASCII art block rendered at 5px on mobile. These are the first things a judge will try.

Fix the broken commands first. Then build the 3D banner. The rest can follow.
