// ============================================================
// Deen Assist — Dua collection
// Static curated data (common daily duas), no API needed.
// ============================================================

const DUA_CATEGORIES = [
  {
    key: "morning-evening",
    title: "Morning & Evening",
    duas: [
      {
        title: "Upon Waking Up",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        translit: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
        translation: "All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection."
      },
      {
        title: "Morning Remembrance",
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
        translit: "Asbahna wa asbahal-mulku lillah, walhamdu lillah",
        translation: "We have reached the morning and at this very time all sovereignty belongs to Allah, and all praise is for Allah."
      },
      {
        title: "Evening Remembrance",
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
        translit: "Amsayna wa amsal-mulku lillah, walhamdu lillah",
        translation: "We have reached the evening and at this very time all sovereignty belongs to Allah, and all praise is for Allah."
      }
    ]
  },
  {
    key: "food",
    title: "Eating & Drinking",
    duas: [
      {
        title: "Before Eating",
        arabic: "بِسْمِ اللَّهِ",
        translit: "Bismillah",
        translation: "In the name of Allah."
      },
      {
        title: "If You Forgot to Say Bismillah Before Eating",
        arabic: "بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ",
        translit: "Bismillahi awwalahu wa akhirahu",
        translation: "In the name of Allah, in the beginning and the end of it."
      },
      {
        title: "After Eating",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        translit: "Alhamdu lillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
        translation: "All praise is for Allah who fed me this and provided it for me without any might or power on my part."
      }
    ]
  },
  {
    key: "travel",
    title: "Travel",
    duas: [
      {
        title: "Before Traveling",
        arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
        translit: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun",
        translation: "Glory to Him who has made this subservient to us, and we could never have accomplished this by ourselves. And indeed, to our Lord we will return."
      },
      {
        title: "Boarding a Vehicle",
        arabic: "بِسْمِ اللَّهِ، الْحَمْدُ لِلَّهِ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
        translit: "Bismillah, alhamdulillah, subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun",
        translation: "In the name of Allah, all praise is for Allah. Glory to Him who has made this subservient to us, and we could never have accomplished this by ourselves. And indeed, to our Lord we will return."
      }
    ]
  },
  {
    key: "distress",
    title: "Distress & Anxiety",
    duas: [
      {
        title: "For Anxiety and Sorrow",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
        translit: "La ilaha illallahul-'Azimul-Halim, la ilaha illallahu Rabbul-'Arshil-'Azim, la ilaha illallahu Rabbus-samawati wa Rabbul-ardi wa Rabbul-'Arshil-Karim",
        translation: "There is no deity but Allah, the Mighty, the Forbearing. There is no deity but Allah, Lord of the Magnificent Throne. There is no deity but Allah, Lord of the heavens and Lord of the earth and Lord of the Noble Throne."
      },
      {
        title: "Seeking Ease in Hardship",
        arabic: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
        translit: "Allahumma la sahla illa ma ja'altahu sahlan, wa anta taj'alul-hazna idha shi'ta sahla",
        translation: "O Allah, nothing is easy except what You make easy, and You make the difficult easy if You wish."
      }
    ]
  },
  {
    key: "protection",
    title: "Protection",
    duas: [
      {
        title: "Seeking Refuge from Evil",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        translit: "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
        translation: "I seek refuge in the perfect words of Allah from the evil of what He has created."
      },
      {
        title: "Before Sleeping",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        translit: "Bismika Allahumma amutu wa ahya",
        translation: "In Your name, O Allah, I die and I live."
      }
    ]
  }
];

let currentDuaCategory = null;

function dEl(id) {
  return document.getElementById(id);
}

function dEscapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function showDuasView(view) {
  dEl("duas-category-view").style.display = view === "categories" ? "block" : "none";
  dEl("duas-list-view").style.display = view === "duas" ? "block" : "none";
}

function renderDuaCategories() {
  const listEl = dEl("duas-category-list");
  listEl.innerHTML = DUA_CATEGORIES.map(
    (c) => `
    <button class="quran-surah-card" data-category="${c.key}">
      <span class="quran-surah-info">
        <span class="quran-surah-name">${dEscapeHtml(c.title)}</span>
        <span class="quran-surah-sub">${c.duas.length} duas</span>
      </span>
    </button>`
  ).join("");

  listEl.querySelectorAll(".quran-surah-card").forEach((btn) => {
    btn.addEventListener("click", () => openDuaCategory(btn.dataset.category));
  });
}

function openDuaCategory(key) {
  currentDuaCategory = DUA_CATEGORIES.find((c) => c.key === key);
  if (!currentDuaCategory) return;

  dEl("duas-category-title").textContent = currentDuaCategory.title;
  dEl("duas-items-list").innerHTML = currentDuaCategory.duas
    .map(
      (d) => `
      <div class="card quran-ayah-card">
        <div class="quran-ayah-head">
          <span class="quran-ayah-ref">${dEscapeHtml(d.title)}</span>
        </div>
        <p class="quran-arabic-text">${d.arabic}</p>
        <p class="quran-translit-text">${dEscapeHtml(d.translit)}</p>
        <p class="quran-translation-text">${dEscapeHtml(d.translation)}</p>
      </div>`
    )
    .join("");
  showDuasView("duas");
}

function initDuas() {
  renderDuaCategories();
  dEl("duas-back-to-categories").addEventListener("click", () => showDuasView("categories"));
}

window.initDuas = initDuas;
