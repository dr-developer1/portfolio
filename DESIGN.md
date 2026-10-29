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
    fontFamily: 'Trebuchet MS, Segoe UI, sans-serif'
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

A developer’s workspace with an approachable front door. The audience is recruiters,
engineers, founders, and potential collaborators; the job is to make Ahmad’s work
understandable and make contact and the appropriate CV easy to reach.

## Visual direction

Preserve the existing blue, graphite, and monospace terminal identity. The signature
is a branching launch panel: four perspectives connected by a quiet circuit-like
rail. Each route previews useful commands before selection; selected routes become
compact shortcut panels. Hover lifts and illuminates the route, and the same content
is available to touch and keyboard users. Avoid mandatory quizzes, animated text
scrambles, autoplay sound, and decoration that delays reading.

Display headings use the system-installed Trebuchet/Segoe UI stack for a human
counterpart to the terminal’s JetBrains Mono utility typography. No additional font
request is required. Restrict display type to names, headings, and route titles.

## Canonical tokens and mapping

Ownership model B: `src/styles/variables.css` owns runtime values; `themes.css`
provides theme overrides. This document records accepted values and intent.

| Role                     | Runtime owner                                                       | Consumers                         |
| ------------------------ | ------------------------------------------------------------------- | --------------------------------- |
| Canvas / surface / panel | `--color-bg-canvas` / `--color-bg-primary` / `--color-bg-secondary` | Boot, terminal, launcher          |
| Primary / secondary text | `--color-text-primary` / `--color-text-secondary`                   | All portfolio copy                |
| Accent                   | `--color-accent-cyan`                                               | Language state, focus, CV, route  |
| Route colors             | `--color-accent-cyan/purple/orange/green`                           | Recruiter/engineer/founder/client |
| Display / utility type   | `--font-display` / `--font-mono`                                    | Headings / terminal and controls  |
| Controls / panels        | `--radius-md` / `--radius-lg`                                       | Language tools and path launcher  |

Existing theme overrides remain supported. Feature styles use semantic variables,
including `color-mix` for route glows, so changing theme does not create a second
palette. No prior design document existed; this records the established identity
and the approved onboarding redesign.

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
after boot. A real download link has a visible PDF/language label. Path selection
is optional and reversible; clicks never require terminal knowledge. A language
command supports keyboard-led visits. No extra package is needed for two static
locales: a small React external store and typed content selector are sufficient;
reconsider a routing/i18n library if translated routes or pluralization emerge.

The terminal owns scrolling; controls stay outside it. Desktop uses four routes,
phones and narrow windows use two columns. French copy wraps naturally. Preserve
44px action targets, visible focus, operable scrollbars, and reduced-motion support.
Boot has a skip button and no forced mobile keyboard. Audio should require an
explicit opt-in rather than starting on portfolio entry.

The playground language selector remains a native select: it has a short, fixed
list and benefits from platform keyboard and touch pickers. `premium-ui.json`
records that ownership; no custom listbox is needed.
