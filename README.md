# Deen Assist — PWA (capp folder)

A no-build, installable mobile web app (PWA) for Deen Assist, with Firebase
Authentication for sign-up/sign-in (replacing the previous MS Entra ID
flow). Works on Android (Chrome: "Install app") and iPhone (Safari:
Share → "Add to Home Screen"). No app store, no fees.

## What's included

```
capp/
├── index.html            ← auth screen + app shell (chatbot + 4 feature screens + nav)
├── manifest.json          ← PWA install config (name, icons, colors)
├── sw.js                  ← service worker (offline caching)
├── css/style.css          ← styling incl. dark mode + auth screen
├── js/
│   ├── firebase-config.js  ← YOUR Firebase project keys go here
│   ├── auth.js             ← sign-up / sign-in / sign-out / Google auth
│   └── app.js              ← all feature logic (nav, prayer times, qibla, etc.)
└── icons/                  ← Deen Assist logo, all required sizes
```

## 1. Set up Firebase (free)

1. Go to https://console.firebase.google.com → **Add project** (free, no
   card required).
2. In the project: **Project settings → General → Your apps → Add app → Web (`</>`)**.
3. Firebase gives you a config object — copy those values into
   `js/firebase-config.js` (replace the `YOUR_...` placeholders).
4. Go to **Authentication → Sign-in method** and enable:
   - **Email/Password**
   - **Google** (optional, if you want the "Continue with Google" button —
     otherwise you can delete that button from `index.html`)
5. Go to **Authentication → Settings → Authorized domains** and add your
   GitHub Pages domain (e.g. `<username>.github.io`) — Firebase blocks
   auth from domains it doesn't recognize.

That's it — no server, no backend code. Firebase handles password
storage, verification emails, and session tokens for you.

## Teams / Outlook

When the app is opened inside Microsoft Teams (as a tab) or Outlook, it
skips the Firebase sign-in screen and drops straight into a **guest
session** — see `js/host-detect.js`. This is host detection only, not
single sign-on: no Teams/Outlook identity is captured, and bookmarks for
guest sessions are shared per-host rather than per-person.

- **Teams detection is reliable.** Teams hosts every tab (including a
  plain "Website" tab that needs no manifest or app registration — just
  paste the URL) in an iframe and answers the Teams JS SDK handshake.
- **Outlook detection is best-effort.** Outlook has no equivalent
  no-manifest handshake, so this falls back to user-agent sniffing,
  which isn't guaranteed to catch every case.

**If you want real Teams/Outlook single sign-on later** (so users are
identified, not just anonymous guests), that requires infrastructure
this repo doesn't set up for you:
1. An Azure AD app registration exposed for SSO.
2. A Teams app manifest (different from `manifest.json` — Teams-specific
   schema, zipped with icons) declaring that AAD app, sideloaded or
   published into Teams.
3. An Outlook add-in manifest with `WebApplicationInfo`, sideloaded or
   deployed via Centralized Deployment.

Once you have the Azure AD client ID/tenant ID and those manifests
sorted out, `host-detect.js` is the place to swap the guest bypass for a
real `microsoftTeams.authentication` / `Office.context.auth` token
acquisition.

## 2. Chatbot (already wired up)

`index.html` now points at your live Microsoft Copilot Studio bot:
```
https://copilotstudio.microsoft.com/environments/Default-d9cbc7e3-d60b-4059-8ec0-d5319e89f43b/bots/cr43b_dinAssist/webchat?__version__=2
```
Confirmed: this bot's security setting is **"No authentication"**, so it
loads directly for anyone who reaches the app — no second Microsoft
sign-in prompt inside the chat, no conflict with Firebase Auth. Firebase
gates entry to the app; the chatbot just works once they're in.

**Note on the "Save answer" bookmark feature:** `app.js` listens for a
`postMessage` from the chatbot (or a same-origin `window.saveBookmark()`
call) to let users bookmark an answer. Copilot Studio's webchat doesn't
send this automatically — it's a hook for later if you want a "save
this" button inside the bot's responses (would need a custom Copilot
Studio topic/action to trigger it, or you can leave bookmarking as a
manual feature elsewhere). Not required for launch.

## 3. Deploy on GitHub Pages (free)

1. Commit the `capp` folder to your repo.
2. In your repo: **Settings → Pages**.
3. Under "Build and deployment": **Source: Deploy from a branch**.
4. Pick the branch and the `/capp` folder (or rename `capp` to `docs`,
   or push it to a dedicated `gh-pages` branch root, if `/capp` isn't
   offered as a folder option).
5. Save. Your app will be live at:
   `https://<your-username>.github.io/<repo-name>/`

Then add that exact domain to Firebase's **Authorized domains** (step 5 above) —
sign-in will fail with an "unauthorized domain" error until you do.

## 4. Install it on a phone

- **Android (Chrome):** open the URL → menu (⋮) → "Install app" / "Add to Home screen".
- **iPhone (Safari):** open the URL → Share icon → "Add to Home Screen".
  *(Must be Safari — Chrome on iOS can't install PWAs to the home screen.)*

## Notes & known iOS limits

- iOS only supports installing PWAs from **Safari**, not Chrome/Firefox on iOS.
- Background push notifications on iOS PWAs require iOS 16.4+.
- The compass (Qibla screen) requires a permission prompt on iOS 13+; handled in `app.js`.
- Prayer times use the free [Aladhan API](https://aladhan.com/prayer-times-api) (no key needed).
- Google sign-in uses a popup (`signInWithPopup`) — this works fine in an
  installed PWA on Android; on iOS Safari popups can occasionally be
  blocked by default settings, so email/password is the more reliable
  primary option there.

## Features included

1. Firebase sign-up / sign-in / sign-out (email+password and Google)
2. Embedded chatbot (your existing HTML/URL)
3. Prayer times with auto-location + next-prayer countdown
4. Qibla compass direction
5. Dhikr/Tasbih counter with adjustable targets (33 / 99 / 100)
6. Save/bookmark chatbot answers, per user (localStorage, namespaced by Firebase UID)
7. Dark mode toggle (persisted, respects system preference on first load)
8. Offline support via service worker + offline banner
9. Bottom tab navigation between all screens

## Removing the old MS Entra ID code

This scaffold's `js/auth.js` is a full replacement for an Entra ID
sign-in flow — nothing here depends on MSAL or Azure AD. If your
existing repo still has MSAL config, redirect URIs, or Entra
app-registration references elsewhere (e.g. in a different HTML file or
a config file outside this `capp` folder), search for `msal`, `entra`,
or `azure` in that repo and delete those blocks — they're unrelated to
and unused by this new auth flow.

