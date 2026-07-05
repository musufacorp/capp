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
  apiKey: "AIzaSyDM8SWz91wj8KcmT4FUN9iKpCCtUh-eQdg",
  authDomain: "capp-deenassist.firebaseapp.com",
  projectId: "capp-deenassist",
  storageBucket: "capp-deenassist.firebasestorage.app",
  messagingSenderId: "165100237312",
  appId: "1:165100237312:web:1cbd2bb5558897c6431ee5",
  measurementId: "G-7G3KVDFQS6"
};

// Note: Firebase web config values are not secret the way an API key
// for a server usually is — they identify your project, not authorize
// access on their own. Security is enforced by Firebase Auth rules and
// Firestore/Storage security rules, not by hiding this file. Still,
// don't commit real production keys to a public repo if you plan to
// add paid backend resources later without rules configured.
