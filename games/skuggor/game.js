const ICONS = ["🐘", "🦒", "🐢", "🐇", "🦀", "🐌", "🦋", "🐟", "🐦", "🐈", "🐕", "🐄", "🍎", "🍌", "🍐", "🥕", "🌵", "🌳", "⭐", "🌙", "☂️", "🚲", "✈️", "🚗", "🎸", "🔑", "✂️", "🏠"];
const shuffle = (items) => [...items].sort(() => Math.random() - .5);

export function shadowGame(app, hub) {
  let target = ICONS[0], options = [], previous = null, hintTimer, nextTimer, wrongTimer, locked = false, streak = 0;
  const clearTimers = () => { clearTimeout(hintTimer); clearTimeout(nextTimer); clearTimeout(wrongTimer); };
  const choicesFor = () => Math.min(5, 3 + Math.floor(streak / 5));
  const startHint = () => { hintTimer = setTimeout(() => app.querySelector(`[data-icon="${target}"]`)?.classList.add("shadow-hint"), 7000); };
  const render = () => {
    app.innerHTML = `<section class="shell shadow-shell"><header><span class="logo material-symbols-outlined">dark_mode</span><div><p>FORMLEK</p><h1>Skuggor</h1></div><button class="icon-btn material-symbols-outlined" data-home aria-label="Till spelhyllan">home</button></header><section class="shadow-game"><p class="shadow-prompt">Vems skugga är det?</p><div class="shadow-stage"><span class="shadow-figure" aria-hidden="true">${target}</span></div><p class="shadow-help">Tryck på den som passar skuggan</p><div class="shadow-bank" style="--cols:${options.length}" aria-label="Alternativ">${options.map((icon) => `<button class="shadow-button" data-icon="${icon}">${icon}</button>`).join("")}</div><p class="sr-only" aria-live="polite"></p></section></section>`;
    app.querySelector("[data-home]").onclick = () => { clearTimers(); hub(); };
    app.querySelectorAll("[data-icon]").forEach((button) => button.onclick = () => choose(button));
    startHint();
  };
  const next = () => {
    clearTimers();
    do { target = ICONS[Math.floor(Math.random() * ICONS.length)]; } while (target === previous);
    previous = target;
    options = shuffle([target, ...shuffle(ICONS.filter((icon) => icon !== target)).slice(0, choicesFor() - 1)]);
    locked = false; render();
  };
  const choose = (button) => {
    if (locked) return; clearTimeout(hintTimer); locked = true; app.querySelector(".shadow-hint")?.classList.remove("shadow-hint");
    const live = app.querySelector("[aria-live]");
    if (button.dataset.icon === target) {
      streak++; button.classList.add("shadow-correct"); app.querySelector(".shadow-stage").classList.add("revealed");
      live.textContent = "Rätt! Bra tittat."; nextTimer = setTimeout(next, 1500);
    } else {
      streak = Math.max(0, streak - 1); button.classList.add("shadow-wrong"); live.textContent = "Prova igen.";
      wrongTimer = setTimeout(() => { button.classList.remove("shadow-wrong"); locked = false; startHint(); }, 600);
    }
  };
  next();
}
