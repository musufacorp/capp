// ============================================================
// Deen Assist — Ramadan Mode
// Suhoor/Iftar times (via Aladhan, same API used for prayer times),
// countdown to Ramadan using Aladhan's Hijri calendar conversion, and
// a simple fasting/qada tracker stored in localStorage.
// ============================================================

const RAMADAN_HIJRI_MONTH = 9;
const RAMADAN_TOTAL_DAYS = 30;

function rEl(id) {
  return document.getElementById(id);
}

function formatAladhanDateR(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

async function loadRamadanStatus() {
  const statusEl = rEl("ramadan-status");
  try {
    const todayStr = formatAladhanDateR(new Date());
    const res = await fetch(`https://api.aladhan.com/v1/gToH/${todayStr}`);
    const json = await res.json();
    const hijri = json.data.hijri;
    const hijriMonth = hijri.month.number;
    const hijriYear = parseInt(hijri.year, 10);

    if (hijriMonth === RAMADAN_HIJRI_MONTH) {
      statusEl.innerHTML = `<p class="daily-label">Ramadan Mubarak!</p><p class="qibla-note">Today is Ramadan day ${hijri.day} of ${hijri.month.days}.</p>`;
      loadSuhoorIftar();
      rEl("ramadan-times-card").style.display = "block";
    } else {
      const targetYear = hijriMonth < RAMADAN_HIJRI_MONTH ? hijriYear : hijriYear + 1;
      const calRes = await fetch(`https://api.aladhan.com/v1/hToGCalendar/${RAMADAN_HIJRI_MONTH}/${targetYear}`);
      const calJson = await calRes.json();
      const startGregorian = calJson.data[0].gregorian;
      const startDate = new Date(`${startGregorian.year}-${String(startGregorian.month.number).padStart(2, "0")}-${startGregorian.day}`);
      const daysLeft = Math.ceil((startDate - new Date()) / 86400000);
      statusEl.innerHTML = `<p class="daily-label">Countdown to Ramadan</p><p class="qibla-note">${daysLeft} day${daysLeft === 1 ? "" : "s"} until Ramadan ${targetYear} AH (starts around ${startGregorian.day} ${startGregorian.month.en} ${startGregorian.year} — exact date depends on moon sighting).</p>`;
      rEl("ramadan-times-card").style.display = "none";
    }
  } catch (err) {
    statusEl.innerHTML = `<p class="empty-state">Couldn't load Ramadan status. Check your connection.</p>`;
    console.error("Ramadan status failed:", err);
  }
}

function loadSuhoorIftar() {
  const timesEl = rEl("ramadan-times");
  if (!navigator.geolocation) {
    timesEl.textContent = "Location not supported on this device.";
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const dateStr = formatAladhanDateR(new Date());
        const res = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2`);
        const data = await res.json();
        const t = data.data.timings;
        timesEl.innerHTML = `
          <li>Suhoor ends (Fajr)<span>${t.Fajr}</span></li>
          <li>Iftar (Maghrib)<span>${t.Maghrib}</span></li>
        `;
      } catch (err) {
        timesEl.textContent = "Couldn't load Suhoor/Iftar times.";
      }
    },
    () => {
      timesEl.textContent = "Location permission denied.";
    }
  );
}

// ---------- Fasting / Qada tracker (localStorage) ----------
function getFastedDays() {
  return JSON.parse(localStorage.getItem("deenassist-ramadan-fasted") || "[]");
}

function toggleFastedDay(day) {
  const days = getFastedDays();
  const idx = days.indexOf(day);
  if (idx === -1) days.push(day);
  else days.splice(idx, 1);
  localStorage.setItem("deenassist-ramadan-fasted", JSON.stringify(days));
  renderFastingTracker();
}

function renderFastingTracker() {
  const fasted = getFastedDays();
  const gridEl = rEl("ramadan-fasting-grid");
  gridEl.innerHTML = Array.from({ length: RAMADAN_TOTAL_DAYS }, (_, i) => i + 1)
    .map((day) => `<button class="ramadan-day-btn${fasted.includes(day) ? " fasted" : ""}" data-day="${day}">${day}</button>`)
    .join("");

  gridEl.querySelectorAll(".ramadan-day-btn").forEach((btn) => {
    btn.addEventListener("click", () => toggleFastedDay(parseInt(btn.dataset.day, 10)));
  });

  rEl("ramadan-fasted-count").textContent = `${fasted.length} of ${RAMADAN_TOTAL_DAYS} days marked fasted`;
}

function initQadaCounter() {
  const input = rEl("ramadan-qada-input");
  input.value = localStorage.getItem("deenassist-ramadan-qada") || "0";
  input.addEventListener("change", () => {
    localStorage.setItem("deenassist-ramadan-qada", input.value || "0");
  });
}

function initRamadan() {
  loadRamadanStatus();
  renderFastingTracker();
  initQadaCounter();
}

window.initRamadan = initRamadan;
