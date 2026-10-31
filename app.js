const form = document.querySelector("#check-form");
const input = document.querySelector("#url-input");
const button = document.querySelector("#check-button");
const loading = document.querySelector("#loading");
const result = document.querySelector("#result");
const errorBox = document.querySelector("#error");
const count = document.querySelector("#char-count");
let lastSubmittedUrl = "";

input.addEventListener("input", () => {
  count.textContent = `${input.value.length} / 2048`;
  errorBox.classList.add("hidden");
});

function hidePanels() {
  loading.classList.add("hidden");
  result.classList.add("hidden");
  errorBox.classList.add("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hidePanels();
  lastSubmittedUrl = input.value.trim();
  if (!lastSubmittedUrl) return;

  button.disabled = true;
  loading.classList.remove("hidden");

  try {
    const base = (window.KS_API_BASE || "").replace(/\/$/, "");
    const response = await fetch(`${base}/api/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: lastSubmittedUrl })
    });
    const data = await response.json();
    loading.classList.add("hidden");

    if (!response.ok || !data.ok) {
      throw new Error(data.message || "Tautan tidak dapat diperiksa.");
    }

    const item = data.result;
    document.querySelector("#result-title").textContent = item.isLootLabs ? "LootLabs terdeteksi" : "URL valid";
    document.querySelector("#result-badge").textContent = item.isLootLabs ? "LOOTLABS" : "VALID";
    document.querySelector("#result-badge").style.background = item.isLootLabs ? "#3b2b65" : "#1a664a";
    document.querySelector("#result-badge").style.color = item.isLootLabs ? "#c8b5ff" : "#79f0bd";
    document.querySelector("#result-message").textContent = data.message;
    document.querySelector("#domain-value").textContent = item.host;
    document.querySelector("#protocol-value").textContent = item.protocol;
    document.querySelector("#category-value").textContent = item.category;
    document.querySelector("#status-value").textContent = item.status;
    result.classList.remove("hidden");
  } catch (err) {
    loading.classList.add("hidden");
    errorBox.textContent = err.message.includes("Failed to fetch")
      ? "Tidak dapat terhubung ke backend. Periksa alamat API dan status server."
      : err.message;
    errorBox.classList.remove("hidden");
  } finally {
    button.disabled = false;
  }
});

document.querySelector("#copy-button").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(lastSubmittedUrl);
    document.querySelector("#copy-button").textContent = "COPIED!";
    setTimeout(() => document.querySelector("#copy-button").textContent = "COPY URL", 1400);
  } catch {
    errorBox.textContent = "Browser tidak mengizinkan penyalinan otomatis.";
    errorBox.classList.remove("hidden");
  }
});

document.querySelector("#clear-button").addEventListener("click", () => {
  input.value = "";
  count.textContent = "0 / 2048";
  hidePanels();
  input.focus();
});
