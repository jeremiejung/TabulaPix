# TabulaPix

***English** · [Français](README.fr.md)*

**One search, all your picture agencies.**

**[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/gdggcpmgjoaobfjlnbfmgfnjfgodgikp)** · website: [tabulapix.com](https://tabulapix.com/en/)

Chrome extension for photo desks, picture researchers and photo editors: type your keywords once and search all your news picture agencies at the same time. TabulaPix opens one tab per agency with the results ready, using your own logged-in accounts. No scraping, no API keys, no passwords stored. Interface in English and French.

Everything is set up from the extension itself (**Organise** mode and **⚙** settings), without editing any file: agencies shown, order, folders, agencies added with automatic detection, editable addresses and field locations, language, Pixpalace subdomain. Ticked agencies and their order are remembered between uses.

Chrome extension (Manifest V3) in plain HTML/JavaScript: no dependencies, no build step. To work on the code: [`DEVELOPMENT.md`](DEVELOPMENT.md).

## Installation

[Install TabulaPix from the Chrome Web Store](https://chromewebstore.google.com/detail/gdggcpmgjoaobfjlnbfmgfnjfgodgikp), then pin the extension (puzzle icon 🧩 → pin next to **TabulaPix**). Updates then arrive automatically.

> If you have been using the version loaded from a folder, Chrome treats the store version as a different extension: your settings are not carried over automatically. In the old version, **⚙ › Export**; install the store version and **⚙ › Import…** that file; then remove the old version in `chrome://extensions` so that you don't have TabulaPix twice.

**Manual installation** (development version, from this repository):

1. Download this repository (**Code → Download ZIP** on GitHub) and unzip it, or clone it with `git clone`.
2. In Chrome, open `chrome://extensions`.
3. Turn on **Developer mode** (switch at the top right).
4. Click **Load unpacked** and choose the repository's `extension` folder.
5. Pin the extension: puzzle icon 🧩 in the toolbar → pin next to **TabulaPix**.
6. Adjust your **settings** (⚙ button in the popup), in particular the subdomain of your Pixpalace space (see “Settings” below).

> **Do not move, rename or delete the folder after installing.** Chrome reads the extension directly from that folder: if it moves, the extension no longer loads (it is disabled, with an error in `chrome://extensions`).
> So choose a lasting location before installing (for example `Documents/TabulaPix`), not the Downloads folder or the Desktop.
> If the folder was moved: remove TabulaPix in `chrome://extensions`, then repeat step 4 choosing the `extension` folder in its new location. Chrome then treats it as a new extension, with the shipped settings: **Import** your last export to get yours back (hence the interest of exporting from time to time).

## Updating a manual installation

(The Chrome Web Store version updates itself.)

1. Download the new version (**Code → Download ZIP**) and unzip it.
2. Copy the **contents** of its `extension` folder into the `extension` folder already installed, replacing the existing files. Keep the same folder, in the same place: this is what keeps your ticked agencies and their order.
3. In `chrome://extensions`, click the **↻** (reload) button on the TabulaPix card.
4. If Chrome shows a warning about new permissions, accept it: the “Privacy” section below explains each of them.

If you installed with `git clone`: `git pull` in the repository folder, then **↻** in `chrome://extensions`.

If you had edited `config.js` (see [`DEVELOPMENT.md`](DEVELOPMENT.md)), note your changes before replacing the files, then copy them into the new `config.js`.

## Usage

1. Click the TabulaPix icon, or press **Alt + Shift + Y** (shortcut changeable in `chrome://extensions/shortcuts`).
2. Type your keywords and tick the agencies you want (**All** / **None** buttons to go faster).
   **Folders** group agencies, each in its own colour. On installation, the agencies come sorted into six folders: News, Documentary, Aggregators, Celebrity, Stock and Archives (some agencies of News, Documentary and Aggregators are ticked); they are yours to rename, recolour, reorder or delete (as long as they keep their shipped name, they follow the interface language). A folder's checkbox ticks or unticks all its agencies at once; it is half-ticked when only some of them are ticked (the counter shows how many). A click on a folder's title (or on **›**) folds or unfolds it, without ticking anything. Tabs open in the order of the list.

   **Reorder at any time**: hovering over an agency or a folder shows its handle (on the right); drag it between two agencies, or onto a folder's title (highlighted) to put an agency there; near the bottom of the window or over the top of it, the list scrolls by itself. With the keyboard, **Alt + ↑ / ↓** on a checkbox does the same.
3. Press **Enter** or **Search**, right under the keywords: one tab opens per agency (the button shows how many). The keywords, this button and the buttons above them stay at the top while the list scrolls.
   Tabs open in the background: you stay on the tab you are on.
   Your last keywords are shown again (already selected) the next time you open TabulaPix: just type to replace them.
   An agency arriving with an update shows a **New** badge for a few openings.
   If a tab is already open on an agency's site (for example after a previous search), it is reused: the new search shows there instead of opening one more tab. This also works when the site sent that tab to its login page, on another address, right after TabulaPix opened it (sign in there, or search again: the same tab is used).

**Keep open:** the **column** button (first icon at the top of the popup) shows TabulaPix in a column on the right of the window (Chrome's side panel, version 116 or later). The column stays open when you switch tabs, so you can chain searches without reopening the extension; after each search, a discreet line says how many were started. While the column is open, the TabulaPix icon in the toolbar acts on the column (it doesn't open a popup on top of it); once the column is closed, the icon opens the popup again. To close it: the cross at the top of the column. It can also be reopened from Chrome's side panel icon.

For some agencies (Bloomberg, Abacapress, Pixpalace, Hans Lucas, Magnum, Myop, Signatures, Vu', Bestimage, Bureau 233, Phototélé, Starface), the address cannot contain the search: the extension opens the page, types your keywords into the search field and clicks the button for you (allow a second or two more). Chrome asks once for permission for the site: when you tick such an agency, a “to allow” badge and a banner offer to allow it. So they arrive unticked on installation, and until their site is allowed, a search opens no tab for them (the button doesn't count them; in the side panel, the line confirming the search names them).

If an agency added later has neither an address with `{q}` nor automatic field filling, it is marked **“paste”**: the page opens and your keywords are copied to the clipboard; just press **Ctrl+V** (or **Cmd+V**) in the search field.

You need to be logged in to your agency accounts in Chrome, as usual: the extension only opens tabs. For agencies with a sign-in page (Sipa as shipped), hovering the agency also shows a **Sign in** icon, next to the handle: it opens the sign-in page in the agency's tab (or a new one), and that tab's last search runs again once you are signed in. Sipa shows a black page when a search arrives without a session: TabulaPix recognises it from the tab's title, opens the sign-in page in its place and runs the search again after you sign in.

## Organise mode

The **Organise** button at the top (list icon; spelled out in the side panel, like **Settings**) switches to **Organise** mode, where agencies and folders are arranged, renamed, hidden, edited and deleted, right in the list. **Esc** or **Done** leaves it; searching is paused meanwhile. A row's tools (pencil, bin, eye) appear on hover or when the row has keyboard focus; the crossed-out eye of a hidden agency or folder always stays visible.

- **Order and folders**: as outside this mode: drag an agency by its handle (on the right) between two agencies, or onto a folder's title (highlighted) to put it there; drag a folder by its handle to reorder folders. A drag cancelled with Esc changes nothing. With the keyboard, **Alt + ↑ / ↓** on an agency's checkbox moves it (and into the next folder at the edge), on a folder's checkbox moves the folder.
- **Folders**: rename a folder right in its title, change its colour with its dot, hide it with its **eye** (the folder and its agencies disappear from the list and are never searched; their ticks are kept for when you show it again), delete it with the bin (its agencies are kept, outside any folder; **Undo** for fifteen seconds), create one at the bottom of the list. A folder whose agencies are all hidden doesn't show in normal use either; hidden folders appear greyed out in Organise mode only.
- **Agencies**: rename an agency right in its name (a field frame appears on hover), like a folder: **Enter** or leaving the field saves, **Esc** cancels; for a built-in agency, **Restore the original** in its pencil brings back the shipped name. Then, on each line (from left to right, before the handle: pencil, bin, eye):
  - **eye**: hides the agency (it disappears from the list, its place is kept) or shows it again; it shows the state (open: shown, crossed out: hidden), its tooltip says what a click does; hidden agencies appear greyed out in Organise mode only.
    - **Reuters** comes in two versions, depending on your contract: **Reuters (points)** for credit-based accounts (shows your points balance), shown by default, and **Reuters (standard)** for accounts without points (free download), hidden by default: show the one that matches your account with its eye. **AFP (forum)** is also hidden by default.
  - **pencil**: edits the agency (see below);
  - **bin**: deletes any agency, built-in ones included, at once; an **Undo** line takes its place for fifteen seconds (deleted built-in agencies can also be brought back later in ⚙ with **Restore**).
- **+ Add an agency**, at the bottom of the list (also outside Organise mode), opens the add screen (**← Back** returns to the list).

### Sharing an agency or a folder

To send an agency or a whole folder to a colleague, with no account and no server: the newsroom's messaging (Slack, Teams, e-mail) carries it.

- **Send**: outside Organise mode, hovering an added or edited agency, or a folder's title, shows a paper-plane icon (or, in an agency's pencil, the **Share** button). TabulaPix copies a short code (`TabulaPix:1:…`) holding the agency, or the folder (name, colour) and its agencies shown: address, template, located field, sign-in page — never your ticks, settings or searches. Built-in agencies are only shared when you edited them (otherwise your colleague already has them); in a folder, they are just listed, to be filed there.
- **Receive**: paste the code into **+ Add an agency** (first field), into the keywords field (the **Share code** screen then opens by itself) or into **⚙ › Backup and sharing › Paste a share code**. TabulaPix says what the code contains (e.g. “Folder “Celebrity” and its 4 agencies: …”) and what will happen, with names, with nothing to choose: **Add** or **Cancel**, or a single **Back to the list** button if you already have everything. In detail: what you are missing arrives ticked, a folder of the same name is reused; what you already have stays as it is (a built-in agency you haven't edited takes your colleague's settings). Every agency is checked like one added by hand; if it fills in a field, Chrome asks for permission for its site.

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

- **Edit an agency** (its pencil): the same screen, straight at the form (name, folder, address), with **Save**. If the site has changed, **Detect the address again from the site** (folded, at the bottom) runs the detection again from a results page; for an added agency that fills in a field, its located field is kept if the keywords still aren't in the address. Every agency can be renamed, built-in ones included; for built-in agencies, **Restore the original** goes back to the shipped name and settings. **Technical details › Sign-in page** (optional) sets the page opened by the **Sign in** icon; empty it to remove the icon.
  - **Built-in agencies that fill in a search field** (Bloomberg, Abacapress, Pixpalace, Magnum…): if one of them changes its page and the search no longer starts, open its pencil then **Locate again** to show it the field and button again (Bloomberg's specific delay is kept). Like any agency, they can also be detected again, switched to a search address (**Use a search address instead**) or moved to another site (the field is then located again there, with Chrome's permission for that site); **Restore the original** brings back the shipped behaviour.

## Settings

The **⚙** button at the top shows the settings right in the popup; **← Back** (or Esc) returns to the search. There is no Save button: each setting is saved as soon as you leave the field or press Enter, with a short “✓ Saved” next to it.

- **Needs attention** (at the top, only when needed): lists the ticked agencies whose site Chrome has not allowed yet, with an **Allow these sites** button.
- **Language**: English or French. By default, TabulaPix follows the browser language (“Automatic”); the change applies immediately. The name and description shown in `chrome://extensions` and on the Chrome Web Store always follow the browser language.
- **Pixpalace** › **Subdomain**: the part before `.pixpalace.com` in the address of your Pixpalace space (`www` by default). For example, for `https://mynewsroom.pixpalace.com/home`, type `mynewsroom`: Chrome then asks for permission for that address (“to allow” badge). An invalid value is reported under the field and not saved.
- **Quick access**: shows the keyboard shortcut that opens TabulaPix (Alt + Shift + Y by default), with a link to change it, and reminds you that the column button keeps TabulaPix open beside the page.
- **Tabs**: **Open tabs in groups, one per folder** (off by default) puts each folder's tabs in a Chrome tab group with the folder's name and colour (agencies outside folders stay ungrouped). Chrome asks for permission when you turn it on; turning it off gives the permission back. A later search reuses the folder's group if it is still open, even renamed, and keeps it as you left it: a group you collapsed stays collapsed (its tabs still load). **Collapse the groups after the search** folds them all.
- **Backup and sharing**: to keep your configuration after a reinstall, or share it with colleagues.
  - **Export** saves it to a `.json` file: agencies and their order, folders, names, addresses, field locations, sign-in pages, ticked, hidden and deleted agencies, language, Pixpalace subdomain, tab groups — never your searches. Its format is described in [`DEVELOPMENT.md`](DEVELOPMENT.md#configuration-file).
  - **Import…** loads such a file. Before anything changes, you choose:
    - **what** to import: **Agencies** (added agencies, edited or deleted built-in agencies, order), **Ticked boxes and hidden agencies**, **Folders** (with their colours and which agency goes where), **Settings** (language, Pixpalace subdomain and tab groups, each of which can be unticked). Next to each one, TabulaPix shows what it will change in your configuration (e.g. “to add: 2 (Magnum, Myop) · already there: 29”, “Language: English → French”); when nothing would change, the button stays disabled;
    - **how**: **Replace** — what you tick replaces yours, the rest of your configuration doesn't change (with **Agencies** ticked, your agencies take the file's settings — address, located field… — and those you changed are named before you confirm) (everything ticked: the file entirely replaces your configuration, e.g. after a reinstall); or **Add** — only what you are missing is added, nothing of yours is removed or changed: the file's added agencies you don't have yet (those you already have, same address or same site and name, are kept as they are), the built-in agencies you deleted and the file still has, its folders you don't have (same name), and your agencies outside any folder go into the folder the file gives them. Ideal for getting a colleague's agencies. **Add** is selected by default.

    Every agency is checked like an agency added by hand; invalid ones are ignored. From the popup, Import opens TabulaPix in a tab (Chrome closes the popup when a file picker opens).
  - Sites to allow: if the file contains agencies that fill in their site's search field, TabulaPix asks Chrome for those sites right away when it can; otherwise the banner, the “to allow” badges and **Needs attention** let you allow them at any time.
- **Agencies removed from the list**: names the deleted built-in agencies; **Restore** brings them back (shown only when there are some).
- **Factory settings**: **Restore factory settings** erases your settings, your added, edited or deleted agencies and the site permissions you granted, and goes back to the shipped configuration (after confirmation; export first if you want to keep yours).

These settings stay in Chrome on your computer and are kept across updates.

## Privacy

- No data collection, no passwords, no account.
- No network calls: the extension only opens tabs (its security policy forbids any request: `connect-src 'none'`).
- The only data stored: ticked agencies, their order, folders, hidden, edited or added agencies (with their sign-in page), the last search and your settings, stored locally in Chrome (`chrome.storage.local`), never transmitted. Only the last search is kept (no history); it disappears when the extension is uninstalled.
- For the browser session only (`chrome.storage.session`, erased when Chrome closes): which tabs belong to which agency, and the search to run again after signing in.
- Permissions requested:
  - `storage`: remember your ticks and settings;
  - `sidePanel`: show TabulaPix in the right-hand column;
  - `tabs`: see the addresses of open tabs, to reuse an agency's tab that is already open instead of opening a new one, and the title of an agency's tab to recognise a page shown without a session (Sipa). Nothing is stored beyond the browser session, nothing is transmitted. For this, Chrome shows the “Read your browsing history” warning;
  - `tabGroups` (optional): put the tabs of each folder in a named tab group. Requested only when you turn on the “Tabs” option (Chrome then shows “View and manage your tab groups”), given back when you turn it off;
  - `scripting` + access to a site, requested one site at a time (Chrome prompt) only for agencies whose search field must be filled in (Bloomberg, Abacapress, Pixpalace, Magnum…, or an agency you add), and removed when you delete it: only to type the keywords into that site's search field and click the button. The extension reads nothing else on these pages.
  - Copying the keywords for “paste” sites needs no permission: it happens when you click **Search**.

On installation, Chrome therefore only announces “Read your browsing history” (`tabs`).

See also the [privacy policy](PRIVACY.md).

## Security

- Built-in agencies come from `config.js`, shipped with the extension, and added agencies from your settings: nothing is downloaded.
- The background script only accepts requests from its own popup, and only opens `https` addresses matching the site declared for each agency (including added agencies, whose address is checked when added and on every read).
- Before filling in a field, it checks that the tab is still on the agency's site.
- Locating a field on an added site: the banner is only shown in the tab opened for that purpose; the result is only accepted from that tab, on that site, and only contains where the field and button are (no page content is read or kept).
- Keywords are inserted as text (never as code) and encoded in addresses.
- Updates: the Chrome Web Store version updates automatically, after Google reviews each version. A manual installation never updates itself: only replace its folder with a version coming from this repository. Protect the GitHub account with two-factor authentication.

## Ideas

Directions considered for future versions (saved selections, an encrypted vault for agency credentials) are listed in [`ROADMAP.md`](ROADMAP.md).

## Development

Repository layout, editing the built-in agencies, configuration file format, icon, version numbers and releases: see [`DEVELOPMENT.md`](DEVELOPMENT.md). The version history is in [`CHANGELOG.md`](CHANGELOG.md).

## License

TabulaPix is released under the **MIT license** (see [`LICENSE`](LICENSE)): you may use, modify and share it freely, provided you keep the author and license notice. The software is provided “as is”, without warranty.

TabulaPix is an independent tool, not affiliated with the agencies mentioned. The names AFP, Reuters, Getty Images, Sipa, Shutterstock, Adobe Stock, Abacapress, Rea, Pixpalace, MaxPPP, Bloomberg and others are trademarks of their respective owners.
