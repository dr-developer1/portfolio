---
name: Portfolio OS
version: 1
register: brand
colors:
  canvas: '#010409'
  surface: '#0d1117'
  panel: '#161b22'
  text: '#e6edf3'
  secondary: '#8b949e'
  primary: '#58a6ff'
typography:
  display:
    fontFamily: 'JetBrains Mono, Fira Code, SF Mono, Cascadia Code, Consolas, monospace'
  utility:
    fontFamily: 'JetBrains Mono, Fira Code, SF Mono, Cascadia Code, Consolas, monospace'
rounded:
  control: 8px
  panel: 12px
omitted:
  - section: spacing
    reason: Existing CSS spacing variables remain canonical.
  - section: components
    reason: Component styles consume the existing CSS tokens directly.
---

# Portfolio OS

An interactive terminal portfolio. The audience is recruiters,
engineers, founders, and potential collaborators; the job is to make Ahmad’s work
understandable and make contact and the appropriate CV easy to reach.

## Visual direction

Preserve the original terminal design: the PORTFOLIO OS boot prompt, secret-code
input, oscilloscope name trace, CRT scanlines, theme palette, and monospace type.
The user explicitly rejected the replacement landing page, sans-serif display
headings, marketing copy, and route-card redesign. Do not replace these identity
elements when enhancing navigation or localization.

The initial terminal view has one quiet hint: “Try about, experience, projects, or
help.” Command names are keyboard-accessible inline buttons styled as terminal
text. The hint disappears after the first nonempty command, including clear, and
stays hidden for the session. Do not show quick-start panels, role selection,
returning-visitor nudges, or tour progress on the landing view. Explicit mode/tour
commands remain available through help. Help uses a plain definition list of
clickable command names and descriptions, without shortcut cards or button panels. Keep language and matching CV controls
small and visually consistent with the terminal.

## Canonical tokens and mapping

Ownership model B: `src/styles/variables.css` owns runtime values; `themes.css`
provides theme overrides. This document records accepted values and intent.

| Role                     | Runtime owner                                                       | Consumers                        |
| ------------------------ | ------------------------------------------------------------------- | -------------------------------- |
| Canvas / surface / panel | `--color-bg-canvas` / `--color-bg-primary` / `--color-bg-secondary` | Boot, terminal, launcher         |
| Primary / secondary text | `--color-text-primary` / `--color-text-secondary`                   | All portfolio copy               |
| Accent                   | `--color-accent-cyan`                                               | Language state, focus, CV, route |
| Display / utility type   | `--font-mono` / `--font-mono`                                       | Headings / terminal and controls |
| Controls / panels        | `--radius-md` / `--radius-lg`                                       | Language tools and path launcher |

Existing theme overrides remain supported. Feature styles use semantic variables,
so changing theme does not create a second
palette. No prior design document existed; this records the established identity
and the restored original onboarding.

## Content and locale

French and English are supported because both CVs are supplied. Locale precedence:
valid `?lang=`, stored preference, French browser language, then English. Switching
language preserves the terminal session and re-renders career sections already in
history. The document language, page metadata, share URL, CV toolbar, `resume` and
`open resume` follow the active locale. Filenames and executable command names stay
stable. Advanced shell tools, the code playground, boot logs, and hidden Easter eggs
retain their English technical vocabulary; help discloses this boundary.

CVs are authoritative for the profile, experience, education, primary stack, and
spoken languages. Existing personal/academic projects are retained and labeled as
such; they are not presented as new CV claims. Do not infer job availability or
publish the CV’s phone number as a separate contact channel without a request.

## Behavior and accessibility

Language and CV belong together in an always-reachable toolbar, both before and
after boot. A real download link has a visible PDF/language label. Initial command hints
run directly, without choosing a role. A language
command supports keyboard-led visits. No extra package is needed for two static
locales: a small React external store and typed content selector are sufficient;
reconsider a routing/i18n library if translated routes or pluralization emerge.

The terminal owns scrolling; controls stay outside it. Inline command hints wrap naturally on narrow screens. French copy wraps naturally. Preserve
44px action targets, visible focus, operable scrollbars, and reduced-motion support.
Boot retains its original keyboard and mobile tap-to-start interactions. Audio should require an
explicit opt-in rather than starting on portfolio entry.

Terminal typing and command shortcuts share `useTerminalInput`; desktop and mobile
retain their own focus and viewport policies. `TerminalInputDisplay` mirrors native
caret offsets and text selection, preserves spaces, and respects reduced motion.
Input-method composition must finish before command submission or completion.

The playground language selector remains a native select: it has a short, fixed
list and benefits from platform keyboard and touch pickers. `premium-ui.json`
records that ownership; no custom listbox is needed.
