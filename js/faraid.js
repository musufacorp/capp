// ============================================================
// Deen Assist — Faraid (Islamic Inheritance) Calculator
// ------------------------------------------------------------
// Scope: covers the most common heir set — surviving spouse,
// children (sons/daughters), and parents — under standard Sunni
// fixed-share (Quranic) rules, including 'Awl (proportional
// reduction when fixed shares exceed the estate) and the
// Gharrawayn/Umariyyatain rule (spouse + both parents, no children).
//
// Deliberately NOT covered: siblings, grandparents, grandchildren,
// and radd (surplus redistribution) — these involve additional
// rulings and edge cases beyond what a simple calculator should
// guess at. The calculator says so explicitly rather than producing
// a possibly-wrong number.
//
// This is for education/estimation only — always a prominent
// disclaimer to consult a qualified Faraid officer (in Malaysia,
// Amanah Raya Berhad or the Syariah Court) for actual distribution.
// ============================================================

function fEl(id) {
  return document.getElementById(id);
}

function fraction(n, d) {
  if (d === 0) return 0;
  return n / d;
}

function formatShare(x) {
  return `${(x * 100).toFixed(2)}%`;
}

function calculateFaraid({ spouseType, wifeCount, sons, daughters, fatherAlive, motherAlive }) {
  const hasChildren = sons > 0 || daughters > 0;
  const hasSons = sons > 0;
  const notes = [];
  const shares = []; // { label, fraction }

  // ---------- Spouse ----------
  let spouseShare = 0;
  if (spouseType === "husband") {
    spouseShare = hasChildren ? fraction(1, 4) : fraction(1, 2);
    shares.push({ label: "Husband", fraction: spouseShare });
  } else if (spouseType === "wife") {
    spouseShare = hasChildren ? fraction(1, 8) : fraction(1, 4);
    const perWife = spouseShare / wifeCount;
    for (let i = 0; i < wifeCount; i++) {
      shares.push({ label: wifeCount > 1 ? `Wife ${i + 1}` : "Wife", fraction: perWife });
    }
  }

  // ---------- Mother ----------
  let motherShare = 0;
  const isGharrawayn = !hasChildren && fatherAlive && motherAlive && spouseType !== "none";
  if (motherAlive) {
    if (hasChildren) {
      motherShare = fraction(1, 6);
    } else if (isGharrawayn) {
      motherShare = (1 - spouseShare) / 3;
    } else {
      motherShare = fraction(1, 3);
    }
    shares.push({ label: "Mother", fraction: motherShare });
  }

  // ---------- Father (fixed portion, if applicable) ----------
  let fatherFixed = 0;
  if (fatherAlive && hasChildren) {
    fatherFixed = fraction(1, 6);
    shares.push({ label: "Father (fixed share)", fraction: fatherFixed });
  }

  // ---------- Daughters (fixed share, only when there are no sons) ----------
  let daughtersFixedTotal = 0;
  if (!hasSons && daughters > 0) {
    daughtersFixedTotal = daughters === 1 ? fraction(1, 2) : fraction(2, 3);
    const perDaughter = daughtersFixedTotal / daughters;
    for (let i = 0; i < daughters; i++) {
      shares.push({ label: `Daughter ${daughters > 1 ? i + 1 : ""}`.trim(), fraction: perDaughter });
    }
  }

  // ---------- Check for 'Awl (fixed shares exceed the whole estate) ----------
  const fixedTotal = spouseShare + motherShare + fatherFixed + daughtersFixedTotal;

  if (fixedTotal > 1.0000001) {
    // 'Awl: scale every fixed share down proportionally so they sum to the whole estate.
    const scale = 1 / fixedTotal;
    shares.forEach((s) => (s.fraction *= scale));
    notes.push("'Awl applied: the fixed shares added up to more than the whole estate, so each share was reduced proportionally (standard practice when this happens).");
    return { shares, notes, unresolved: 0 };
  }

  const residue = 1 - fixedTotal;

  // ---------- Residuary (Asaba) distribution ----------
  if (hasSons) {
    // Sons and daughters split the residue at a 2:1 ratio.
    const totalUnits = sons * 2 + daughters * 1;
    const unitValue = residue / totalUnits;
    for (let i = 0; i < sons; i++) {
      shares.push({ label: `Son ${sons > 1 ? i + 1 : ""}`.trim(), fraction: unitValue * 2 });
    }
    for (let i = 0; i < daughters; i++) {
      shares.push({ label: `Daughter ${daughters > 1 ? i + 1 : ""}`.trim(), fraction: unitValue * 1 });
    }
  } else if (fatherAlive && residue > 0.0000001) {
    // With no sons, the father (as the residuary heir) takes what's left,
    // on top of his fixed 1/6 already added above (or as pure residuary
    // if there were no children at all).
    const fatherIdx = shares.findIndex((s) => s.label.startsWith("Father"));
    if (fatherIdx >= 0) {
      shares[fatherIdx].fraction += residue;
      shares[fatherIdx].label = "Father (fixed + residue)";
    } else {
      shares.push({ label: "Father (residuary)", fraction: residue });
    }
  } else if (residue > 0.0000001) {
    // No supported residuary heir to absorb the leftover — this needs
    // "radd" (return) rules this calculator doesn't cover.
    notes.push(`There is a remaining ${formatShare(residue)} of the estate with no residuary heir in this scenario (radd/return rules apply, which aren't covered here) — please consult a qualified Faraid officer for how this balance should be distributed.`);
    return { shares, notes, unresolved: residue };
  }

  return { shares, notes, unresolved: 0 };
}

function renderFaraidResult(result) {
  const resultEl = fEl("faraid-result");
  const rows = result.shares
    .filter((s) => s.fraction > 0.0000001)
    .map((s) => `<p class="zakat-line">${s.label}: <strong>${formatShare(s.fraction)}</strong></p>`)
    .join("");

  const notesHtml = result.notes.map((n) => `<p class="quran-hint">${n}</p>`).join("");

  resultEl.innerHTML = `
    <div class="card">
      <h2>Estimated Shares</h2>
      ${rows || '<p class="empty-state">No heirs entered.</p>'}
      ${notesHtml}
      <p class="quran-hint">This is a simplified estimate covering spouse, children, and parents only — it does not account for siblings, grandparents, grandchildren, debts, or funeral/will deductions (which are settled before distribution). For actual estate distribution, consult Amanah Raya Berhad or a qualified Faraid officer.</p>
    </div>`;
}

function initFaraid() {
  const spouseSelect = fEl("faraid-spouse");
  const wifeCountRow = fEl("faraid-wife-count-row");

  spouseSelect.addEventListener("change", () => {
    wifeCountRow.style.display = spouseSelect.value === "wife" ? "flex" : "none";
  });

  fEl("faraid-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const spouseType = spouseSelect.value;
    const wifeCount = Math.max(1, parseInt(fEl("faraid-wife-count").value, 10) || 1);
    const sons = Math.max(0, parseInt(fEl("faraid-sons").value, 10) || 0);
    const daughters = Math.max(0, parseInt(fEl("faraid-daughters").value, 10) || 0);
    const fatherAlive = fEl("faraid-father").checked;
    const motherAlive = fEl("faraid-mother").checked;

    if (spouseType === "none" && sons === 0 && daughters === 0 && !fatherAlive && !motherAlive) {
      fEl("faraid-result").innerHTML = `<p class="empty-state">Please enter at least one surviving heir.</p>`;
      return;
    }

    const result = calculateFaraid({ spouseType, wifeCount, sons, daughters, fatherAlive, motherAlive });
    renderFaraidResult(result);
  });
}

window.initFaraid = initFaraid;
