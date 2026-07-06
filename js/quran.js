// ============================================================
// Deen Assist — Digital Quran
// Vanilla JS, no build step. Ported from the feature set of the
// previous (Next.js) build: surah browsing, Arabic text, per-ayah
// audio, transliteration, and English/Malay translation, plus a
// full-text search across the Quran.
//
// Data: api.alquran.cloud (free, no key). Audio: everyayah.com
// (Mishary Alafasy recitation, free, no key).
// ============================================================

const QURAN_API = "https://api.alquran.cloud/v1";

let surahs = [];
let quranInitialized = false;
let currentSurahAyahs = null; // { arabic, transliteration, translation } keyed arrays by numberInSurah
let currentSurahMeta = null;
let currentTranslationEdition = "en.sahih";

// ---------- DOM references (queried lazily since quran.js loads before index.html body is fully relevant) ----------
function el(id) {
  return document.getElementById(id);
}

function getAudioUrl(surahNumber, ayahNumber) {
  const surahStr = String(surahNumber).padStart(3, "0");
  const ayahStr = String(ayahNumber).padStart(3, "0");
  return `https://www.everyayah.com/data/Alafasy_128kbps/${surahStr}${ayahStr}.mp3`;
}

// ---------- View switching ----------
function showListView() {
  el("quran-search-view").style.display = "block";
  el("quran-list-view").style.display = "block";
  el("quran-detail-view").style.display = "none";
}

function showDetailView() {
  el("quran-search-view").style.display = "none";
  el("quran-list-view").style.display = "none";
  el("quran-detail-view").style.display = "block";
}

// ---------- Surah list ----------
async function loadSurahList() {
  const listEl = el("quran-surah-list");
  try {
    const res = await fetch(`${QURAN_API}/surah`);
    const json = await res.json();
    surahs = json.data;
    listEl.innerHTML = surahs
      .map(
        (s) => `
        <button class="quran-surah-card" data-surah="${s.number}">
          <span class="quran-surah-num">${s.number}</span>
          <span class="quran-surah-info">
            <span class="quran-surah-name">${escapeHtml(s.englishName)}</span>
            <span class="quran-surah-sub">${escapeHtml(s.englishNameTranslation)} · ${s.numberOfAyahs} ayahs</span>
          </span>
          <span class="quran-surah-arabic">${escapeHtml(s.name)}</span>
        </button>`
      )
      .join("");

    listEl.querySelectorAll(".quran-surah-card").forEach((btn) => {
      btn.addEventListener("click", () => openSurah(parseInt(btn.dataset.surah, 10)));
    });
  } catch (err) {
    listEl.innerHTML = `<p class="empty-state">Couldn't load the surah list. Check your connection and reopen this tab.</p>`;
    console.error("Quran surah list failed:", err);
  }
}

// ---------- Surah detail ----------
async function openSurah(surahNumber, scrollToAyah) {
  const surahMeta = surahs.find((s) => s.number === surahNumber);
  if (!surahMeta) return;

  stopAllPlayback();
  showDetailView();
  currentSurahMeta = surahMeta;
  el("quran-detail-title").textContent = `${surahMeta.englishName} (${surahMeta.name})`;
  el("quran-ayah-list").innerHTML = `<p class="empty-state">Loading…</p>`;

  await fetchSurahEditions(surahNumber);
  renderAyahs();

  if (scrollToAyah) {
    setTimeout(() => {
      const target = document.getElementById(`quran-ayah-${scrollToAyah}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("quran-ayah-highlight");
        setTimeout(() => target.classList.remove("quran-ayah-highlight"), 2000);
      }
    }, 100);
  }
}

async function fetchSurahEditions(surahNumber) {
  try {
    const [arabicRes, translitRes, translationRes] = await Promise.all([
      fetch(`${QURAN_API}/surah/${surahNumber}/quran-uthmani`),
      fetch(`${QURAN_API}/surah/${surahNumber}/en.transliteration`),
      fetch(`${QURAN_API}/surah/${surahNumber}/${currentTranslationEdition}`)
    ]);
    const [arabicJson, translitJson, translationJson] = await Promise.all([
      arabicRes.json(),
      translitRes.json(),
      translationRes.json()
    ]);
    currentSurahAyahs = {
      arabic: arabicJson.data.ayahs,
      transliteration: translitJson.data.ayahs,
      translation: translationJson.data.ayahs
    };
  } catch (err) {
    currentSurahAyahs = null;
    console.error("Quran surah detail failed:", err);
  }
}

function renderAyahs() {
  const listEl = el("quran-ayah-list");
  if (!currentSurahAyahs) {
    listEl.innerHTML = `<p class="empty-state">Couldn't load this surah. Please try again.</p>`;
    return;
  }

  const showTranslit = el("quran-toggle-transliteration").checked;
  const showTranslation = el("quran-toggle-translation").checked;
  const { arabic, transliteration, translation } = currentSurahAyahs;

  listEl.innerHTML = arabic
    .map((ayah, i) => {
      const translitText = transliteration[i]?.text || "";
      const translationText = translation[i]?.text || "";
      return `
        <div class="card quran-ayah-card" id="quran-ayah-${ayah.numberInSurah}">
          <div class="quran-ayah-head">
            <span class="quran-ayah-ref">${currentSurahMeta.number}:${ayah.numberInSurah}</span>
            <button class="icon-btn quran-play-btn" data-surah="${currentSurahMeta.number}" data-ayah="${ayah.numberInSurah}" aria-label="Play recitation">▶</button>
          </div>
          <p class="quran-arabic-text">${escapeHtml(ayah.text)}</p>
          ${showTranslit ? `<p class="quran-translit-text">${escapeHtml(translitText)}</p>` : ""}
          ${showTranslation ? `<p class="quran-translation-text">${escapeHtml(translationText)}</p>` : ""}
        </div>`;
    })
    .join("");

  listEl.querySelectorAll(".quran-play-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const surahNum = parseInt(btn.dataset.surah, 10);
      const ayahNum = parseInt(btn.dataset.ayah, 10);
      togglePlayAyah(surahNum, ayahNum, btn);
    });
  });
}

// ---------- Audio playback ----------
// Two modes share one <audio> element: single-ayah play/pause, and
// "Play Surah" continuous playback that auto-advances until the user
// stops it or the surah finishes.
let currentPlayingBtn = null;
let continuousPlayActive = false;

function playSurahLabel(key) {
  return window.deenAssistT ? window.deenAssistT(key) : { playSurah: "▶ Play Surah", stopSurah: "⏹ Stop" }[key];
}

function stopAllPlayback() {
  const audio = el("quran-audio-player");
  audio.pause();
  audio.onended = null;
  if (currentPlayingBtn) {
    currentPlayingBtn.textContent = "▶";
    currentPlayingBtn = null;
  }
  if (continuousPlayActive) {
    continuousPlayActive = false;
    const playSurahBtn = el("quran-play-surah-btn");
    if (playSurahBtn) playSurahBtn.textContent = playSurahLabel("playSurah");
  }
}

function togglePlayAyah(surahNumber, ayahNumber, btn) {
  const audio = el("quran-audio-player");
  const wasThisButtonPlaying = currentPlayingBtn === btn && !audio.paused && !continuousPlayActive;

  stopAllPlayback();
  if (wasThisButtonPlaying) return; // tapping the currently-playing ayah again just stops it

  const url = getAudioUrl(surahNumber, ayahNumber);
  audio.src = url;
  audio.play().catch((err) => console.error("Quran audio playback failed:", err));
  btn.textContent = "⏸";
  currentPlayingBtn = btn;

  audio.onended = () => {
    btn.textContent = "▶";
    currentPlayingBtn = null;
  };
}

function playSurahAyahAtIndex(index) {
  const audio = el("quran-audio-player");

  if (!currentSurahAyahs || index >= currentSurahAyahs.arabic.length) {
    stopAllPlayback(); // reached the end of the surah
    return;
  }

  const ayah = currentSurahAyahs.arabic[index];
  if (currentPlayingBtn) currentPlayingBtn.textContent = "▶";

  audio.src = getAudioUrl(currentSurahMeta.number, ayah.numberInSurah);
  audio.play().catch((err) => console.error("Quran audio playback failed:", err));

  const btn = document.querySelector(`.quran-play-btn[data-ayah="${ayah.numberInSurah}"]`);
  if (btn) {
    btn.textContent = "⏸";
    currentPlayingBtn = btn;
  }

  const card = document.getElementById(`quran-ayah-${ayah.numberInSurah}`);
  if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });

  audio.onended = () => {
    if (continuousPlayActive) playSurahAyahAtIndex(index + 1);
  };
}

function toggleContinuousPlay() {
  const playSurahBtn = el("quran-play-surah-btn");
  if (continuousPlayActive) {
    stopAllPlayback();
    return;
  }
  if (!currentSurahAyahs) return;

  stopAllPlayback();
  continuousPlayActive = true;
  playSurahBtn.textContent = playSurahLabel("stopSurah");
  playSurahAyahAtIndex(0);
}

// ---------- Search ----------
async function runSearch(keyword) {
  const resultsEl = el("quran-search-results");
  const trimmed = keyword.trim();
  if (!trimmed) {
    resultsEl.innerHTML = "";
    return;
  }

  resultsEl.innerHTML = `<p class="empty-state">Searching…</p>`;
  try {
    const res = await fetch(`${QURAN_API}/search/${encodeURIComponent(trimmed)}/all/en`);
    const json = await res.json();
    const matches = json.data?.matches || [];

    if (!matches.length) {
      resultsEl.innerHTML = `<p class="empty-state">No matches found.</p>`;
      return;
    }

    resultsEl.innerHTML = matches
      .slice(0, 30)
      .map(
        (m) => `
        <button class="quran-search-result" data-surah="${m.surah.number}" data-ayah="${m.numberInSurah}">
          <span class="quran-search-ref">${m.surah.number}:${m.numberInSurah} — ${escapeHtml(m.surah.englishName)}</span>
          <span class="quran-search-snippet">${escapeHtml(m.text)}</span>
        </button>`
      )
      .join("");

    resultsEl.querySelectorAll(".quran-search-result").forEach((btn) => {
      btn.addEventListener("click", () => {
        openSurah(parseInt(btn.dataset.surah, 10), parseInt(btn.dataset.ayah, 10));
      });
    });
  } catch (err) {
    resultsEl.innerHTML = `<p class="empty-state">Search failed. Please try again.</p>`;
    console.error("Quran search failed:", err);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ---------- Init (called lazily by app.js the first time the Quran tab opens) ----------
function initQuran() {
  if (quranInitialized) return;
  quranInitialized = true;

  loadSurahList();
  el("quran-play-surah-btn").textContent = playSurahLabel("playSurah");

  el("quran-back-btn").addEventListener("click", () => {
    stopAllPlayback();
    showListView();
  });

  el("quran-play-surah-btn").addEventListener("click", toggleContinuousPlay);

  el("quran-toggle-transliteration").addEventListener("change", renderAyahs);
  el("quran-toggle-translation").addEventListener("change", renderAyahs);

  el("quran-translation-select").addEventListener("change", async (e) => {
    stopAllPlayback();
    currentTranslationEdition = e.target.value;
    if (currentSurahMeta) {
      el("quran-ayah-list").innerHTML = `<p class="empty-state">Loading…</p>`;
      await fetchSurahEditions(currentSurahMeta.number);
      renderAyahs();
    }
  });

  const searchInput = el("quran-search-input");
  el("quran-search-btn").addEventListener("click", () => runSearch(searchInput.value));
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch(searchInput.value);
  });
}

window.initQuran = initQuran;
