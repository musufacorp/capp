// ============================================================
// Firebase project config
// ------------------------------------------------------------
// 1. Go to https://console.firebase.google.com → Add project (free)
// 2. Project settings → General → "Your apps" → Add app → Web (</>) 
// 3. Copy the config object Firebase gives you and paste the values below.
// 4. In the Firebase console: Authentication → Sign-in method →
//    enable "Email/Password" (and "Google" if you want Google sign-in).
// ============================================================

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Note: Firebase web config values are not secret the way an API key
// for a server usually is — they identify your project, not authorize
// access on their own. Security is enforced by Firebase Auth rules and
// Firestore/Storage security rules, not by hiding this file. Still,
// don't commit real production keys to a public repo if you plan to
// add paid backend resources later without rules configured.
