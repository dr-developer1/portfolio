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

# Portfolio OS design

The portfolio serves recruiters, engineers, founders, and potential collaborators.
Its terminal interface makes Ahmad’s work, contact information, and CV accessible
through commands and direct controls.

## Identity and tokens

The boot prompt, secret-code input, oscilloscope name trace, CRT effects, theme
palettes, and monospace typography define the interface. Navigation and career
content share that visual language.

`src/styles/variables.css` owns runtime spacing, typography, radius, and color
tokens. `src/styles/themes.css` supplies theme overrides. Components consume
semantic variables rather than maintaining separate palettes.

| Role                       | Runtime tokens                                                    |
| -------------------------- | ----------------------------------------------------------------- |
| Canvas and surfaces        | `--color-bg-canvas`, `--color-bg-primary`, `--color-bg-secondary` |
| Primary and secondary text | `--color-text-primary`, `--color-text-secondary`                  |
| Accent and focus           | `--color-accent-cyan`                                             |
| Typography                 | `--font-mono`                                                     |
| Controls and panels        | `--radius-md`, `--radius-lg`                                      |

## Layout

Window dots occupy the left of the title bar, the terminal title uses the middle,
and Help/Music remain on the right. The title truncates within its available
space. Language and matching CV download occupy a separate toolbar below.
Controls stay outside the terminal’s scrolling content.

On phones and tablets, symmetric small margins preserve the usable terminal
width. Language/CV controls share a row when they fit; narrow screens use a
centered language row and a full-width CV row. Command hints and translated text
wrap naturally. Keyboard visibility and safe-area insets keep the focused prompt
reachable without covering controls.

The first terminal view offers one line of clickable command hints. It disappears
after the first nonempty command, including `clear`, for the rest of the session.
Guided perspectives and tours are available through explicit commands. Help uses
a definition list of clickable command names and descriptions.

## Content and localization

French and English follow the supplied CVs for profile, work history, education,
primary stack, and spoken languages. Personal and academic projects are labeled
separately. Contact channels use the published portfolio content.

The active locale controls career output, document language/metadata, shared
URLs, and CV downloads. Existing career output translates without clearing
terminal history. Executable command names and virtual paths remain stable;
technical shell output, boot logs, playground tools, and Easter eggs retain
English vocabulary. Locale precedence and content locations are documented in
[README.md](README.md).

## Interaction and accessibility

Mobile actions have at least 44px targets and visible keyboard focus. Scrollbars
remain usable, and reduced-motion preferences apply to animation. Music requires
explicit opt-in. The CV link identifies both PDF format and language.

Boot supports keyboard input and tap-to-start. Initial prompt focus must not take
focus from a control the visitor has selected. Command hints, Help command links,
and guided shortcuts return focus to terminal input before execution.

Desktop and mobile share `useTerminalInput`, with separate focus/viewport policies.
The visual input mirrors native caret and selection offsets and preserves spaces.
Composition finishes before command submission or completion. History scrolling
must cooperate with mobile keyboard visibility.

The playground language selector uses the native select for its short fixed list
and platform keyboard/touch behavior. `premium-ui.json` records that choice.

## Seasonal appearance

The visitor’s local calendar activates the Christmas appearance from November 15
through January 15. Theme commands and secret boot modes preserve the saved
appearance for restoration after the event. Theme tokens supply evergreen
surfaces, cream text, gold links, and holly accents.

The Santa hat anchors to the terminal’s upper-right corner. Its overlay has space
above the frame and clearance from title-bar actions, without a mobile side
gutter. Desktop retains its side gutter; landscape phones reduce top spacing.
The interactive pom-pom has a 44px target and visible focus ring. Its collar stays
fixed while fabric bends and settles; pointer, touch, and keyboard interaction
remain available. Reduced motion returns it directly to rest. An illustration
covers unavailable model/WebGL states, including context loss.

Snow replaces Matrix rain, pauses when hidden, and becomes stationary under
reduced motion. Bottom drifts cannot cover the prompt. The regular theme, Matrix
preference, and soundtrack return after the event. Model maintenance and export
details live in [docs/models/README.md](docs/models/README.md).
