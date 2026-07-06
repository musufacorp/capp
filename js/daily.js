// ============================================================
// Deen Assist — Verse of the Day / Hadith of the Day
// Shown on the chat welcome screen. The verse uses a lightweight
// single-ayah fetch (not a full surah download); the hadith uses a
// small curated static list to avoid pulling a multi-MB collection
// file just for a home-screen highlight.
// ============================================================

const TOTAL_AYAHS = 6236;

// A small curated set of well-known, authentic hadiths (with source)
// for the daily highlight — kept short and self-contained by design.
const DAILY_HADITHS = [
  { text: "The best among you are those who have the best manners and character.", source: "Sahih al-Bukhari" },
  { text: "None of you truly believes until he wishes for his brother what he wishes for himself.", source: "Sahih al-Bukhari & Muslim" },
  { text: "Whoever believes in Allah and the Last Day should speak good or remain silent.", source: "Sahih al-Bukhari & Muslim" },
  { text: "The strong person is not the one who can overpower others. Rather, the strong person is the one who controls himself while in anger.", source: "Sahih al-Bukhari & Muslim" },
  { text: "Actions are judged by intentions, so each person will be rewarded according to what they intended.", source: "Sahih al-Bukhari & Muslim" },
  { text: "Smiling at your brother is charity.", source: "Jami at-Tirmidhi" },
  { text: "He is not a believer whose stomach is filled while his neighbor goes hungry.", source: "Al-Adab Al-Mufrad (Bukhari)" },
  { text: "Make things easy for people, and do not make it difficult for them. Make people calm, and do not scare them away.", source: "Sahih al-Bukhari" },
  { text: "The most beloved of deeds to Allah are those that are most consistent, even if small.", source: "Sahih al-Bukhari & Muslim" },
  { text: "Whoever is not merciful to others will not be treated mercifully.", source: "Sahih al-Bukhari" },
  { text: "A good word is charity.", source: "Sahih al-Bukhari & Muslim" },
  { text: "Richness is not having many possessions. Rather, true richness is the richness of the soul.", source: "Sahih al-Bukhari & Muslim" },
  { text: "The most complete of the believers in faith are those with the best character.", source: "Jami at-Tirmidhi" },
  { text: "Whoever removes a worldly hardship from a believer, Allah will remove from him one of the hardships of the Day of Judgment.", source: "Sahih Muslim" },
  { text: "Cleanliness is half of faith.", source: "Sahih Muslim" }
];

function dayOfYearSeed() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / 86400000);
}

async function loadVerseOfTheDay() {
  const el = document.getElementById("daily-verse-content");
  const ayahNumber = (dayOfYearSeed() % TOTAL_AYAHS) + 1;

  try {
    const [arabicRes, translationRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/quran-uthmani`),
      fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/en.sahih`)
    ]);
    const arabicJson = await arabicRes.json();
    const translationJson = await translationRes.json();
    const arabic = arabicJson.data;
    const translation = translationJson.data;

    el.innerHTML = `
      <p class="daily-arabic">${arabic.text}</p>
      <p class="daily-translation">"${translation.text}"</p>
      <p class="daily-ref">Surah ${translation.surah.englishName} (${translation.surah.number}:${translation.numberInSurah})</p>
    `;
  } catch (err) {
    el.innerHTML = `<p class="empty-state">Couldn't load today's verse.</p>`;
    console.error("Verse of the day failed:", err);
  }
}

function loadHadithOfTheDay() {
  const el = document.getElementById("daily-hadith-content");
  const pick = DAILY_HADITHS[dayOfYearSeed() % DAILY_HADITHS.length];
  el.innerHTML = `
    <p class="daily-translation">"${pick.text}"</p>
    <p class="daily-ref">${pick.source}</p>
  `;
}

function initDailyHighlights() {
  loadVerseOfTheDay();
  loadHadithOfTheDay();
}

window.initDailyHighlights = initDailyHighlights;
