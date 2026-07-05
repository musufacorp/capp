// ============================================================
// Deen Assist — Hijri Calendar / Date Converter
// Uses the same free Aladhan API already used for prayer times.
// ============================================================

function formatAladhanDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

function renderHijri(hijri, gregorian) {
  return `${hijri.day} ${hijri.month.en} ${hijri.year} AH — ${gregorian.weekday.en}, ${gregorian.day} ${gregorian.month.en} ${gregorian.year} CE`;
}

async function loadTodayHijri() {
  const el = document.getElementById("calendar-today");
  try {
    const dateStr = formatAladhanDate(new Date());
    const res = await fetch(`https://api.aladhan.com/v1/gToH/${dateStr}`);
    const json = await res.json();
    el.textContent = renderHijri(json.data.hijri, json.data.gregorian);
  } catch (err) {
    el.textContent = "Couldn't load today's date. Check your connection.";
    console.error("Hijri today fetch failed:", err);
  }
}

function initHijriCalendar() {
  loadTodayHijri();

  const gregorianInput = document.getElementById("calendar-gregorian-input");
  const today = new Date();
  gregorianInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  document.getElementById("calendar-to-hijri-btn").addEventListener("click", async () => {
    const resultEl = document.getElementById("calendar-result");
    if (!gregorianInput.value) {
      resultEl.textContent = "Please pick a date first.";
      return;
    }

    const [year, month, day] = gregorianInput.value.split("-");
    resultEl.textContent = "Converting…";

    try {
      const res = await fetch(`https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`);
      const json = await res.json();
      resultEl.textContent = renderHijri(json.data.hijri, json.data.gregorian);
    } catch (err) {
      resultEl.textContent = "Conversion failed. Check your connection and try again.";
      console.error("Hijri conversion failed:", err);
    }
  });
}

window.initHijriCalendar = initHijriCalendar;
