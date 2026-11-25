# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- The extension: Chrome extension (Manifest V3) in plain HTML/JavaScript, no dependencies, no build step (`extension/`).
- The website tabulapix.com: plain static HTML/CSS, no framework, no build step, served by GitHub Pages from `site/`. French at `/`, English at `/en/`, each with a link to the other.

## Users

Photo desks, picture researchers (iconographes) and photo editors in newsrooms, mostly French-speaking. During the day they search the same keywords on many picture agencies (news, documentary, celebrity, stock, archives), each with their own subscription and login. They are not developers.

## Product Purpose

TabulaPix lets them type their keywords once and opens one tab per agency with the results ready, using their own logged-in accounts. Success: a search that used to mean retyping the same words on ten sites takes one Enter.

## Positioning

- Runs entirely in the user's Chrome: no server, no account, no network request from the extension, no data collected, no scraping, no API keys, no password stored.
- Agencies are added from the extension itself, with automatic detection of the search address, or by locating a site's search field; organised in coloured folders; shared with colleagues by a copy/paste code or a configuration file.
- Independent, free, open source (MIT).

## Operating Context

- Used in the Chrome toolbar popup or kept open in Chrome's side panel, next to the agency tabs, all day long.
- Installed from the Chrome Web Store (ID gdggcpmgjoaobfjlnbfmgfnjfgodgikp); Chrome announces only "Read your browsing history" at install.
- Colleagues share agencies through the newsroom's messaging (Slack, Teams, e-mail).

## Capabilities and Constraints

- Interface in French and English.
- A subscription to each agency is still required to see its content.
- Agency names are trademarks of their owners: store descriptions never list agency names; the website follows the same rule.
- The website makes no promise the extension does not keep: no analytics, no cookies, no form, no third-party scripts.

## Brand Commitments

- Name: TabulaPix. Tagline: "Une recherche, toutes vos agences photo." / "One search, all your picture agencies."
- Icon: a text cursor in a rounded white frame with a red magnifying glass (`extension/icons/`).
- Accent red of the extension's Search button.
- Signature: "Made with ♡ and a bit of AI shame by Jérémie" (link to https://www.jeremie.eu/), with the GitHub link.

## Evidence on Hand

- Store screenshots and promotional tile in `store/images/`.
- No testimonials, user counts, customer newsrooms or press: none may be invented.

## Product Principles

1. The user's own accounts and computer: nothing leaves the machine.
2. One action for the daily job: type once, search everywhere.
3. Explain before acting: show what will change (import preview, permissions on demand).
4. Respect what the user arranged (order, folders, collapsed groups).

## Accessibility & Inclusion

Keyboard use throughout the extension (Alt + arrows to reorder, Esc to go back); light and dark themes.
