# Changelog

***English** · [Français](CHANGELOG.fr.md)*

Versions published on the [Chrome Web Store](https://chromewebstore.google.com/detail/gdggcpmgjoaobfjlnbfmgfnjfgodgikp) are marked. The version number only changes when submitting to the store (see “Version numbers” in [DEVELOPMENT.md](DEVELOPMENT.md)).

## [Unreleased]

- **Receiving a share code is easier.** **+ Add an agency** is now also at the bottom of the list outside Organise mode (where the share message sends your colleague), and a code pasted into the keywords field opens the add screen directly. An incomplete or damaged code is reported instead of ignored.
- **Organise mode: the bin no longer sits next to the name.** Tools are in the same order on agencies and folders: share, pencil, eye, then bin. The **Undo** line stays fifteen seconds instead of six, and a folder's bin tooltip says its agencies are kept.
- **File import: “Add” is selected by default**, the mode that removes and changes nothing. When there is nothing to replace, the **Replace** button looks disabled.
- **Permission banner on one line** (“3 agencies need your permission.” + **Allow**); the list of agencies is in its tooltip and on the “to allow” pills.
- **Side panel: “Organise” and “Settings” spelled out** next to their icon (the popup keeps icons only).
- “Tick at least one agency.” and the other search errors show in red; an agency name being edited has a visible keyboard focus ring.

## 3.7.0 — 25 November 2026 (Chrome Web Store)

- **Share an agency or a folder by copy / paste.** In Organise mode, a **share** icon on added agencies, edited built-in agencies and folder titles (and a **Share** button in an agency's pencil) copies a short code (`TabulaPix:1:…`) to paste into Slack, Teams or an e-mail. Your colleague pastes it into **+ Add an agency** or into **⚙ › Backup and sharing**: the import box opens in Add mode with what will actually be added (arriving ticked, in the shared folder). Never your ticks, settings or searches; no network, the newsroom's messaging carries it. A built-in agency the receiver hasn't edited takes the shared settings (e.g. a sign-in page).
- **Rename an agency right in the list** (Organise mode), like a folder. In this mode an agency is now dragged by its handle only, so that clicking its name lets you type.

## 3.6.13 — 25 November 2026 (Chrome Web Store)

- Tab groups: a group you collapsed in Chrome now stays collapsed on the next searches (its tabs still load). Before, every search unfolded it again. TabulaPix never unfolds a group by itself any more; “Collapse the groups after the search” still folds them all.

## 3.6.12 — 24 November 2026 (Chrome Web Store)

- Import preview: re-importing your own export no longer announces “settings replaced by the file’s” for the built-in agencies you had edited (e.g. a sign-in page added to Pixpalace): the settings were the same, only stored in a different order. Nothing was actually changed by the import.

## 3.6.11 — 24 November 2026 (Chrome Web Store)

- **Import shows what will actually change.** Next to each part, the confirmation now compares the file with your configuration instead of describing the file: right after an export, re-importing shows “to add: 0 · already there: 31” and the button stays disabled. In Replace mode it names the agencies that arrive, those that are removed and those whose settings (address, located field…) would be replaced by the file's, and shows each setting as “current → file”.
- **Add mode brings back the built-in agencies you deleted** when the file still has them (with the file's tick, folder and settings for that agency).
- **Settings one by one**: language, Pixpalace subdomain and tab groups can each be unticked when importing (all ticked by default).
- The **version number** is shown at the bottom of the window, before the source code link.

## 3.6.10 — 24 November 2026 (Chrome Web Store)

- **Choose what to import, and how.** Importing a configuration file no longer always replaces everything:
  - **what**: Agencies, Ticked boxes and hidden agencies, Folders (with their colours), Settings — each shown with what the file contains;
  - **how**: **Replace** (what you tick replaces yours, the rest doesn't change; all ticked = as before) or **Add** (only what you are missing: the file's added agencies you don't have yet, its folders, and a folder for your agencies outside any folder — nothing of yours is removed or changed).
- The configuration file now includes the tab groups option (format 5).

## 3.6.9 — 23 November 2026 (Chrome Web Store)

- Organise mode: the colour dots of a folded folder now show under its title when you click its colour, instead of staying hidden inside the folded folder; the folder stays folded.

## 3.6.8 — 22 November 2026 (Chrome Web Store)

- Dragging an agency or a folder now scrolls the list by itself, to reach a place out of view: near the bottom of the window, or towards the top (over the header that stays in place), faster the closer you get to the edge. Upwards, the list did not scroll at all since the header stays at the top (3.6.7), and in the popup Chrome did not scroll it in either direction.

## 3.6.7 — 22 November 2026 (Chrome Web Store)

- The top of the window (keywords, **Search** button, Organise and Settings buttons) stays visible while the list of agencies scrolls; a thin line separates it from the list once it scrolls underneath.

## 3.6.6 — 22 November 2026 (Chrome Web Store)

- **Fewer permissions on installation**: Chrome now only announces “Read your browsing history” (`tabs`, needed to reuse agency tabs).
  - Bloomberg, Abacapress and Pixpalace are allowed on demand, like the other agencies whose search field is filled in (“to allow” badge and banner). Existing users keep Bloomberg and Abacapress; Pixpalace must be allowed again once, for your subdomain only.
  - Tab groups (`tabGroups`) are requested only when you turn the option on, and given back when you turn it off. Contrary to what 3.6.0 said, Chrome did show a warning for them (“View and manage your tab groups”). If you already used the option, it keeps working.
  - `clipboardWrite` is removed: the keywords for “paste” agencies are copied as soon as you click **Search**, which needs no permission.

## 3.6.5 — 21 November 2026 (Chrome Web Store)

- **Signing in to an agency**: for agencies with a sign-in page (Sipa as shipped), a “Sign in” icon appears on hover in the list, next to the handle. It opens the sign-in page in the agency’s tab if it is open (and runs that tab’s last search again once you are signed in), otherwise in a new tab, which then becomes the agency’s tab. Any agency can be given a sign-in page in its pencil (Technical details › Sign-in page), or have it removed; it is kept in the configuration file (format 4).
- **Sipa without a session**: a search opened while signed out of Sipa showed a black page. TabulaPix now recognises it from the tab’s title (“Sipa Press”, without “> Search”), opens the Sipa sign-in page in the same tab and, as soon as you are signed in, runs the search again. Only once per search, and forgotten after 10 minutes; a password-reset or sign-up page on the way is not interrupted.

## 3.6.0 — 20 November 2026 (Chrome Web Store)

- **Tab groups by folder** (option, off by default, in Settings › Tabs): the tabs of each folder open in a Chrome tab group with the folder’s name and colour; agencies outside folders stay ungrouped; a later search reuses the folder’s group if it is still open (even renamed). A second option collapses the groups after the search. New `tabGroups` permission, which Chrome shows no warning for. Pinned agency tabs stay pinned, outside groups, and a group holding the tab you are looking at is never collapsed.

## 3.5.8 — 19 November 2026 (Chrome Web Store)

- Locating a site’s search field is more robust on modern “application” sites (e.g. the Paris specialised libraries): ids with a short counter (`searchTextField_13`) and short generated classes (`jss313`) are no longer recorded as such, since they change on every load; TabulaPix uses a stable description instead (e.g. `input[type="search"]`, or “id starting with `searchTextField_`”). Agencies already located with such an id keep working: if `#name_13` is not found, the field whose id starts with `name_` is used.

## 3.5.7 — 19 November 2026 (Chrome Web Store)

- Organise mode: hovering (or focusing) an eye shows the state a click will give — crossed eye to hide, open eye to show again. Right after a click, the eye shows the new state until the mouse (or keyboard focus) leaves it.

## 3.5.6 — 19 November 2026 (Chrome Web Store)

- **New agency: Magnum** (Reportage folder, unticked). It fills in its site's search field, so Chrome asks for permission for the site when you tick it; existing users get it with the “New” badge, and if you had already added Magnum yourself, yours is kept.
- Organise mode: the eye now sits next to the handle (bin · pencil · eye), so it no longer moves when the other tools appear on hover in the popup — the bin used to slide under the mouse when you wanted to show a hidden agency again. Same order on folder titles.
- The Organise button’s tooltip now says “Organise and edit”, since agencies are also edited, hidden and deleted in this mode; while the mode is on, screen readers also hear its visible “Done”.

## 3.5.5 — 13 November 2026 (Chrome Web Store)

- When an agency’s site sends the tab TabulaPix opened to its login page on another address (Hans Lucas, for example), searching again now reuses that tab instead of opening a new one each time. Only redirects right after opening count: a tab you take to another site yourself is never reused.
- The background script no longer rewrites its session storage on every page load in unrelated tabs.

## 3.5.4 — 13 November 2026 (Chrome Web Store)

- Settings: built-in agencies set aside because you already had the same one (added by hand) are no longer listed under “Agencies removed from the list”, and **Restore** no longer brings them back as duplicates; if you delete your own, the built-in one becomes restorable again. The import summary no longer counts them as deleted either.

## 3.5.3 — 13 November 2026 (Chrome Web Store)

- **Hide a folder** with its eye in Organise mode, like an agency: the folder and its agencies disappear from the list and are never searched, their ticks being kept for when it is shown again. Hidden folders appear greyed out in Organise mode only, and keep their place in the folder order.
- A folder whose agencies are all hidden no longer shows in normal use (it still does in Organise mode); a truly empty folder still shows, as a place to drop agencies.
- In the agency editor, hidden folders are marked “(hidden)” in the Folder menu.
- Configuration file format version 3: folders carry `hidden` (older versions ignore it).

## 3.5.2 — 12 November 2026 (Chrome Web Store)

- Shipped folders that were never renamed now follow the interface language (Actualité ↔ News…); a name chosen by the user stays as it is.
- Fixes (code audit): a future built-in agency will no longer reshuffle the list of someone who installed 3.5 and never reordered (the 3.4.1 order is only used for users coming from before the shipped folders); “Try” in the agency editor asks for the site's permission when a field-filling agency doesn't have it yet, instead of failing; dragging a folder no longer shows the empty “No folder” drop zone; the “New” counter is no longer rewritten on every opening when empty; the Organise help line gets a 24 px click target.

## 3.5.1 — 12 November 2026 (Chrome Web Store)

- **“New” badge** on agencies that arrive with an update (not on a first install), in the colour of their folder: it stays for five openings of TabulaPix, and goes away as soon as the agency is ticked or moved.

## 3.5.0 — 12 November 2026 (Chrome Web Store)

- **14 new agencies**: Divergence, Hans Lucas, Myop, Signatures, Vu', AgencesONline, Bestimage, Bureau 233, Phototélé, Starface, Alamy, Unsplash, Gamma-Rapho, Photo12. Those that fill in their site's search field ask for Chrome's permission when they are ticked, so no new permission is requested on installation or update.
- **Shipped folders**: on installation, agencies come sorted into News, Documentary, Aggregators, Celebrity, Stock and Archives. Users who have not created any folder yet get the same sorting once, keeping their ticks, hidden agencies and order; users who already have folders keep theirs untouched, and new agencies arrive unticked at the end of their list.
- Sites to allow (banner, badges, “Needs attention”) now only concern ticked agencies.
- “No folder” is no longer shown when empty, except while dragging (to drop an agency there); a folder name too long for the popup shows in full on hover.
- A built-in agency arriving with an update no longer duplicates one the user had already added by hand (same address, parameters included apart from the keywords, or same site and same name): theirs is kept, and the built-in one is set aside like a deleted agency (Restore in the settings).

## 3.4.1 — 11 November 2026 (Chrome Web Store)

- **Reorder at any time**, without Organise mode: hovering over an agency or a folder shows its handle, to drag it; Alt + ↑ / ↓ on a checkbox works at any time too.
- A click on a folder's title folds or unfolds it; only its checkbox ticks or unticks its agencies (no more ticking everything by mistake).
- Hovering over an agency highlights its line in normal mode too, as in Organise mode.
- Dragging keeps the line where it was grabbed under the mouse, instead of jumping so that its checkbox sits under the pointer.
- Import: the confirmation is now a clearly flagged warning box in the page (instead of a browser dialog), saying that the current configuration will be entirely replaced and listing what the file contains, including the number of folders.
- Changing the language in the settings now also translates the “Needs attention” block, the keyboard shortcut line and an open import confirmation.
- Empty folder: the hint is the same in both modes (“Drag an agency onto the folder's title.”).
- Footer: the two signature lines are closer together, with the same click areas.
- Organise mode: the one-line help is lighter (“Drag to arrange · Esc”); the Alt + ↑ / ↓ keyboard shortcut is still explained in the folded help and is now read out by screen readers on each checkbox.

## 3.4.0 — 10 November 2026 (Chrome Web Store)

- **Agency folders** (wire agencies, photographers' agencies, press-service agencies…), each shown as a block in its own colour (9 colours). A folder's checkbox ticks or unticks all its agencies, and is half-ticked when only some are ticked; the counter stands out when a folded folder holds ticked agencies. Folders can be folded and reordered; everything is kept in the exported configuration file (format version 2, still readable by 3.3.0, which keeps folders but not their colour).
- **Organise mode** (list icon at the top): drag handles, folders renamed in place, colour, delete, create at the bottom of the list. In normal use the list only shows names and checkboxes. An agency is put into a folder when dropped on its title (highlighted), Esc cancels a drag, and Alt + ↑ / ↓ also moves agencies between folders and moves folders.
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
- Site permissions: a site whose field has been located for an agency being added is no longer released before that agency is saved; permissions left unused by a deletion whose Undo window was cut short (popup closed) are released the next time TabulaPix opens.
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
