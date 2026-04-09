# Design Brief: AI Image Studio

**Purpose:** Craft detailed prompts for AI image generation with configurable style, subject, and camera controls. Dark, premium, focused tool interface.

**Tone:** Refined minimalism. Cinematic dark mode with rose-gold + teal accents. Sophisticated creative tool, not playful.

**Differentiation:** Glass effect panels, animated gradient text, rose-gold primary accent with teal highlights, custom scrollbar styling.

## Color Palette

| Token | OKLCH | Role |
|-------|-------|------|
| background | `0.11 0.008 260` | Deep slate, cinematic |
| primary | `0.7 0.15 20` | Rose-gold, warm accent |
| accent | `0.65 0.12 195` | Teal, interactive highlight |
| card | `0.15 0.01 260` | Elevated surface |
| muted | `0.18 0.01 260` | Secondary text, disabled |
| destructive | `0.52 0.22 25` | Error/warning state |

## Typography

| Layer | Font | Scale | Weight |
|-------|------|-------|--------|
| Display | Bricolage Grotesque | 3xl/5xl | 700–900 |
| Body | General Sans | base/lg | 400–600 |
| Code | JetBrains Mono | sm/base | 400–500 |

## Structural Zones

| Zone | Treatment | Token |
|------|-----------|-------|
| Header | Border-bottom, sticky, glass effect | `card` with `border-b` |
| Sidebar form | Scrollable, glass cards, fixed width | `background` with `card` sections |
| Main content | Image display, right-aligned | `background` |
| Footer | Border-top, centered text | `muted-foreground` |

## Elevation & Depth

- **Glass effect**: `backdrop-filter: blur(12px)` on cards, `bg-card/85` opacity
- **Scrollbar**: Custom thin, teal tint on hover
- **Shadows**: `shadow-glow` (rose-gold), `shadow-glow-teal` (accent), `shadow-card` (base)
- **Noise texture**: Ambient SVG fractal noise, 4% opacity on background

## Component Patterns

- **Buttons**: Rose-gold primary, teal accent, destructive red. Hover state via opacity + shadow.
- **Dropdowns**: Radix UI Select, positioned absolute with z-index override to prevent clipping.
- **Form controls**: General Sans body, 1rem spacing, bordered input fields with `bg-input` token.
- **Cards**: Glass effect with `card-glass` utility, rounded via `--radius` CSS var.

## Motion & Animation

- **Fade-in**: `0.4s ease-out` on page load (hero, sections)
- **Slide-up**: `0.35s cubic-bezier(0.16, 1, 0.3, 1)` on content reveal
- **Scale-in**: `0.25s cubic-bezier(0.16, 1, 0.3, 1)` on interactive elements
- **Gradient text**: Applied to h1 headings, rose-gold to teal blend, 135° angle

## Constraints

- Max content width: `7xl` container
- Sidebar sticky top: `4.5rem` (account for header height)
- No full-page gradients; depth via layering and shadows
- Radix portal dropdowns always visible (z-index 99999)
- Images: 512×512 JPEG max, displayed in dedicated panel

## Signature Detail

Animated gradient text heading (rose-gold → teal) with pulsing accent dot next to label. Combines color palette, typography hierarchy, and motion into single memorable element.
