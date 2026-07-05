// ============================================================
// Deen Assist — Microsoft Teams / Outlook host detection
// ------------------------------------------------------------
// This does NOT perform Teams/Outlook single sign-on. Real SSO needs an
// Azure AD app registration plus a Teams app manifest and/or Outlook
// add-in manifest declaring that app (see README "Teams/Outlook SSO"
// section) — none of that exists yet. What this module does instead:
// detect that the page is running inside Teams or Outlook and, if so,
// let the caller skip the Firebase login screen and drop the visitor
// into a guest session. No identity is captured in that case.
//
// Teams detection is reliable: Teams hosts every tab (including plain
// "Website" tabs that need no manifest) in an iframe and answers the
// Teams JS SDK handshake, so `microsoftTeams.app.initialize()` resolving
// is a genuine signal.
//
// Outlook has no equivalent no-manifest handshake — detecting "opened
// inside Outlook" without an add-in manifest is best-effort only
// (user-agent sniffing), not guaranteed.
// ============================================================

const TEAMS_SDK_URL = "https://res.cdn.office.net/teams-js/2.19.0/js/MicrosoftTeams.min.js";
const TEAMS_INIT_TIMEOUT_MS = 1500;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function detectTeams() {
  if (window.self === window.top) return false; // Teams always hosts tabs in an iframe
  try {
    await loadScript(TEAMS_SDK_URL);
    await Promise.race([
      window.microsoftTeams.app.initialize(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), TEAMS_INIT_TIMEOUT_MS))
    ]);
    return true;
  } catch {
    return false;
  }
}

function detectOutlookHeuristic() {
  const ua = navigator.userAgent || "";
  return /\bOutlook\b/i.test(ua) || (window.self !== window.top && /outlook/i.test(document.referrer));
}

// Resolves to "teams", "outlook", or null (normal browser/PWA).
export async function detectHost() {
  if (await detectTeams()) return "teams";
  if (detectOutlookHeuristic()) return "outlook";
  return null;
}
