# Ideas for TabulaPix

***English** · [Français](ROADMAP.fr.md)*

Directions considered for future versions, with what has already been decided. Nothing is scheduled yet.

---

## 1. Encrypted vault for agency credentials (optional)

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
- A dedicated security audit before release; a dedicated version (e.g. 3.8.0).

**Proven alternative to mention to users.** KeePassXC (free, audited) with a `.kdbx` file on the desk's Drive: same principle, if the newsroom accepts installing software.

## 2. Usability: leads from the 3.7.1 critique

Found during the interface critique (November 2026), too broad for a fix release.

- **Lighter Organise mode in the side panel.** The tools (pencil, bin, eye) are shown on every row all the time. Lead: show them on hover or focus, as in the popup, keeping a hidden agency's eye visible (it is a state), and give the eye icon a single meaning.
- **Saved selections.** Sets of agencies or folders per beat (e.g. “News only”, “Celebrity + Aggregators”), recalled in one click instead of re-ticking.
- **Confirmation after a search in the side panel.** The popup closes; the side panel stays open without a word. Lead: a discreet “11 tabs opened” line, with the names of skipped agencies if any.
