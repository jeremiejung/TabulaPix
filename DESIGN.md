---
name: tabulapix.com
description: Website of the TabulaPix extension. It speaks the extension's own visual language (its popup, coloured folders and red action). Scope: docs/ (the extension's interface is documented by its code in extension/).
colors:
  ground: "#f4f4f2"
  card: "#ffffff"
  ink: "#141517"
  ink-2: "#44474d"
  muted: "#62666d"
  line: "#dcdcd8"
  line-strong: "#b9bab5"
  red: "#d7141a"
  red-ink: "#b80f15"
  red-hover: "#b51016"
  tabbar: "#e3e4e1"
  tab: "#eeefec"
  folder-blue: "#2f6fd0"
  folder-green: "#2f8a4c"
  folder-amber: "#b98900"
  folder-pink: "#c43f86"
  folder-violet: "#7b52c7"
  dark-ground: "#121315"
  dark-card: "#1c1d20"
  dark-ink: "#eeeff1"
  dark-ink-2: "#c5c8cd"
  dark-muted: "#9da1a8"
  dark-line: "#2e3034"
  dark-line-strong: "#484b51"
  dark-red-ink: "#ff5a5f"
  dark-tabbar: "#0b0c0d"
  dark-tab: "#232428"
typography:
  display:
    fontFamily: Archivo
    fontWeight: 720
    fontSize: clamp(2.5rem, 5.4vw, 4.4rem)
    lineHeight: 1.03
    letterSpacing: -0.022em
  headline:
    fontFamily: Archivo
    fontWeight: 720
    fontSize: clamp(1.75rem, 3.2vw, 2.6rem)
    lineHeight: 1.1
    letterSpacing: -0.022em
  lede:
    fontFamily: Archivo
    fontWeight: 400
    fontSize: clamp(1.15rem, 1.7vw, 1.32rem)
    lineHeight: 1.5
  body:
    fontFamily: Archivo
    fontWeight: 400
    fontSize: 1.0625rem
    lineHeight: 1.6
  folder-label:
    fontFamily: Archivo
    fontWeight: 750
    fontSize: 0.74rem
    letterSpacing: 0.06em
  code:
    fontFamily: ui-monospace
    fontWeight: 500
    fontSize: 0.88rem
rounded:
  control: 8px
  button: 9px
  folder: 9px
  strip: 12px
  card: 14px
  pill: 999px
spacing:
  gutter: clamp(16px, 4vw, 48px)
  page: 1120px
  section: clamp(64px, 9vw, 112px)
components:
  button-install:
    backgroundColor: "{colors.red}"
    textColor: "#ffffff"
    rounded: "{rounded.button}"
    height: 52px
    padding: 0 24px 0 20px
  button-install-hover:
    backgroundColor: "{colors.red-hover}"
  popup:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
    padding: 16px
  folder-row:
    rounded: "{rounded.folder}"
    typography: "{typography.folder-label}"
    height: 30px
  tab:
    backgroundColor: "{colors.tab}"
    textColor: "{colors.ink-2}"
    height: 38px
  tab-current:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
---

# Design System: tabulapix.com

## Overview

The page shows the extension itself. Its first viewport is the product's own interface: a TabulaPix popup (keywords, red "Lancer la recherche · 7 onglets" button, coloured folder rows) and, under it, a browser tab bar where one tab per agency opens after "Page en cours". The visual language is the extension's and its Chrome Web Store images: light neutral ground, sentence-case headings, a short red rule under the main title, white cards with soft shadows, red reserved for the action. No décor that does not belong to the tool (no clock, references, places or wire codes). Light by default with a dark theme; no request beyond the page's own files.

## Colors

### Primary
- **red** `#d7141a`: the extension's icon and Search-button red. Fills the install button, the popup's search button and the title rule.
- **red-ink** `#b80f15` (dark `#ff5a5f`): red as text or line — step numerals, check icons.

### Secondary
- **Folder colours**, copied from the extension: blue `#2f6fd0` (News), green `#2f8a4c` (Documentary), amber `#b98900` (Aggregators), pink `#c43f86` (Celebrity), violet `#7b52c7` (Stock), gray `#7b8089` (Archives, shown unticked). Folder rows are tinted at 18% on the card; the same colour marks the matching tab's dot.

### Neutral
- **ground** `#f4f4f2`, **card** `#ffffff`, **ink** `#141517`, **ink-2** `#44474d`, **muted** `#62666d` (5.2:1), **line** `#dcdcd8`, **line-strong** `#b9bab5`; **tabbar** / **tab** for the browser strip. Dark equivalents in the frontmatter.

### Named Rules
- **Red means action.** Buttons and the title rule; never a background field.
- **Colour means folder.** The five folder hues appear only where a folder or its tab is shown.

## Typography

One self-hosted OFL variable face, **Archivo** (`docs/assets/fonts/`), for everything; the platform monospace only for the example share code.

### Hierarchy
- **Display** (h1): 720, `clamp(2.5rem, 5.4vw, 4.4rem)`, line-height 1.03, sentence case.
- **Headline** (h2): 720, `clamp(1.75rem, 3.2vw, 2.6rem)`.
- **Lede**: 400, `clamp(1.15rem, 1.7vw, 1.32rem)`.
- **Body**: 400, 1.0625rem / 1.6, measure ≤62ch.
- **Folder label**: 750, 0.74rem, uppercase, tracked 0.06em — as in the popup.
- **Step numerals**: 800, 2.6rem, red-ink.

## Layout

- Page width 1120px, gutter `clamp(16px, 4vw, 48px)`, sections spaced `clamp(64px, 9vw, 112px)`.
- Hero: copy column + popup column (stacked below 860px); the browser strip spans the full width under the hero, inside the first viewport on desktop.
- Steps in three columns (one column below 860px), numbered because the order is the instruction; no card containers.
- "Rangées" section: real popup screenshot (same ticked agencies as the demo: 7 tabs, News open, other folders collapsed) + text aligned to its top.

## Elevation & Depth

Soft elevation only, never combined with a hairline border: `0 1px 2px` + `0 18px 40px -22px` for the popup, the browser strip and the screenshot; a lighter `0 8px 18px -10px` neutral shadow under the install button.

## Components

- **Header**: icon + "TabulaPix" (as in the popup), language link on the right.
- **Install button**: red, 52px, download glyph (authored SVG), "Ajouter à Chrome" + "gratuit".
- **Demo popup**: icon + name, keywords input, red search button with tab count, six tinted folder rows with the real counts and the extension's partly-ticked box (Archives unticked), all matching the screenshot; under it a caption saying it is the extension's window, to try. The demo button never disables: a new search restarts the opening and keeps focus (`aria-busy` while tabs open); an empty field puts the example back in the field.
- **Browser strip**: "Page en cours" / "Current page" tab (current, white) then one tab per agency: folder dot + the keywords as the title (the folder name is screen-reader text); one row on phones, the last tabs fading out of the frame; a line under it with the count and "Démonstration : rien n'est envoyé".
- **Checks list**, **example share code** (dashed card), **closing call to action**, **footer** with version, links and signature.

## Do's and Don'ts

- Do say near the install button that it is for Chrome on a computer and which permission Chrome shows at install.
- Do keep every claim factual (PRODUCT.md): no testimonials, user counts or newsroom names; agency names stay out of the text.
- Do label demonstrations: the strip says nothing is sent; the share code says it is an example.
- Do keep working notes out of the published HTML: no design-direction or tool comments in `docs/` (anyone can read the page source); design intent lives in this file.
- Do keep the page dependency-free: no external fonts, scripts, analytics or cookies.
- Don't add décor that the extension doesn't have (clocks, datelines, codes, terminal bars).
- Don't put a label above a heading.
- Motion: one authored moment — the tabs open one after another (clip-path + rise, 0.5s ease-out, 150ms apart) when the strip comes into view and on every new search; off under `prefers-reduced-motion`.
