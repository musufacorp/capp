// ============================================================
// Deen Assist — Hadith browser & search
// Data: fawazahmed0/hadith-api (free, no key), served via jsDelivr CDN.
// https://github.com/fawazahmed0/hadith-api
//
// Each collection is fetched once in full (~2.5-4.7MB depending on the
// book) the first time it's opened, then kept in memory for chapter
// browsing and search — the API has no per-book "chapter titles only"
// or search endpoint, so this is the only way to get both without
// re-fetching per chapter.
// ============================================================

const HADITH_CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

const HADITH_BOOKS = [
  { key: "bukhari", title: "Sahih al-Bukhari", edition: "eng-bukhari" },
  { key: "muslim", title: "Sahih Muslim", edition: "eng-muslim" },
  { key: "abudawud", title: "Sunan Abu Dawud", edition: "eng-abudawud" },
  { key: "tirmidhi", title: "Jami at-Tirmidhi", edition: "eng-tirmidhi" },
  { key: "nasai", title: "Sunan an-Nasa'i", edition: "eng-nasai" },
  { key: "ibnmajah", title: "Sunan Ibn Majah", edition: "eng-ibnmajah" }
];

let currentBook = null;
let currentBookData = null; // { metadata: { sections }, hadiths: [...] } — full book, fetched once

function hEl(id) {
  return document.getElementById(id);
}

function hEscapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function showHadithView(view) {
  hEl("hadith-book-view").style.display = view === "books" ? "block" : "none";
  hEl("hadith-section-view").style.display = view === "sections" ? "block" : "none";
  hEl("hadith-list-view").style.display = view === "hadiths" ? "block" : "none";
}

function renderBookList() {
  const listEl = hEl("hadith-book-list");
  listEl.innerHTML = HADITH_BOOKS.map(
    (b) => `
    <button class="quran-surah-card" data-book="${b.key}">
      <span class="quran-surah-info">
        <span class="quran-surah-name">${hEscapeHtml(b.title)}</span>
      </span>
    </button>`
  ).join("");

  listEl.querySelectorAll(".quran-surah-card").forEach((btn) => {
    btn.addEventListener("click", () => openBook(btn.dataset.book));
  });
}

async function openBook(bookKey) {
  currentBook = HADITH_BOOKS.find((b) => b.key === bookKey);
  if (!currentBook) return;

  hEl("hadith-book-title").textContent = currentBook.title;
  hEl("hadith-search-results").innerHTML = "";
  hEl("hadith-search-input").value = "";
  showHadithView("sections");

  if (currentBookData) {
    renderChapterList();
    return;
  }

  hEl("hadith-chapter-list").innerHTML = `<p class="empty-state">Loading collection (this is a one-time download of a few MB)…</p>`;

  try {
    const res = await fetch(`${HADITH_CDN}/${currentBook.edition}.min.json`);
    currentBookData = await res.json();
    renderChapterList();
  } catch (err) {
    currentBookData = null;
    hEl("hadith-chapter-list").innerHTML = `<p class="empty-state">Couldn't load this collection. Check your connection and try again.</p>`;
    console.error("Hadith book fetch failed:", err);
  }
}

function renderChapterList() {
  const listEl = hEl("hadith-chapter-list");
  const sections = currentBookData?.metadata?.sections || {};
  const entries = Object.entries(sections).filter(([num]) => num !== "0");

  listEl.innerHTML = entries
    .map(
      ([num, title]) => `
      <button class="quran-surah-card" data-section="${num}">
        <span class="quran-surah-num">${num}</span>
        <span class="quran-surah-info">
          <span class="quran-surah-name">${hEscapeHtml(title || `Chapter ${num}`)}</span>
        </span>
      </button>`
    )
    .join("");

  listEl.querySelectorAll(".quran-surah-card").forEach((btn) => {
    btn.addEventListener("click", () => openChapter(btn.dataset.section));
  });
}

function openChapter(sectionNum, highlightNumber) {
  hEl("hadith-chapter-title").textContent = currentBookData?.metadata?.sections?.[sectionNum] || `Chapter ${sectionNum}`;
  showHadithView("hadiths");

  const hadiths = (currentBookData?.hadiths || []).filter((h) => String(h.reference?.book) === String(sectionNum));
  renderHadithItems(hadiths, highlightNumber);
}

function renderHadithItems(hadiths, highlightNumber) {
  const listEl = hEl("hadith-items-list");
  if (!hadiths.length) {
    listEl.innerHTML = `<p class="empty-state">No hadiths found.</p>`;
    return;
  }
  listEl.innerHTML = hadiths
    .map(
      (h) => `
      <div class="card quran-ayah-card" id="hadith-item-${h.hadithnumber}">
        <div class="quran-ayah-head">
          <span class="quran-ayah-ref">#${h.hadithnumber}</span>
        </div>
        <p class="quran-translation-text" style="border-top:none;padding-top:0;">${hEscapeHtml(h.text)}</p>
      </div>`
    )
    .join("");

  if (highlightNumber) {
    setTimeout(() => {
      const target = document.getElementById(`hadith-item-${highlightNumber}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("quran-ayah-highlight");
        setTimeout(() => target.classList.remove("quran-ayah-highlight"), 2000);
      }
    }, 100);
  }
}

function runHadithSearch(keyword) {
  const resultsEl = hEl("hadith-search-results");
  const trimmed = keyword.trim().toLowerCase();
  if (!trimmed || !currentBookData) {
    resultsEl.innerHTML = "";
    return;
  }

  const matches = (currentBookData.hadiths || [])
    .filter((h) => h.text.toLowerCase().includes(trimmed))
    .slice(0, 30);

  if (!matches.length) {
    resultsEl.innerHTML = `<p class="empty-state">No matches found.</p>`;
    return;
  }

  resultsEl.innerHTML = matches
    .map(
      (h) => `
      <button class="quran-search-result" data-section="${h.reference?.book ?? ""}" data-number="${h.hadithnumber}">
        <span class="quran-search-ref">#${h.hadithnumber}</span>
        <span class="quran-search-snippet">${hEscapeHtml(h.text.slice(0, 160))}${h.text.length > 160 ? "…" : ""}</span>
      </button>`
    )
    .join("");

  resultsEl.querySelectorAll(".quran-search-result").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sectionNum = btn.dataset.section;
      const hadithNum = parseInt(btn.dataset.number, 10);
      if (!sectionNum) return;
      openChapter(sectionNum, hadithNum);
    });
  });
}

function initHadith() {
  renderBookList();

  hEl("hadith-back-to-books").addEventListener("click", () => showHadithView("books"));
  hEl("hadith-back-to-chapters").addEventListener("click", () => showHadithView("sections"));

  const searchInput = hEl("hadith-search-input");
  hEl("hadith-search-btn").addEventListener("click", () => runHadithSearch(searchInput.value));
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runHadithSearch(searchInput.value);
  });
}

window.initHadith = initHadith;
