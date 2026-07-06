// ============================================================
// Deen Assist — app.js
// Vanilla JS, no build step. Works alongside your existing
// chatbot embed and any backend/auth you add later.
// ============================================================

// ---------- Service Worker registration ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}

// ---------- Chatbot: load the iframe only when the user launches it ----------
// Avoids starting a Copilot Studio session (and its compute cost) for every
// visitor who opens the app, when many just want prayer times, Quran, etc.
document.getElementById("launch-chat-btn").addEventListener("click", () => {
  const frame = document.getElementById("chatbot-frame");
  if (!frame.src) frame.src = frame.dataset.src;
  document.getElementById("chat-welcome-view").style.display = "none";
  frame.style.display = "block";
});

// ---------- Bottom nav / screen switching ----------
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");
const headerTitle = document.getElementById("header-title");

const screenTitles = {
  chat: "Deen Assist",
  prayer: "Prayer Times",
  quran: "Digital Quran",
  qibla: "Qibla Direction",
  more: "More",
  tasbih: "Dhikr Counter",
  bookmarks: "Saved Answers",
  hadith: "Hadith",
  names: "99 Names of Allah",
  duas: "Duas",
  zakat: "Zakat Calculator",
  calendar: "Hijri Calendar"
};

// Screens reachable only via the "More" hub keep the More nav button highlighted
const MORE_HUB_SCREENS = new Set(["more", "tasbih", "bookmarks", "hadith", "names", "duas", "zakat", "calendar"]);

let quranLoaded = false;
let hadithLoaded = false;
let namesLoaded = false;
let duasLoaded = false;
let calendarLoaded = false;

function goToScreen(target) {
  screens.forEach((s) => s.classList.remove("active"));
  document.getElementById(`screen-${target}`).classList.add("active");

  navButtons.forEach((b) => b.classList.remove("active"));
  const activeNavTarget = MORE_HUB_SCREENS.has(target) ? "more" : target;
  const activeNavBtn = document.querySelector(`.nav-btn[data-screen="${activeNavTarget}"]`);
  if (activeNavBtn) activeNavBtn.classList.add("active");

  headerTitle.textContent = screenTitles[target] || "Deen Assist";

  // Lazy-load data the first time a screen is opened
  if (target === "prayer" && !prayerLoaded) loadPrayerTimes();
  if (target === "quran" && !quranLoaded) {
    quranLoaded = true;
    window.initQuran && window.initQuran();
  }
  if (target === "hadith" && !hadithLoaded) {
    hadithLoaded = true;
    window.initHadith && window.initHadith();
  }
  if (target === "names" && !namesLoaded) {
    namesLoaded = true;
    window.initNames && window.initNames();
  }
  if (target === "duas" && !duasLoaded) {
    duasLoaded = true;
    window.initDuas && window.initDuas();
  }
  if (target === "calendar" && !calendarLoaded) {
    calendarLoaded = true;
    window.initHijriCalendar && window.initHijriCalendar();
  }
  if (target === "bookmarks") renderBookmarks();
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => goToScreen(btn.dataset.screen));
});

document.querySelectorAll(".more-tile").forEach((tile) => {
  tile.addEventListener("click", () => goToScreen(tile.dataset.screen));
});

document.querySelectorAll(".back-to-more-btn").forEach((btn) => {
  btn.addEventListener("click", () => goToScreen(btn.dataset.backTo));
});

// ---------- Dark mode toggle (persisted) ----------
const themeToggleBtn = document.getElementById("theme-toggle");
const body = document.body;

function applyTheme(theme) {
  body.setAttribute("data-theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("deenassist-theme", theme);
}

(function initTheme() {
  const saved = localStorage.getItem("deenassist-theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
})();

themeToggleBtn.addEventListener("click", () => {
  const current = body.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

// ---------- Offline banner ----------
const offlineBanner = document.getElementById("offline-banner");
function updateOnlineStatus() {
  offlineBanner.classList.toggle("show", !navigator.onLine);
}
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
updateOnlineStatus();

// ============================================================
// PRAYER TIMES — uses the free Aladhan API (no key required)
// https://aladhan.com/prayer-times-api
// ============================================================
let prayerLoaded = false;

function loadPrayerTimes() {
  const listEl = document.getElementById("prayer-list");
  const locEl = document.getElementById("prayer-location");

  if (!navigator.geolocation) {
    locEl.textContent = "Location not supported on this device.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
        const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2`;

        const res = await fetch(url);
        const data = await res.json();
        const t = data.data.timings;

        const prayers = [
          ["Fajr", t.Fajr],
          ["Dhuhr", t.Dhuhr],
          ["Asr", t.Asr],
          ["Maghrib", t.Maghrib],
          ["Isha", t.Isha]
        ];

        const nowMinutes = today.getHours() * 60 + today.getMinutes();
        let nextIndex = prayers.findIndex(([, time]) => toMinutes(time) > nowMinutes);
        if (nextIndex === -1) nextIndex = 0; // after Isha, next is tomorrow's Fajr

        listEl.innerHTML = prayers
          .map(([name, time], i) => `<li class="${i === nextIndex ? "next" : ""}">${name}<span>${formatTime(time)}</span></li>`)
          .join("");

        locEl.textContent = `${data.data.meta.timezone} · ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

        document.getElementById("prayer-countdown").textContent =
          `Next: ${prayers[nextIndex][0]} at ${formatTime(prayers[nextIndex][1])}`;

        prayerLoaded = true;
      } catch (err) {
        listEl.innerHTML = "<li>Unable to load prayer times. Check your connection.</li>";
      }
    },
    () => {
      locEl.textContent = "Location permission denied. Enable it in device settings to see accurate prayer times.";
    }
  );
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// ============================================================
// QIBLA DIRECTION — great-circle bearing to the Kaaba,
// combined with device compass heading
// ============================================================
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

let qiblaBearing = null;

function calculateQiblaBearing(lat, lng) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;

  const phiK = toRad(KAABA_LAT);
  const lambdaK = toRad(KAABA_LNG);
  const phi = toRad(lat);
  const lambda = toRad(lng);

  const psi =
    (180 / Math.PI) *
    Math.atan2(
      Math.sin(lambdaK - lambda),
      Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
    );

  return (psi + 360) % 360;
}

document.getElementById("qibla-enable").addEventListener("click", async () => {
  const statusEl = document.getElementById("qibla-status");

  // iOS 13+ requires explicit permission for device orientation
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") {
        statusEl.textContent = "Compass permission denied.";
        return;
      }
    } catch (err) {
      statusEl.textContent = "Compass not available on this device.";
      return;
    }
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      qiblaBearing = calculateQiblaBearing(pos.coords.latitude, pos.coords.longitude);
      statusEl.textContent = `Qibla is ${Math.round(qiblaBearing)}° from North. Rotate until the marker points up.`;
      window.addEventListener("deviceorientationabsolute", handleOrientation, true);
      window.addEventListener("deviceorientation", handleOrientation, true);
    },
    () => {
      statusEl.textContent = "Location permission denied.";
    }
  );
});

function handleOrientation(event) {
  if (qiblaBearing === null) return;
  const heading = event.webkitCompassHeading || (360 - event.alpha) || 0;
  const rotation = qiblaBearing - heading;
  document.getElementById("qibla-needle").style.transform = `translateX(-50%) rotate(${rotation}deg)`;
}

// ============================================================
// DHIKR / TASBIH COUNTER — persisted in localStorage
// ============================================================
const tasbihCountEl = document.getElementById("tasbih-count");
const tasbihTargetLabel = document.getElementById("tasbih-target-label");
const targets = [33, 99, 100];
let tasbihCount = parseInt(localStorage.getItem("deenassist-tasbih-count") || "0", 10);
let targetIndex = targets.indexOf(parseInt(localStorage.getItem("deenassist-tasbih-target") || "33", 10));
if (targetIndex === -1) targetIndex = 0;

function renderTasbih() {
  tasbihCountEl.textContent = tasbihCount;
  tasbihTargetLabel.textContent = `Target: ${targets[targetIndex]}`;
}
renderTasbih();

document.getElementById("tasbih-tap").addEventListener("click", () => {
  tasbihCount++;
  if (tasbihCount === targets[targetIndex] && navigator.vibrate) {
    navigator.vibrate(200); // gentle haptic when target reached
  }
  localStorage.setItem("deenassist-tasbih-count", tasbihCount);
  renderTasbih();
});

document.getElementById("tasbih-reset").addEventListener("click", () => {
  tasbihCount = 0;
  localStorage.setItem("deenassist-tasbih-count", 0);
  renderTasbih();
});

document.getElementById("tasbih-target-cycle").addEventListener("click", () => {
  targetIndex = (targetIndex + 1) % targets.length;
  localStorage.setItem("deenassist-tasbih-target", targets[targetIndex]);
  renderTasbih();
});

// ============================================================
// BOOKMARKS — save chatbot answers for later
// Namespaced per signed-in user (falls back to a shared key if,
// for some reason, this loads before auth.js sets a user).
// Call window.saveBookmark("some text") from your chatbot embed
// (e.g. from a "Save" button inside the chatbot iframe/postMessage)
// ============================================================
let currentUserId = "guest";

document.addEventListener("deenassist-auth-ready", (e) => {
  const user = e.detail.user;
  currentUserId = user.uid;
  renderBookmarks(); // refresh in case bookmarks screen is already open

  const accountNameEl = document.getElementById("account-user-name");
  const logoutBtn = document.getElementById("more-logout-btn");
  accountNameEl.textContent = user.displayName || user.email || "Guest";
  logoutBtn.style.display = user.isGuest ? "none" : "inline-block";
});

document.getElementById("more-logout-btn").addEventListener("click", () => {
  document.getElementById("signout-btn").click();
});

// ---------- Exit App (best-effort — browsers restrict script-driven ----------
// tab/window closing for user-opened pages, so this may not actually close
// anything; the fallback message tells the user how to exit manually.
document.getElementById("exit-app-btn").addEventListener("click", () => {
  window.close();
  setTimeout(() => {
    alert("Deen Assist can't force-close from within the app. Please use your device's back button, home button, or app switcher to exit.");
  }, 300);
});

function bookmarkKey() {
  return `deenassist-bookmarks-${currentUserId}`;
}

function getBookmarks() {
  return JSON.parse(localStorage.getItem(bookmarkKey()) || "[]");
}

function renderBookmarks() {
  const listEl = document.getElementById("bookmark-list");
  const items = getBookmarks();

  if (items.length === 0) {
    listEl.innerHTML = '<p class="empty-state">No saved answers yet. Long-press or use "Save" on any chatbot answer to keep it here.</p>';
    return;
  }

  listEl.innerHTML = items
    .map(
      (item, i) => `
      <div class="bookmark-item">
        <p class="bookmark-text">${escapeHtml(item.text)}</p>
        <div class="bookmark-meta">
          <span class="bookmark-date">${new Date(item.date).toLocaleDateString()}</span>
          <button class="remove-btn" data-index="${i}">Remove</button>
        </div>
      </div>`
    )
    .join("");

  listEl.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const items = getBookmarks();
      items.splice(Number(btn.dataset.index), 1);
      localStorage.setItem(bookmarkKey(), JSON.stringify(items));
      renderBookmarks();
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Expose globally so the embedded chatbot (same-origin iframe, or via
// postMessage) can add a bookmark, e.g.:
//   window.saveBookmark("The five daily prayers are ...")
window.saveBookmark = function (text) {
  const items = getBookmarks();
  items.unshift({ text, date: Date.now() });
  localStorage.setItem(bookmarkKey(), JSON.stringify(items));
};

// If your chatbot is a cross-origin iframe, it can send a message like:
//   parent.postMessage({ type: "deenassist-save", text: "..." }, "*")
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "deenassist-save" && event.data.text) {
    window.saveBookmark(event.data.text);
  }
});
