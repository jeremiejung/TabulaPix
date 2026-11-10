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
- Layout: in the popup's Organise mode, a row's tools (eye, pencil, bin) appear when hovering or focusing that row, so names are no longer cut off (hidden agencies keep their crossed-out eye; the wider column shows everything); one checkbox column for agencies inside and outside folders; All / None closer to the list than to the Search button.
- Finishing touches: the agency editor and the settings use the same fields and buttons as the list (no more browser-default controls); drawn icons instead of ✓ / ○ for the locating checklist (state also read out by screen readers); larger click targets for text links and folded sections; small text raised to 12 px; no more empty gaps left by message areas; two corner radii (controls, blocks) plus pills; drawn icons for detection warnings and “Back”; the source-code link in the footer gets a 24 px click area; French non-breaking spaces before “:”, “?”, “!”, “;” and inside « ».
- On-site locating banner: can be dragged anywhere with the mouse (⇅ still moves it top / bottom); white outline so it stands out on dark pages.
- Highlight after adding or editing an agency or creating a folder: four quick, sharp green pulses, the last one held then fading out (just the fade when the system asks for reduced motion); the rhythm no longer breaks when the list is rebuilt several times in a row.
- Robustness and accessibility: sufficient contrast in dark mode everywhere (field placeholders, success/error messages, “Restore factory settings”); readable in Windows high-contrast mode (folder outlines, “Done” button, colour chips); names in right-to-left scripts displayed correctly; message when all agencies are hidden; message instead of silent failure if the tabs can’t be opened (extension reloading); a double Enter creates only one folder; main landmark and labelled search form for screen readers.
- After the third design critique: adding an agency folds step 1 into a one-line summary once detected, with a single primary button at a time (Locate, then Add) and the “keywords not in the address” notice shown as a warning; Organise mode gets its own list icon (the pencil now only means editing an agency); deleting an agency or a folder is immediate with an **Undo** line in its place for a few seconds, instead of a confirmation dialog; folder names fit in Organise mode, colour dot before the name; Esc goes back from the editor and the settings; each agency list is labelled with its folder for screen readers; neutral text selection and an ink clear button in the search field.
- After the second design critique: adding an agency starts from the open tab (address, and keywords when they match your last search or the address's search parameter); folder titles look the same in Organise mode (uppercase, colour dot always visible, name visibly editable); red kept for the Search button (hidden-agency eye in grey, neutral “fill the field” box, neutral “Search paused” button while organising, danger hover in the error colour); **Alt + Shift + Y** opens TabulaPix; Alt + ↑ / ↓ only moves agencies in Organise mode, with screen-reader announcements; one-line Organise help with details on demand; folder counters read as “2 of 3 ticked”; form fields use the interface font.
- Every message now appears next to its cause: folder name errors under the field (new folder) or on the field itself (renaming); agency editor input errors (name, address, template, encoding) under the faulty field as soon as it has been edited, instead of only in the disabled button's tooltip; locating messages under “Locate the field on the site” instead of at the bottom of the editor; detection result under “Detect again” when editing; side-panel button errors right under the header. Text fields show their focus in ink rather than red, so it can’t be mistaken for an error.
- Side panel: the column no longer keeps a permanent connection to the background script (source of the “Receiving end does not exist” error in chrome://extensions); it now signals its opening, and closing is detected by Chrome or at the next tab or window change.
- Side panel: the “Keep open” button becomes an icon like the others; while the column is open, the toolbar icon acts on it instead of opening a popup on top of it.
- Side panel: the footer (links to jeremie.eu and the source code) now stays at the bottom of the window.
- After the settings design critique: settings are saved as soon as you leave the field or press Enter (“✓ Saved” next to the label; no more Save button), and changing the language no longer discards a value being typed; an invalid Pixpalace subdomain is reported under the field; a **Needs attention** block at the top names the agencies whose site still has to be allowed, with **Allow these sites**; new **Quick access** section (keyboard shortcut and link to change it, column button); deleted built-in agencies are named; clearer hierarchy (section titles above field labels) and shorter texts.

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
