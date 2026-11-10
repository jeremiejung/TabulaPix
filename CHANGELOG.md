# Changelog

***English** · [Français](CHANGELOG.fr.md)*

Versions published on the [Chrome Web Store](https://chromewebstore.google.com/detail/gdggcpmgjoaobfjlnbfmgfnjfgodgikp) are marked. The version number only changes when submitting to the store (see “Version numbers” in the [README](README.md)).

## [Unreleased]

- **Agency folders** (wire agencies, photographers' agencies, press-service agencies…), each shown as a block in its own colour (9 colours). A folder's checkbox ticks or unticks all its agencies, and is half-ticked when only some are ticked; the counter stands out when a folded folder holds ticked agencies. Folders can be folded and reordered; everything is kept in the exported configuration file (format version 2, still readable by 3.3.0, which keeps folders but not their colour).
- **Organise mode** (pencil at the top): drag handles, folders renamed in place, colour, delete, create at the bottom of the list. In normal use the list only shows names and checkboxes. An agency is put into a folder when dropped on its title (highlighted), Esc cancels a drag, and Alt + ↑ / ↓ also moves agencies between folders and moves folders.
- **Everything about agencies is done in the list**, in Organise mode: hide or show (eye; hidden agencies appear greyed out there), edit (pencil), delete (bin), **+ Add an agency** at the bottom of the list, which opens the add/edit screen (← Back returns to the list). Folders are only managed there. The settings (⚙) keep only the language, the Pixpalace subdomain, backup and import, restoring deleted built-in agencies and factory settings.
- **Built-in agencies are edited like the others**: when editing, the form comes first and detection is folded as “Detect the address again”; Bloomberg, Abacapress and Pixpalace can now also be detected again, switched to a search address or moved to another site (their field is then located again there). Exported as `fill: false` for an agency switched to a search address.
- **Search button right under the keywords**, showing the number of tabs.
- **Sites still to be allowed are detected**: an agency that fills in its site's search field without Chrome's permission (imported configuration, permission refused or removed) is flagged by a banner above the list and a “to allow” badge, with an **Allow** button; the settings button stays available too. On import, the permission is asked for right away when Chrome allows it. The import confirmation is shorter.
- Redesigned list: clearer type hierarchy, aligned checkboxes, drawn icons, larger click targets, small text enlarged.
- Fixes (code audit): searching from the tab opened for an import no longer fails silently; detection no longer replaces keywords found in the site name (e.g. “photos” on photos.example.net); a deleted added agency leaves no trace (ticks, order, folder); site permissions no longer used are released after any change (deletion, switch to a search address, restoring the original, import), and an import also asks for the sites of built-in agencies moved elsewhere; a refused site permission no longer starts the field locating later on.
- Colours aligned with the icon: the same signal red for the Search button, focus and the on-site locating banner (it differed slightly); the icon next to the name at the top; checkboxes outside folders in ink instead of the browser's blue; dark mode with lighter focus and status colours.
- Robustness and accessibility: sufficient contrast in dark mode everywhere (field placeholders, success/error messages, “Restore factory settings”); readable in Windows high-contrast mode (folder outlines, “Done” button, colour chips); names in right-to-left scripts displayed correctly; message when all agencies are hidden; message instead of silent failure if the tabs can’t be opened (extension reloading); a double Enter creates only one folder; main landmark and labelled search form for screen readers.
- Side panel: the “Keep open” button becomes an icon like the others; while the column is open, the toolbar icon acts on it instead of opening a popup on top of it.
- Side panel: the footer (links to jeremie.eu and the source code) now stays at the bottom of the window.

## 3.3.0 — 7 November 2026 (Chrome Web Store)

- **Delete any agency**, built-in ones included; deleted built-in agencies can be restored.
- **Rename any agency**, built-in ones included (“Restore the original” brings the name back).
- **Export / import the configuration** to a JSON file, to keep it outside the extension or share it with colleagues; every imported agency is checked, with a summary before replacing; a button allows the sites needed by imported field-filling agencies. The file format is versioned and compatible both ways (older and newer versions read each other's files, ignoring what they don't know); agency folders (`folders`, `folder`) are already kept on import and export, ahead of the planned folders feature.
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
