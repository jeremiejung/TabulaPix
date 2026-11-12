# TabulaPix

***English** · [Français](README.fr.md)*

**One search, all your picture agencies.**

**➜ [Install from the Chrome Web Store](https://chromewebstore.google.com/detail/gdggcpmgjoaobfjlnbfmgfnjfgodgikp)**

Chrome extension for photo desks, picture researchers and photo editors: type your keywords once and search all your news picture agencies at the same time. TabulaPix opens one tab per agency with the results ready, using your own logged-in accounts. No scraping, no API keys, no passwords stored. Interface in English and French.

Everything is set up from the extension itself (⚙ button), without editing any file: agencies shown, order, agencies added with automatic detection, editable addresses and field locations, language, Pixpalace subdomain. Ticked agencies and their order are remembered between uses.

Chrome extension (Manifest V3) in plain HTML/JavaScript: no dependencies, no build step.

## Installation

**The easiest way: [install TabulaPix from the Chrome Web Store](https://chromewebstore.google.com/detail/gdggcpmgjoaobfjlnbfmgfnjfgodgikp)**, then pin the extension (puzzle icon 🧩 → pin next to **TabulaPix**). Updates then arrive automatically.

> If you have been using the version loaded from a folder, Chrome treats the store version as a different extension: your settings (ticked agencies, order, added agencies, Pixpalace subdomain) are not carried over. Write them down, install the store version, set them again, then remove the old version in `chrome://extensions` so that you don't have TabulaPix twice.

**Manual installation** (development version, from this repository):

1. Download this repository (**Code → Download ZIP** on GitHub) and unzip it, or clone it with `git clone`.
2. In Chrome, open `chrome://extensions`.
3. Turn on **Developer mode** (switch at the top right).
4. Click **Load unpacked** and choose the repository's `extension` folder.
5. Pin the extension: puzzle icon 🧩 in the toolbar → pin next to **TabulaPix**.
6. Adjust your **settings** (⚙ button in the popup), in particular the subdomain of your Pixpalace space (see “Settings” below).

Also works in Chromium-based browsers (Edge, Brave, Arc…) through their equivalent extensions page.

> **Do not move, rename or delete the folder after installing.** Chrome reads the extension directly from that folder: if it moves, the extension no longer loads (it is disabled, with an error in `chrome://extensions`).
> So choose a lasting location before installing (for example `Documents/TabulaPix`), not the Downloads folder or the Desktop.
> If the folder was moved: remove TabulaPix in `chrome://extensions`, then repeat step 4 choosing the `extension` folder in its new location. Chrome then treats it as a new extension: ticked agencies and their order have to be set again.

## Updating a manual installation

(The Chrome Web Store version updates itself.)

1. Download the new version (**Code → Download ZIP**) and unzip it.
2. Copy the **contents** of its `extension` folder into the `extension` folder already installed, replacing the existing files. Keep the same folder, in the same place: this is what keeps your ticked agencies and their order.
3. In `chrome://extensions`, click the **↻** (reload) button on the TabulaPix card.
4. If Chrome shows a warning about new permissions, accept it: the “Privacy” section below explains each of them.

If you installed with `git clone`: `git pull` in the repository folder, then **↻** in `chrome://extensions`.

If you had edited `config.js`, note your changes before replacing the files, then copy them into the new `config.js`.

## Usage

1. Click the TabulaPix icon, or press **Alt + Shift + Y** (shortcut changeable in `chrome://extensions/shortcuts`).
2. Type your keywords and tick the agencies you want (**All** / **None** buttons to go faster).
   **Folders** group agencies, each in its own colour. On installation, the agencies come sorted into six folders: News, Reportage & photographers, Aggregators, Celebrity, Stock and Archives (only News, Reportage and Aggregators are ticked); they are yours to rename, recolour, reorder or delete. A folder's checkbox ticks or unticks all its agencies at once; it is half-ticked when only some of them are ticked (the counter shows how many). A click on a folder's title (or on **›**) folds or unfolds it, without ticking anything. Tabs open in the order of the list.

   **Reorder at any time**: hovering over an agency or a folder shows its handle (on the right); drag it between two agencies, or onto a folder's title (highlighted) to put an agency there. With the keyboard, **Alt + ↑ / ↓** on a checkbox does the same.
3. Press **Enter** or **Search**, right under the keywords: one tab opens per agency (the button shows how many).
   Tabs open in the background: you stay on the tab you are on.
   Your last keywords are shown again (already selected) the next time you open TabulaPix: just type to replace them.
   If a tab is already open on an agency's site (for example after a previous search), it is reused: the new search shows there instead of opening one more tab.

**Keep open:** the **column** button (first icon at the top of the popup) shows TabulaPix in a column on the right of the window (Chrome's side panel, version 116 or later). The column stays open when you switch tabs, so you can chain searches without reopening the extension. While the column is open, the TabulaPix icon in the toolbar acts on the column (it doesn't open a popup on top of it); once the column is closed, the icon opens the popup again. To close it: the cross at the top of the column. It can also be reopened from Chrome's side panel icon.

For some agencies (Bloomberg, Abacapress, Pixpalace, Hans Lucas, Myop, Signatures, Vu', Bestimage, Bureau 233, Phototélé, Starface), the address cannot contain the search: the extension opens the page, types your keywords into the search field and clicks the button for you (allow a second or two more). Apart from Bloomberg, Abacapress and Pixpalace, Chrome asks once for permission for the site: when you tick such an agency, a “to allow” badge and a banner offer to allow it.

If an agency added later has neither an address with `{q}` nor automatic field filling, it is marked **“paste”**: the page opens and your keywords are copied to the clipboard; just press **Ctrl+V** (or **Cmd+V**) in the search field.

You need to be logged in to your agency accounts in Chrome, as usual: the extension only opens tabs.

## Organise mode

The **Organise** button at the top (list icon, next to the column button) switches to **Organise** mode (**Esc** or **Done** to leave it; the search field and button, and All / None, are disabled meanwhile, so that you don't stay in this mode by mistake). In normal use, the list only shows names and checkboxes (and lets you reorder them); everything else about agencies and folders is done here, right in the list.

- **Order and folders**: as outside this mode, and an agency can also be dragged by its name: drag it by its name or its handle (on the right) between two agencies, or onto a folder's title (highlighted) to put it there; drag a folder by its handle to reorder folders. A drag cancelled with Esc changes nothing. With the keyboard, **Alt + ↑ / ↓** on an agency's checkbox moves it (and into the next folder at the edge), on a folder's checkbox moves the folder.
- **Folders**: rename a folder right in its title, change its colour with its dot, delete it with the bin (its agencies are kept, outside any folder; **Undo** for a few seconds), create one at the bottom of the list.
- **Agencies**, on each line:
  - **eye**: hides the agency (it disappears from the list, its place is kept) or shows it again; hidden agencies appear greyed out in Organise mode only.
    - **Reuters** comes in two versions, depending on your contract: **Reuters (points)** for credit-based accounts (shows your points balance), shown by default, and **Reuters (standard)** for accounts without points (free download), hidden by default: show the one that matches your account with its eye. **AFP (forum)** is also hidden by default.
  - **pencil**: edits the agency (see below);
  - **bin**: deletes any agency, built-in ones included, at once; an **Undo** line takes its place for a few seconds (deleted built-in agencies can also be brought back later in ⚙ with **Restore**).
- **+ Add an agency**, at the bottom of the list, opens the add screen (**← Back** returns to the list).

### Adding an agency

In three steps:
  1. **Detect**: run a search on the agency's website, then paste the address of the results page and the keywords you typed (e.g. “Estonia border”) and click **Detect**. If the open tab is already the agency's results page, TabulaPix fills in its address, and the keywords too when they are your last TabulaPix search or the address's search parameter: just click **Detect**.
  2. **Check**: TabulaPix suggests a name (the site's domain, e.g. `search.reaphoto.com` → “Reaphoto”) and fills in the search address, with a green highlight on what it just filled in.
     - If the keywords are in the address (plain, with dashes, or wrapped: URL encoding, hexadecimal, base64, gzip and combinations of them), it is ready.
     - Otherwise (search stored on the server, like Pixpalace, or a page whose address doesn't change), TabulaPix will fill in the site's search field: click **Locate the field on the site**. Chrome asks for permission for that site (and that site only), the site opens with a TabulaPix banner: click its search field, then its button (or “No button: use Enter”; the banner can be dragged anywhere, and **⇅** moves it). TabulaPix then reopens on this step, with “✓ Search field” and “✓ Search button”.
     - **Try** runs a test search in a new tab, with the current settings.
  3. **Add the agency**: the button only becomes active when everything is correct; TabulaPix goes back to the list, where the agency appears ticked and highlighted.

  The “Type the address by hand” link lets you type an address directly, with `{q}` in place of the keywords (or `{q:slug}` if the site separates words with dashes: “Estonia border” → `Estonia-border`). Without `{q}`, the page opens and the keywords are copied to be pasted. **Technical details** (folded) show the template and encoding steps, or where the located field and button are. Deleting an agency that fills in a field also removes the permission granted for its site.

  Locating ignores ids generated on every page load (e.g. `…__bfac60392382`) and relies on stable landmarks (field name, class, button label…); if the site has several identical search forms, TabulaPix uses the first visible one and the button closest to the field. If the site changes its page, locate the field again (pencil then **Locate again**).
### Editing an agency

- **Edit an agency** (its pencil): the same screen, straight at the form (name, folder, address), with **Save**. If the site has changed, **Detect the address again from the site** (folded, at the bottom) runs the detection again from a results page; for an added agency that fills in a field, its located field is kept if the keywords still aren't in the address. Every agency can be renamed, built-in ones included; for built-in agencies, **Restore the original** goes back to the shipped name and settings.
  - **Bloomberg, Abacapress and Pixpalace** fill in their site's search field: if one of them changes its page and the search no longer starts, open its pencil then **Locate again** to show it the field and button again (no extra permission is requested; Bloomberg's specific delay is kept). Like any agency, they can also be detected again, switched to a search address (**Use a search address instead**) or moved to another site (the field is then located again there, with Chrome's permission for that site); **Restore the original** brings back the shipped behaviour.
## Settings

The **⚙** button at the top shows the settings right in the popup; **← Back** (or Esc) returns to the search. There is no Save button: each setting is saved as soon as you leave the field or press Enter, with a short “✓ Saved” next to it.

- **Needs attention** (at the top, only when needed): lists the added or imported agencies whose site Chrome has not allowed yet, with an **Allow these sites** button.

- **Language**: English or French. By default, TabulaPix follows the browser language (“Automatic”); the change applies immediately. The name and description shown in `chrome://extensions` and on the Chrome Web Store always follow the browser language.
- **Pixpalace** › **Subdomain**: the part before `.pixpalace.com` in the address of your Pixpalace space (`www` by default). For example, for `https://mynewsroom.pixpalace.com/home`, type `mynewsroom`. An invalid value is reported under the field and not saved.
- **Quick access**: shows the keyboard shortcut that opens TabulaPix (Alt + Shift + Y by default), with a link to change it, and reminds you that the column button keeps TabulaPix open beside the page.
- **Backup and sharing**: **Export** saves your whole configuration to a `.json` file (agencies and their order, names, addresses, field locations, ticked, hidden and deleted agencies, language, Pixpalace subdomain — never your searches). **Import…** loads such a file, after a clearly flagged confirmation (your current configuration is entirely replaced) showing what the file contains — agencies, folders, ticked agencies: use it after reinstalling, or to share a configuration with colleagues. Every agency in the file is checked like an agency added by hand; invalid ones are ignored. If the file contains agencies that fill in their site's search field, TabulaPix asks Chrome for those sites right away when it can (Chrome only allows it shortly after a click); otherwise, and as long as a site is still not allowed (permission refused, or removed in Chrome), a banner above the list, a “to allow” badge on the agency and the **Allow these sites** button under “Needs attention” in the settings let you allow it at any time. From the popup, Import opens TabulaPix in a tab (Chrome closes the popup when a file picker opens).
- **Agencies removed from the list**: names the deleted built-in agencies; **Restore** brings them back (shown only when there are some).
- **Factory settings**: **Restore factory settings** erases your settings, your added, edited or deleted agencies and the site permissions you granted, and goes back to the shipped configuration (after confirmation; export first if you want to keep yours).

These settings stay in Chrome on your computer and are kept across updates.

## Configuration file

The file created by **Export** is plain JSON, readable and editable:

```json
{
  "format": "tabulapix-config",
  "formatVersion": 2,
  "minReaderVersion": 1,
  "exportedAt": "2026-11-06T10:00:00.000Z",
  "app": { "name": "TabulaPix", "version": "3.4.1" },
  "settings": { "language": "auto", "options": { "pixpalaceSubdomain": "www" } },
  "folders": [{ "id": "f-wire", "name": "Wire agencies", "color": "blue" }],
  "agencies": [
    { "id": "reuters", "builtin": true, "name": "Reuters (points)", "folder": "f-wire", "checked": true, "hidden": false },
    { "id": "custom-abc123", "builtin": false, "name": "Alamy", "url": "https://www.alamy.com/search.html?qt={q}", "checked": true, "hidden": false }
  ],
  "removedBuiltins": ["afp-forum"]
}
```

- `agencies` is in list order. Built-in agencies only carry `name`, `url`, `payload`, `encode` or `fill` when they were edited; added agencies always carry their address (and `fill` when they fill in a search field).
- **Compatibility between versions**: new versions only *add* optional fields, never change the meaning of an existing one (`formatVersion` goes up). So a newer TabulaPix reads older files (missing fields get their default value), and an older TabulaPix reads newer files, ignoring what it doesn't know yet (the import summary says so; built-in agencies it doesn't know are counted separately). Only an incompatible change, to be avoided, would raise `minReaderVersion`: an older TabulaPix then refuses the file and asks for an update.
- **Folders** (`folders: [{ "id", "name", "color", "collapsed" }]`, and a `folder` field on each agency) are exported and imported with the rest, including each folder's colour (`blue`, `teal`, `green`, `amber`, `orange`, `red`, `pink`, `violet`, `gray`) and whether it is folded. A folder's checkbox is not stored: it is derived from its agencies. An older version that doesn't show folders still keeps them and writes them back, so nothing is lost when colleagues with different versions exchange files (other fields that a future version might add are ignored).

## Editing the built-in agencies (development)

Everything is in **`extension/config.js`**. Each agency has a name and an address where the keyword is replaced by `{q}`:

```js
{
  id: "getty-actu",
  name: "Getty Actu",
  url: "https://www.gettyimages.fr/search/2/image?family=editorial&phrase={q}"
}
```

To have an agency unticked on a first install, add `defaultChecked: false`; to have it hidden (to be shown with its eye in Organise mode), `defaultHidden: true` — applied the first time the agency appears, including on an update (this is the case for AFP (forum) and Reuters (standard)). Folders are declared in `FOLDERS` (fixed `id`, French and English names, colour) and each agency gives its own (`folder`). On a first install, or the first time this version opens for a user who has not created any folder yet, the shipped folders are created and the agencies sorted into them (ticks, hidden agencies, names and relative order are kept; added agencies stay outside folders). After that, folders belong to the user: an update never creates, renames or deletes one. A new built-in agency goes into its folder if the user still has it (even renamed), otherwise outside any folder; for existing users it arrives unticked, at the end of the list. An import keeps the file as it is. If a user had already added the same agency by hand (same address, parameters included apart from the keywords, or same site and same name), their own is kept and the built-in one is set aside like a deleted agency (**Restore** in the settings brings it back).

Tip for finding the address: run a search on the site with easy-to-spot words (e.g. `midterms texas democrats`), copy the URL of the results page and replace the words with `{q}`. Depending on the site, spaces appear as `%20` or `+`: replace the whole thing, separators included.

Newsroom-specific values are not hard-coded: they go through an option, inserted in the address with `{opt:name}` (see `OPTIONS` at the bottom of `config.js`).

Some sites (AFP news, Sipa, Rea) “wrap” the search in the URL (hexadecimal, or gzip + base64). For them, the content is described in `payload` and the encoding steps in `encode` — see the comments at the top of `config.js`.

For sites whose address cannot contain the search, the field to fill in and the button to click are given instead (`fill`), as CSS selectors. Such a site needs Chrome's permission: either it is in `host_permissions` of `extension/manifest.json` (granted on installation, but adding one disables the extension for existing users until they accept it), or — preferred — the user allows it on demand: a “to allow” badge appears when the agency is ticked.

After any change: `chrome://extensions` → **↻** (reload) button on TabulaPix.

## Icon

A text cursor in a rounded frame with a white background (readable in dark mode), with a red magnifying glass at the bottom right. Sources in `extension/icons/`: `icon.svg` (32 to 128 px) and `icon-16.svg`, a simplified version drawn for 16 px. The PNGs `icon-16/32/48/128.png` are their actual-size exports. To change the icon, edit the SVGs and export them again at the same sizes, on a transparent background.

## Privacy

- No data collection, no passwords, no account.
- No network calls: the extension only opens tabs (its security policy actually forbids any request: `connect-src 'none'`).
- The only data stored: ticked agencies, their order, hidden, edited or added agencies, the last search and your settings, stored locally in Chrome (`chrome.storage.local`), never transmitted. Only the last search is kept (no history); it disappears when the extension is uninstalled.
- Permissions requested:
  - `storage`: remember your ticks and settings;
  - `clipboardWrite`: copy the keywords for “paste” sites;
  - `sidePanel`: show TabulaPix in the right-hand column;
  - `tabs`: see the addresses of open tabs, to reuse an agency's tab that is already open instead of opening a new one. Nothing is stored or transmitted. For this, Chrome shows the “Read your browsing history” warning;
  - access to an additional site, requested case by case (Chrome prompt) only when you add an agency whose search field must be filled in, and removed when you delete it;
  - `scripting` + access to `mercury.bloomberg.com`, `search.abacapress.com` and `*.pixpalace.com`: only to type the keywords into these three sites' search field and click the button. The extension reads nothing else on these pages. For this, Chrome shows a “Read and change your data on these sites” warning.

See also the [privacy policy](PRIVACY.md).

## Security

- Built-in agencies come from `config.js`, shipped with the extension, and added agencies from your settings: nothing is downloaded.
- The background script only accepts requests from its own popup, and only opens `https` addresses matching the site declared for each agency (including added agencies, whose address is checked when added and on every read).
- Before filling in a field, it checks that the tab is still on the agency's site.
- Locating a field on an added site: the banner is only shown in the tab opened for that purpose; the result is only accepted from that tab, on that site, and only contains where the field and button are (no page content is read or kept).
- Keywords are inserted as text (never as code) and encoded in addresses.
- Updates: the Chrome Web Store version updates automatically, after Google reviews each version. A manual installation never updates itself: only replace its folder with a version coming from this repository. Protect the GitHub account with two-factor authentication.

## Version numbers

The version number (`version` in `extension/manifest.json`) **only changes when submitting to the Chrome Web Store**, once per submission, however many changes were merged in between:

- **fix**: last digit (3.2.0 → 3.2.1);
- **new feature**: middle digit (3.2.x → 3.3.0);
- **major change**: first digit.

The store refuses a number lower than or equal to the published version: there is no going back.

The version history is kept in [`CHANGELOG.md`](CHANGELOG.md).

## Chrome Web Store

The listing materials (descriptions, permission justifications, review instructions) are in [`store/fiche-chrome-web-store.md`](store/fiche-chrome-web-store.md) (in French, with the English texts to paste), the screenshots and promotional images in [`store/images/`](store/images/), and the privacy policy in [`PRIVACY.md`](PRIVACY.md).

## License

TabulaPix is released under the **MIT license** (see [`LICENSE`](LICENSE)): you may use, modify and share it freely, provided you keep the author and license notice. The software is provided “as is”, without warranty.

TabulaPix is an independent tool, not affiliated with the agencies mentioned. The names AFP, Reuters, Getty Images, Sipa, Shutterstock, Adobe Stock, Abacapress, Rea, Pixpalace, MaxPPP, Bloomberg and others are trademarks of their respective owners.
