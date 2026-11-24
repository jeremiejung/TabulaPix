# Developing TabulaPix

***English** · [Français](DEVELOPMENT.fr.md)*

For working on the extension's code: built-in agencies, configuration file format, icon, versions and publication. Using TabulaPix is described in the [README](README.md).

## Repository layout

TabulaPix is a Chrome extension (Manifest V3) in plain HTML/JavaScript: no dependencies, no build step. The `extension/` folder is loaded as is by Chrome.

- `extension/manifest.json`: name, version, permissions.
- `extension/config.js`: built-in agencies (`AGENCIES`), shipped folders (`FOLDERS`) and newsroom options (`OPTIONS`); the fields are described in the comments at the top.
- `extension/popup.html`, `popup.js`, `popup.css`: the interface (popup and side panel), editor and settings included.
- `extension/background.js`: opens the tabs, fills in search fields, locating banner, agency sign-in, tab groups.
- `extension/shared.js`: shared by both (agency checks, edits applied to built-in agencies, configuration file).
- `extension/detect.js`: detection of a search address from a results page, done locally.
- `extension/i18n.js`: interface texts in French and English (same keys in both languages); `extension/_locales/`: name and description shown by Chrome.
- `extension/icons/`: icons (SVG sources and PNG exports).
- `store/`: Chrome Web Store listing materials.
- Documentation, in English and French: `README`, `CHANGELOG` (an **[Unreleased]** heading always at the top), `ROADMAP`, this file; privacy policy in `PRIVACY.md`.

To try a change: load the `extension` folder with **Load unpacked** in `chrome://extensions`, then **↻** on the TabulaPix card after each change.

## Configuration file

The file created by **Export** is plain JSON, readable and editable:

```json
{
  "format": "tabulapix-config",
  "formatVersion": 5,
  "minReaderVersion": 1,
  "exportedAt": "2026-11-06T10:00:00.000Z",
  "app": { "name": "TabulaPix", "version": "3.6.12" },
  "settings": { "language": "auto", "options": { "pixpalaceSubdomain": "www" }, "tabGroups": { "enabled": false, "collapsed": false } },
  "folders": [{ "id": "f-wire", "name": "Wire agencies", "color": "blue" }],
  "agencies": [
    { "id": "reuters", "builtin": true, "name": "Reuters (points)", "folder": "f-wire", "checked": true, "hidden": false },
    { "id": "custom-abc123", "builtin": false, "name": "Alamy", "url": "https://www.alamy.com/search.html?qt={q}", "checked": true, "hidden": false }
  ],
  "removedBuiltins": ["afp-forum"]
}
```

- `agencies` is in list order. Built-in agencies only carry `name`, `url`, `payload`, `encode`, `fill` or `login` when they were edited (`login`: sign-in page, `false` when the shipped one was removed); added agencies always carry their address (and `fill` when they fill in a search field, `login` when they have a sign-in page).
- `settings.tabGroups` (format 5): the tab groups option, exported off when Chrome's permission is not granted. A file without it leaves the option as it is.
- **Import choices** (what and how) are made in TabulaPix, not in the file: the format is the same whatever is imported later.
- **Compatibility between versions**: new versions only *add* optional fields, never change the meaning of an existing one (`formatVersion` goes up). So a newer TabulaPix reads older files (missing fields get their default value), and an older TabulaPix reads newer files, ignoring what it doesn't know yet (the import summary says so; built-in agencies it doesn't know are counted separately). Only an incompatible change, to be avoided, would raise `minReaderVersion`: an older TabulaPix then refuses the file and asks for an update.
- **Folders** (`folders: [{ "id", "name", "color", "collapsed", "hidden" }]`, and a `folder` field on each agency) are exported and imported with the rest, including each folder's colour (`blue`, `teal`, `green`, `amber`, `orange`, `red`, `pink`, `violet`, `gray`) whether it is folded and whether it is hidden. A folder's checkbox is not stored: it is derived from its agencies.

## Editing the built-in agencies

Everything is in **`extension/config.js`**. Each agency has a name and an address where the keyword is replaced by `{q}`:

```js
{
  id: "getty-actu",
  name: "Getty Actu",
  url: "https://www.gettyimages.fr/search/2/image?family=editorial&phrase={q}"
}
```

Optional fields:

- `defaultChecked: false`: unticked on a first install. `defaultHidden: true`: hidden (to be shown with its eye in Organise mode), applied the first time the agency appears, including on an update (AFP (forum), Reuters (standard)).
- `folder`: its folder, among those declared in `FOLDERS` (fixed `id`, French and English names, colour). The shipped folders are created on a first install (or for a user who has no folder yet); after that, folders belong to the user: an update never creates, renames or deletes one.
- `login`: its sign-in page (the **Sign in** icon) and, with it, `loggedOutTitle`: the exact tab title when a search is shown without a session (Sipa: `Sipa Press`). TabulaPix then opens the sign-in page in that tab and runs the search again once the user is signed in.

A new built-in agency goes into its folder if the user still has it (even renamed), otherwise outside any folder; for existing users it arrives unticked, at the end of the list, with a “New” badge for five openings (until it is ticked or moved). If a user had already added the same agency by hand (same address, parameters included apart from the keywords, or same site and same name), their own is kept and the built-in one is set aside like a deleted agency (**Restore** in the settings brings it back). An import keeps the file as it is.

Tip for finding the address: run a search on the site with easy-to-spot words (e.g. `midterms texas democrats`), copy the URL of the results page and replace the words with `{q}`. Depending on the site, spaces appear as `%20` or `+`: replace the whole thing, separators included.

Newsroom-specific values are not hard-coded: they go through an option, inserted in the address with `{opt:name}` (see `OPTIONS` at the bottom of `config.js`).

Some sites (AFP news, Sipa, Rea, AgencesONline, Gamma-Rapho) “wrap” the search in the URL (hexadecimal, or gzip + base64). For them, the content is described in `payload` and the encoding steps in `encode` — see the comments at the top of `config.js`.

For sites whose address cannot contain the search, the field to fill in and the button to click are given instead (`fill`), as CSS selectors. Such a site needs Chrome's permission, which the user grants on demand: a “to allow” badge appears when the agency is ticked. Don't add it to `host_permissions` in `extension/manifest.json`: Chrome would announce it on installation, and adding one disables the extension for existing users until they accept it.

After any change: `chrome://extensions` → **↻** (reload) button on TabulaPix.

## Icon

A text cursor in a rounded frame with a white background (readable in dark mode), with a red magnifying glass at the bottom right. Sources in `extension/icons/`: `icon.svg` (32 to 128 px) and `icon-16.svg`, a simplified version drawn for 16 px. The PNGs `icon-16/32/48/128.png` are their actual-size exports. To change the icon, edit the SVGs and export them again at the same sizes, on a transparent background.

## Version numbers

The version number (`version` in `extension/manifest.json`) **only changes when submitting to the Chrome Web Store**, once per submission, however many changes were merged in between:

- **fix or improvement**: last digit (3.2.0 → 3.2.1);
- **new feature**: middle digit (3.2.x → 3.3.0);
- **major change**: first digit.

The store refuses a number lower than or equal to the published version: there is no going back.

The version history is kept in [`CHANGELOG.md`](CHANGELOG.md).

## Chrome Web Store

The listing materials (descriptions, permission justifications, review instructions) are in [`store/fiche-chrome-web-store.md`](store/fiche-chrome-web-store.md) (in French, with the English texts to paste), the screenshots and promotional images in [`store/images/`](store/images/), and the privacy policy in [`PRIVACY.md`](PRIVACY.md). Never name agencies in the store descriptions.

## Releasing a version

1. Choose the number (see “Version numbers”) and set it in `extension/manifest.json`.
2. In `CHANGELOG.md` and `CHANGELOG.fr.md`, add the version heading (number, date, “Chrome Web Store”) under **[Unreleased]**, which stays at the top, empty.
3. Update the version in the configuration file example (“Configuration file” above) and the package name in `store/fiche-chrome-web-store.md`.
4. Build the package from the `extension` folder, without the SVG sources (15 files):

   ```bash
   cd extension && zip -q -X -D -r ../TabulaPix-X.Y.Z.zip . -x '*.svg'
   ```

   The `.zip` files are ignored by git (`.gitignore`).
5. Load the extracted package in Chrome and try it, then send it to the Chrome Web Store. If the permissions changed, update their justifications in the developer console (texts in the store listing file).
6. On GitHub, publish a release `vX.Y.Z` with the package attached.
