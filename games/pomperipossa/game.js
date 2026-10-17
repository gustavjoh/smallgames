const POOL = ["🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐸", "🐵", "🦁", "🐯", "🐮", "🐷", "🐔", "🐧", "🦉", "🦄", "🐢", "🐙", "🐞", "🍎", "🍌", "🍓", "🍒", "🍉", "🚗", "🚀", "⚽", "🎈", "🌻"];
const LEVELS = { 4: "Lätt", 6: "Medel", 9: "Svårt" };
const WORDS = ["Pomperipossa!", "Hokus pokus!", "Abrakadabra!"];
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
let level = 4, streak = 0, best = 0;

export function pomperipossaGame(app, hub) {
  let timers = [], items = [], missing = "", tries = 0;
  const later = (fn, ms) => timers.push(setTimeout(fn, reducedMotion() ? Math.min(ms, 600) : ms));
  const clear = () => { timers.forEach(clearTimeout); timers = []; };

  const render = () => {
    clear();
    app.innerHTML = `<section class="shell pomp-shell"><header><span class="logo material-symbols-outlined">auto_fix_high</span><div><p>VAD FÖRSVANN?</p><h1>Pomperipossa</h1></div><button class="icon-btn material-symbols-outlined" data-home aria-label="Till spelhyllan">home</button></header>
    <section class="pomp-game"><div class="pomp-levels" role="group" aria-label="Svårighet">${Object.entries(LEVELS).map(([n, l]) => `<button data-level="${n}" class="${Number(n) === level ? "selected" : ""}" aria-pressed="${Number(n) === level}">${l}<small>${n} st</small></button>`).join("")}</div>
    <p class="pomp-streak" aria-live="polite">Rätt i rad: <b>${streak}</b> · Rekord: <b>${best}</b></p>
    <p class="pomp-help" aria-live="polite"></p><div class="pomp-stage"><div class="pomp-grid"></div><div class="pomp-magic" aria-hidden="true"></div></div>
    <div class="pomp-choices" aria-label="Välj vilken som försvann"></div>
    <button class="primary pomp-next" data-next><span class="material-symbols-outlined">auto_fix_high</span> Börja</button></section></section>`;
    app.querySelector("[data-home]").onclick = () => { clear(); hub(); };
    app.querySelectorAll("[data-level]").forEach((b) => b.onclick = () => { level = Number(b.dataset.level); render(); });
    app.querySelector("[data-next]").onclick = start;
  };

  const $ = (s) => app.querySelector(s);
  const help = (t) => { $(".pomp-help").textContent = t; };
  const cell = (e, cls = "") => `<span class="pomp-item ${cls}">${e}</span>`;

  const start = () => {
    clear(); tries = 0;
    items = shuffle(POOL).slice(0, level); missing = items[Math.floor(Math.random() * level)];
    const next = $("[data-next]"); next.hidden = true; $(".pomp-choices").innerHTML = "";
    $(".pomp-grid").dataset.n = level; $(".pomp-grid").innerHTML = items.map((e) => cell(e)).join("");
    help("Titta noga och kom ihåg alla!");
    const look = 2500 + level * 600;
    later(() => { help(""); const m = $(".pomp-magic"); m.textContent = ""; m.innerHTML = `<span class="pomp-wand">🪄</span><b>${WORDS[Math.floor(Math.random() * WORDS.length)]}</b>`; m.classList.add("on"); $(".pomp-grid").classList.add("poof"); }, look);
    later(() => { $(".pomp-grid").innerHTML = ""; $(".pomp-grid").classList.remove("poof"); }, look + 1300);
    later(() => { $(".pomp-magic").classList.remove("on"); help("Allt är borta … 🌫️"); }, look + 2300);
    later(reveal, look + 3600);
  };

  const reveal = () => {
    $(".pomp-grid").innerHTML = items.map((e) => e === missing ? cell("❓", "pomp-gap appear") : cell(e, "appear")).join("");
    help("En försvann! Vilken?");
    const decoys = shuffle(POOL.filter((e) => !items.includes(e))).slice(0, level);
    $(".pomp-choices").innerHTML = shuffle([missing, ...decoys]).map((e) => `<button data-e="${e}" aria-label="Gissa ${e}">${e}</button>`).join("");
    $(".pomp-choices").querySelectorAll("button").forEach((b) => b.onclick = () => guess(b));
  };

  const guess = (btn) => {
    if (btn.disabled) return;
    if (btn.dataset.e === missing) {
      streak += tries === 0 ? 1 : 0; if (tries) streak = 0; best = Math.max(best, streak);
      $(".pomp-choices").querySelectorAll("button").forEach((b) => b.disabled = true); btn.classList.add("right");
      const gap = $(".pomp-gap"); gap.textContent = missing; gap.classList.add("found");
      help(tries ? "Där var den! 🎉" : "Rätt! Du kommer ihåg allt! 🎉");
      $(".pomp-streak").innerHTML = `Rätt i rad: <b>${streak}</b> · Rekord: <b>${best}</b>`;
      const next = $("[data-next]"); next.hidden = false; next.innerHTML = `<span class="material-symbols-outlined">auto_fix_high</span> En gång till`; next.focus();
    } else {
      tries++; streak = 0; btn.disabled = true; btn.classList.add("wrong"); help("Nästan! Försök igen.");
      $(".pomp-streak").innerHTML = `Rätt i rad: <b>0</b> · Rekord: <b>${best}</b>`;
    }
  };

  render();
}
