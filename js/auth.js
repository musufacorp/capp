// ============================================================
// Deen Assist — Firebase Authentication
// Replaces the previous MS Entra ID sign-up/sign-in flow.
// Uses the Firebase Web SDK (modular, v10) loaded via CDN in index.html.
// ============================================================

import { firebaseConfig } from "./firebase-config.js";
import { detectHost } from "./host-detect.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ---------- DOM references ----------
const authScreen = document.getElementById("auth-screen");
const appRoot = document.getElementById("app-root");

const signInForm = document.getElementById("signin-form");
const signUpForm = document.getElementById("signup-form");
const showSignUpBtn = document.getElementById("show-signup");
const showSignInBtn = document.getElementById("show-signin");
const googleBtn = document.getElementById("google-signin-btn");
const forgotPasswordBtn = document.getElementById("forgot-password-btn");
const authError = document.getElementById("auth-error");
const signOutBtn = document.getElementById("signout-btn");
const userEmailLabel = document.getElementById("user-email-label");

// ---------- Toggle between sign-in / sign-up forms ----------
showSignUpBtn?.addEventListener("click", () => {
  signInForm.classList.remove("active-form");
  signUpForm.classList.add("active-form");
  clearError();
});

showSignInBtn?.addEventListener("click", () => {
  signUpForm.classList.remove("active-form");
  signInForm.classList.add("active-form");
  clearError();
});

function clearError() {
  authError.textContent = "";
  authError.classList.remove("show");
}

function showError(err) {
  authError.textContent = friendlyAuthError(err);
  authError.classList.add("show");
}

// Firebase error codes are technical — map the common ones to plain language
function friendlyAuthError(err) {
  const code = err?.code || "";
  const map = {
    "auth/email-already-in-use": "That email is already registered — try signing in instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts — please wait a moment and try again.",
    "auth/popup-closed-by-user": "Sign-in popup was closed before completing."
  };
  return map[code] || `Something went wrong (${code || "no error code"}). Please try again.`;
}

// ---------- Sign up ----------
signUpForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const submitBtn = signUpForm.querySelector("button[type=submit]");

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account…";

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
    // onAuthStateChanged below handles the redirect into the app
  } catch (err) {
    showError(err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
});

// ---------- Sign in ----------
signInForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const email = document.getElementById("signin-email").value.trim();
  const password = document.getElementById("signin-password").value;
  const submitBtn = signInForm.querySelector("button[type=submit]");

  submitBtn.disabled = true;
  submitBtn.textContent = "Signing in…";

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    showError(err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign In";
  }
});

// ---------- Google sign-in ----------
googleBtn?.addEventListener("click", async () => {
  clearError();
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    showError(err);
  }
});

// ---------- Forgot password ----------
forgotPasswordBtn?.addEventListener("click", async () => {
  clearError();
  const email = document.getElementById("signin-email").value.trim();
  if (!email) {
    showError({ code: "auth/invalid-email" });
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    authError.textContent = "Password reset email sent — check your inbox.";
    authError.classList.add("show");
    authError.style.color = "var(--color-primary-light)";
  } catch (err) {
    showError(err);
  }
});

// ---------- Sign out ----------
signOutBtn?.addEventListener("click", () => {
  signOut(auth);
});

// ---------- Teams / Outlook guest bypass ----------
// When embedded in Teams or Outlook, skip the Firebase login screen and
// drop straight into a guest session — no real SSO yet (see host-detect.js).
const embeddedHost = await detectHost();

if (embeddedHost) {
  const guestLabel = embeddedHost === "teams" ? "Guest (Microsoft Teams)" : "Guest (Outlook)";
  authScreen.style.display = "none";
  appRoot.style.display = "flex";
  signOutBtn.style.display = "none";
  userEmailLabel.textContent = guestLabel;
  document.dispatchEvent(new CustomEvent("deenassist-auth-ready", {
    detail: { user: { uid: `guest-${embeddedHost}`, displayName: guestLabel, isGuest: true } }
  }));
} else {
  // ---------- Auth state gate ----------
  // This is the core replacement for the old Entra ID flow: show the
  // auth screen until a user is signed in, then reveal the app.
  onAuthStateChanged(auth, (user) => {
    if (user) {
      authScreen.style.display = "none";
      appRoot.style.display = "flex";
      userEmailLabel.textContent = user.displayName || user.email || "";
      document.dispatchEvent(new CustomEvent("deenassist-auth-ready", { detail: { user } }));
    } else {
      authScreen.style.display = "flex";
      appRoot.style.display = "none";
    }
  });
}

// Expose the current user/uid for other modules (e.g. to namespace
// bookmarks per-user instead of just localStorage-for-everyone)
export function getCurrentUser() {
  return auth.currentUser;
}
