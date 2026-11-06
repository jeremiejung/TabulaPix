# Changelog

***English** · [Français](CHANGELOG.fr.md)*

Versions published on the [Chrome Web Store](https://chromewebstore.google.com/detail/gdggcpmgjoaobfjlnbfmgfnjfgodgikp) are marked. The version number only changes when submitting to the store (see “Version numbers” in the [README](README.md)).

## [Unreleased]

- **Delete any agency**, built-in ones included; deleted built-in agencies can be restored.
- **Rename any agency**, built-in ones included (“Restore the original” brings the name back).
- **Export / import the configuration** to a JSON file, to keep it outside the extension or share it with colleagues; every imported agency is checked, with a summary before replacing; a button allows the sites needed by imported field-filling agencies. The file format is versioned and reserves `folders` for future agency folders.
- **Restore factory settings** button.
- Documentation: README and changelog in English (`README.md`, `CHANGELOG.md`) and French (`README.fr.md`, `CHANGELOG.fr.md`); version numbering rule.

## 3.2.0 — 6 November 2026 (Chrome Web Store)

- **Reuters in two versions**, depending on the Reuters Connect contract:
  - **Reuters (points)**: the former “Reuters” agency, renamed (ticks and order kept). Classic interface, which shows the balance of credit-based accounts.
  - **Reuters (standard)**: new agency for accounts without points (free download, pay on publication), “app” interface.
- **Agencies hidden by default**: Reuters (standard) and AFP (forum) are hidden on install as well as on update; show them in ⚙ → Agencies shown. The user's choice is respected afterwards.
- Link to the Chrome Web Store listing in the README.

## 3.1.1 — 5 November 2026 (Chrome Web Store, first release)

First version published on the Chrome Web Store.

- One search, all your picture agencies: one tab per agency, opened in the background, with your own accounts; reuses an agency's tab that is already open; remembers the last search.
- Built-in agencies: Reuters, AFP (news and forum), Bloomberg, Sipa, Getty Images (Creative and Actu), Shutterstock, Adobe Stock, Abacapress, Rea, Pixpalace, MaxPPP. Order customisable by drag and drop, agencies can be hidden.
- Automatic filling of the search field for sites whose address doesn't contain the search (Bloomberg, Abacapress, Pixpalace), with the option to **locate the field again** if a site changes its page.
- Guided **adding of agencies**: automatic detection of the keywords in the address (plain, with dashes, or encoded: URL, hexadecimal, base64, gzip), or locating the search field directly on the site; “Try” button. Built-in agencies can be edited, with a way back to the original.
- Side panel (“Keep open”) to chain searches.
- Interface in **English and French**, following the browser language or chosen in the settings.
- No data collection, no network requests; access to an additional site requested case by case.

## Development versions (unreleased)

Before the first release, versions followed each other quickly (one per change):

- **3.0.x – 3.1.0** (5 November 2026): English translation and language setting, code audit and fixes (including Bloomberg's delay), link to the source code, locating built-in agencies' fields again.
- **2.x** (4–5 November 2026): full settings inside the extension (hidden, edited and added agencies), automatic detection, on-site field locating, guided add-agency flow, new name **TabulaPix** (formerly Wire Sweep).
- **1.x** (4 November 2026): first versions (Wire Sweep) — search on a dozen agencies, field filling for Bloomberg, Abacapress and Pixpalace, tab reuse, side panel, icon, Pixpalace subdomain setting.
