// ============================================================
// Deen Assist — How to Pray (Salah) guide
// Static content — a step-by-step walkthrough of the obligatory
// prayer structure, intended for new Muslims and non-Muslims
// learning about Islamic prayer.
// ============================================================

const PRAYER_RAKAH_COUNTS = [
  ["Fajr", "2 rakahs"],
  ["Dhuhr", "4 rakahs"],
  ["Asr", "4 rakahs"],
  ["Maghrib", "3 rakahs"],
  ["Isha", "4 rakahs"]
];

const PRAYER_STEPS = [
  {
    title: "1. Prepare",
    body: "Perform wudu (ablution) if you haven't already, wear clean clothing, and face the Qibla (direction of the Kaaba — use the Qibla tab to find it)."
  },
  {
    title: "2. Niyyah (Intention)",
    body: "Make the intention in your heart for which prayer you are performing (e.g. Fajr, Dhuhr). No specific words are required — intention is a matter of the heart."
  },
  {
    title: "3. Takbeeratul Ihram (Opening)",
    arabic: "اللَّهُ أَكْبَر",
    translit: "Allahu Akbar",
    translation: "Allah is the Greatest.",
    body: "Raise your hands to shoulder or ear level, say the takbir, then fold your hands over your chest. This begins the prayer."
  },
  {
    title: "4. Qiyam (Standing recitation)",
    body: "Recite Surah Al-Fatiha, then (in the first two rakahs of most prayers) another short surah or passage of your choice from the Quran."
  },
  {
    title: "5. Ruku (Bowing)",
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
    translit: "Subhana Rabbiyal Adheem",
    translation: "Glory be to my Lord, the Most Great.",
    body: "Say \"Allahu Akbar\" and bow with your back straight and hands on your knees. Recite the above three times."
  },
  {
    title: "6. Rising from Ruku",
    arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ، رَبَّنَا وَلَكَ الْحَمْدُ",
    translit: "Sami' Allahu liman hamidah, Rabbana wa lakal hamd",
    translation: "Allah hears whoever praises Him. Our Lord, praise be to You.",
    body: "Stand fully upright again before continuing."
  },
  {
    title: "7. Sujood (Prostration)",
    arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    translit: "Subhana Rabbiyal A'la",
    translation: "Glory be to my Lord, the Most High.",
    body: "Say \"Allahu Akbar\" and prostrate with your forehead, nose, palms, knees, and toes touching the ground. Recite the above three times."
  },
  {
    title: "8. Jalsa (Sitting briefly)",
    body: "Say \"Allahu Akbar\", sit up briefly between the two prostrations, then say \"Allahu Akbar\" again and prostrate a second time (repeating step 7)."
  },
  {
    title: "9. Repeat for remaining rakahs",
    body: "Stand for the next rakah (saying \"Allahu Akbar\") and repeat steps 4-8. In the 3rd and 4th rakahs of longer prayers, only Al-Fatiha is recited in Qiyam — no additional surah."
  },
  {
    title: "10. Tashahhud (Sitting testimony)",
    arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    translit: "At-tahiyyatu lillahi was-salawatu wat-tayyibat, as-salamu 'alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh, as-salamu 'alayna wa 'ala 'ibadillahis-saliheen, ash-hadu al-la ilaha illallah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh",
    translation: "All greetings, prayers, and good deeds are due to Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no deity but Allah, and I bear witness that Muhammad is His servant and Messenger.",
    body: "After the 2nd rakah, sit and recite the Tashahhud. In prayers with 3 or 4 rakahs, stand back up afterward (without saying Salam) and complete the remaining rakah(s), then sit for the Tashahhud again at the very end — this final time it's usually followed by Durood (blessings upon the Prophet)."
  },
  {
    title: "11. Salam (Closing)",
    arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
    translit: "Assalamu Alaikum wa Rahmatullah",
    translation: "Peace and the mercy of Allah be upon you.",
    body: "Turn your head to the right and say the above, then turn to the left and repeat it. This ends the prayer."
  }
];

function initHowToPray() {
  const countsEl = document.getElementById("how-to-pray-counts");
  countsEl.innerHTML = PRAYER_RAKAH_COUNTS.map(([name, count]) => `<li>${name}<span>${count}</span></li>`).join("");

  const stepsEl = document.getElementById("how-to-pray-steps");
  stepsEl.innerHTML = PRAYER_STEPS.map(
    (s) => `
    <div class="card htp-step-card">
      <h2>${s.title}</h2>
      ${s.arabic ? `<p class="quran-arabic-text">${s.arabic}</p>` : ""}
      ${s.translit ? `<p class="quran-translit-text">${s.translit}</p>` : ""}
      ${s.translation ? `<p class="quran-translation-text">${s.translation}</p>` : ""}
      <p class="htp-step-body">${s.body}</p>
    </div>`
  ).join("");
}

window.initHowToPray = initHowToPray;
