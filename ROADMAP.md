# Ideas for TabulaPix

***English** · [Français](ROADMAP.fr.md)*

Directions considered for future versions, with what has already been decided. Nothing is scheduled yet.

---

## 1. Send an agency to a colleague (copy / paste)

**Need.** Paul has added the Magnum agency; Alice doesn't have it. He wants to send it to her without an account or a server.

**Chosen approach.**
- In an agency's pencil, a **Share** button copies a short code (e.g. `TabulaPix:agency:eyJu…`) holding the agency: name, address, template, encoding steps or field to fill in.
- Paul pastes this code into Slack, Teams or an e-mail. The newsroom's messaging is the transport: TabulaPix still makes no network request.
- On Alice's side, **+ Add an agency** recognises the code (clipboard or paste) and offers “Add Magnum?”. The agency is checked like one added by hand; if it fills in a field, Chrome asks for permission for its site.

**Extensions.**
- Share a **whole folder** (e.g. “Celebrity” and its agencies).
- Import in **“add”** mode rather than “replace”: get a file's agencies and folders without losing one's own.

**Ruled out.** Automatic discovery of TabulaPix instances on the same network: impossible without a server (an extension can't see the local network), and against the “no server, no network request” promise. For a whole newsroom, a configuration pushed by IT (Chrome Enterprise) remains possible.

---

## 2. Encrypted vault for agency credentials (optional)

**Need.** In many photo desks, the credentials of agency accounts (often shared) circulate **in plain text** in a spreadsheet or a Drive document open to the whole desk. An encrypted vault in TabulaPix would be a real improvement, provided it also solves **sharing** within the team.

**First version considered (no automatic sign-in).**
- In an agency's pencil, an optional **Credentials** section (login, password).
- In the list: **Copy login** / **Copy password**; the clipboard is cleared after 30 seconds. No page filling at first.
- **Encryption**: AES-GCM (WebCrypto, built into Chrome), key derived from a **passphrase** with PBKDF2-SHA-256 (600,000 iterations or more) and a random salt. Only ciphertext is stored; the passphrase never is.
- **Unlock** once per session, automatic lock (e.g. after 15 minutes, or when Chrome closes).
- **Team vault**: the desk lead exports the credentials to a file that is **always encrypted** with a team passphrase, passed on separately (never with the file). Each colleague imports and unlocks it. The usual configuration file never contains credentials.
- No extra permission, nothing goes over the network.

**Limits to state clearly.**
- Forgotten passphrase: unreadable vault, no recovery possible.
- Anyone with the file **and** the passphrase has every account (as with the spreadsheet today — but the file alone is no longer enough). When a team member leaves: change the passphrase and the passwords.
- TabulaPix is not audited like a professional password manager.

**To plan for.**
- Declare the handling of “authentication information” to the Chrome Web Store; update the listing (“no password stored **in plain text**, nor sent”) and the privacy policy.
- A dedicated security audit before release; a dedicated version (e.g. 3.6.0).

**Proven alternative to mention to users.** KeePassXC (free, audited) with a `.kdbx` file on the desk's Drive: same principle, if the newsroom accepts installing software.
