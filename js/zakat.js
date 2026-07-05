// ============================================================
// Deen Assist — Zakat Calculator
// Pure client-side calculation. Nisab is based on 612.36g of silver
// (the more commonly used, lower threshold) — the user supplies the
// current silver price per gram in their own currency since this app
// has no backend/live pricing feed.
// ============================================================

const NISAB_SILVER_GRAMS = 612.36;
const ZAKAT_RATE = 0.025;

function formatMoney(n) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

document.getElementById("zakat-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const silverPrice = parseFloat(document.getElementById("zakat-silver-price").value) || 0;
  const cash = parseFloat(document.getElementById("zakat-cash").value) || 0;
  const metals = parseFloat(document.getElementById("zakat-metals").value) || 0;
  const business = parseFloat(document.getElementById("zakat-business").value) || 0;
  const investments = parseFloat(document.getElementById("zakat-investments").value) || 0;
  const receivable = parseFloat(document.getElementById("zakat-receivable").value) || 0;
  const debts = parseFloat(document.getElementById("zakat-debts").value) || 0;

  const resultEl = document.getElementById("zakat-result");

  if (silverPrice <= 0) {
    resultEl.innerHTML = `<p class="empty-state">Please enter the current silver price per gram to calculate the nisab threshold.</p>`;
    return;
  }

  const nisab = NISAB_SILVER_GRAMS * silverPrice;
  const totalAssets = cash + metals + business + investments + receivable;
  const netWealth = totalAssets - debts;
  const meetsNisab = netWealth >= nisab;
  const zakatDue = meetsNisab ? netWealth * ZAKAT_RATE : 0;

  resultEl.innerHTML = `
    <div class="card">
      <h2>Result</h2>
      <p class="zakat-line">Nisab threshold (612.36g silver): <strong>${formatMoney(nisab)}</strong></p>
      <p class="zakat-line">Net zakatable wealth: <strong>${formatMoney(netWealth)}</strong></p>
      ${
        meetsNisab
          ? `<p class="zakat-due">Zakat due: ${formatMoney(zakatDue)}</p>`
          : `<p class="zakat-line">Your net wealth is below the nisab threshold — zakat is not obligatory this year, though voluntary charity (sadaqah) is always encouraged.</p>`
      }
      <p class="quran-hint">This is a simplified estimate for common asset types (cash, savings, gold/silver, business inventory, investments). It doesn't account for zakat on livestock, agricultural produce, or other specialized categories — consult a knowledgeable scholar for a complete assessment of your specific situation.</p>
    </div>`;
});
