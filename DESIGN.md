---
name: tabulapix.com
description: Website of the TabulaPix extension, built as a picture-desk wire screen. Scope: docs/ (the extension's own interface is documented by its code in extension/).
colors:
  ground: "#f4f5f6"
  sheet: "#ffffff"
  ink: "#101215"
  ink-2: "#3a3f47"
  meta: "#59606b"
  rule: "#c8ccd2"
  red: "#d7141a"
  red-ink: "#b80f15"
  red-hover: "#b51016"
  term: "#101215"
  term-ink: "#e9ebee"
  term-meta: "#9aa1ab"
  dark-ground: "#0d0f12"
  dark-sheet: "#15181c"
  dark-ink: "#eceef1"
  dark-meta: "#9199a4"
  dark-rule: "#2c3138"
  dark-red-ink: "#ff5a5f"
typography:
  slug:
    fontFamily: Archivo
    fontWeight: 800
    fontSize: clamp(2rem, 4.4vw, 3.4rem)
    lineHeight: 0.95
    letterSpacing: -0.005em
  slug-lead:
    fontFamily: Archivo
    fontWeight: 800
    fontSize: clamp(2.6rem, 5.4vw, 5.1rem)
    lineHeight: 0.9
    letterSpacing: -0.01em
  body:
    fontFamily: Archivo
    fontWeight: 400
    fontSize: 1.0625rem
    lineHeight: 1.6
  lede:
    fontFamily: Archivo
    fontWeight: 400
    fontSize: clamp(1.12rem, 1.6vw, 1.3rem)
    lineHeight: 1.55
  wire:
    fontFamily: Martian Mono
    fontWeight: 400
    fontSize: 0.74rem
    lineHeight: 1.6
rounded:
  tag: 2px
  control: 4px
  button: 6px
  panel: 6px
  photo: 10px
spacing:
  gutter: clamp(16px, 4vw, 48px)
  meta-column: 11.5rem
  dispatch-top: clamp(40px, 7vw, 88px)
  dispatch-bottom: clamp(36px, 5vw, 64px)
components:
  button-install:
    backgroundColor: "{colors.red}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.button}"
    height: 52px
    padding: 0 22px 0 18px
  button-install-hover:
    backgroundColor: "{colors.red-hover}"
  tag-priority:
    textColor: "{colors.ink}"
    rounded: "{rounded.tag}"
    padding: 3px 7px 2px
  tag-flash:
    backgroundColor: "{colors.red}"
    textColor: "#ffffff"
    rounded: "{rounded.tag}"
  terminal:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.panel}"
  wirebar:
    backgroundColor: "{colors.term}"
    textColor: "{colors.term-ink}"
---

# Design System: tabulapix.com

## Overview

The page is a news-agency wire screen. Each section is a dispatch: a priority tag, a reference and a dateline in the left margin, an uppercase condensed slug as the title, then wire-style copy. The opening dispatch is a FLASH with a working demonstration terminal: the visitor's keywords go out once and come back as one line per agency tab. Restrained palette on a cool newsroom-screen ground; TabulaPix red is reserved for priority, action and confirmation. Light by default (bright newsroom), with a night-shift dark theme. No network requests beyond the page's own files: fonts are self-hosted, no analytics, no cookies.

## Colors

### Primary
- **red** `#d7141a`: the extension's icon and Search-button red. Fills the install button and the FLASH tag only.
- **red-ink** `#b80f15` (dark: `#ff5a5f`): red as text — the slug's highlighted word, step numbers, READY marks, check icons.

### Neutral
- **ground** `#f4f5f6` (dark `#0d0f12`): cool newsroom-screen field; never cream.
- **sheet** `#ffffff` (dark `#15181c`): raised surfaces (terminal, photo frame, code sample).
- **ink** `#101215`, **ink-2** `#3a3f47`: headings and body.
- **meta** `#59606b`: wire metadata (≥5.8:1 on ground).
- **rule** `#c8ccd2`: hairlines between dispatches, steps and feed lines.
- **term** `#101215`: the black wire bar and terminal head, with term-ink / term-meta text.

### Named Rules
- **Red means priority or action.** Never decorative fills, never body text.
- **Hairlines, not boxes.** Dispatches are separated by 1px rules; only the terminal, the photo and the code sample sit on a sheet.

## Typography

Two self-hosted OFL variable faces (`docs/assets/fonts/`): **Archivo** (wdth 62–125, wght 100–900) for slugs and copy; **Martian Mono** (wdth 75–112.5) for wire data only — metadata, datelines, the terminal, the share-code sample, the footer.

### Hierarchy
- **Lead slug**: Archivo 800, `font-stretch: 72%`, uppercase, `clamp(2.6rem, 5.4vw, 5.1rem)`, line-height 0.9, max 12ch.
- **Slug**: same voice at `clamp(2rem, 4.4vw, 3.4rem)`, balanced.
- **Lede**: Archivo 400, `clamp(1.12rem, 1.6vw, 1.3rem)`, opened by a mono uppercase dateline ("PARIS (TABULAPIX) —").
- **Body**: Archivo 400, 1.0625rem / 1.6, measure ≤64ch.
- **Wire**: Martian Mono 400 at `font-stretch: 87.5%`, 0.68–0.82rem, tabular numerals.

### Named Rules
- **Mono is data.** Martian Mono only where the wire itself would print: references, times, labels, codes.

## Layout

- Dispatch grid: an 11.5rem metadata margin + content (`grid-template-areas: "meta slug" "meta body"`). The lead adds a third column for the terminal at title height; below 1080px the terminal drops under the copy; below 720px the metadata moves under the slug as one line.
- Page max width 1240px, gutter `clamp(16px, 4vw, 48px)`, dispatch padding `clamp(40px, 7vw, 88px)` top.
- Numbered steps use wire numbering (1/3, 2/3, 3/3) because the order is the instruction.

## Elevation & Depth

Flat by default. Two soft, offset shadows only: the terminal (`0 22px 44px -30px`) and the install button (`0 10px 24px -14px` red-tinted). The photo frame carries a long soft drop (`0 30px 60px -40px`).

## Components

- **Wire bar**: sticky black bar — icon, TABULAPIX, channel name, pulsing red live dot with local date and time, language switch (FR / EN).
- **Priority tag**: outlined mono tag (DÉPÊCHE / PHOTO); FLASH is the filled red variant.
- **Install button**: red, 52px tall, download glyph (authored SVG), "Ajouter à Chrome" + mono "gratuit".
- **Terminal**: black head, prompt form (MOTS-CLÉS › input + LANCER), feed of lines `time · n/7 · « keywords » · folder · PRÊT`, a total line, and a note saying nothing is sent.
- **Steps**, **checks** (authored check SVG), **share-code sample** (dashed sheet), **photo with wire caption** (PHOTO · …).

## Do's and Don'ts

- Do keep every claim factual (PRODUCT.md): no testimonials, user counts or newsroom names; agency names stay out of the text.
- Do label demonstrations: the terminal says it sends nothing; the share code says it is an example.
- Do keep the page dependency-free: no external fonts, scripts, analytics or cookies.
- Don't put a label above a slug: metadata lives in the margin (or under the slug on mobile).
- Don't use the red as a background beyond the install button and the FLASH tag.
- Motion: one authored moment — the teleprinter print of the feed lines (clip-path, 0.42s, ease-out), replayed on submit; off under `prefers-reduced-motion`. The live dot pulses; nothing else animates.
