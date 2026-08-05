const ICONS = ["🍓", "🐥", "⭐", "🍎", "🦋", "🌷", "⚽", "🐠"];
const shuffle = (items) => [...items].sort(() => Math.random() - .5);

export function countGame(app, hub) {
  let amount = 1, icon = "🍓", answers = [], previous = null, hintTimer, nextTimer, locked = false;
  const clearTimers = () => { clearTimeout(hintTimer); clearTimeout(nextTimer); };
  const makeAnswers = () => {
    const values = new Set([amount]);
    while (values.size < 3) values.add(Math.max(1, Math.min(10, amount + (Math.floor(Math.random() * 5) - 2))));
    answers = shuffle([...values]);
  };
  const render = () => {
    app.innerHTML = `<section class="shell count-shell"><header><span class="logo material-symbols-outlined">looks_one</span><div><p>SIFFERLEK</p><h1>Räkna</h1></div><button class="icon-btn material-symbols-outlined" data-home aria-label="Till spelhyllan">home</button></header><section class="count-game"><p class="count-prompt">Hur många finns det?</p><div class="count-items" aria-label="Räkna ${amount} föremål">${Array.from({ length: amount }, () => `<span aria-hidden="true">${icon}</span>`).join("")}</div><p class="count-help">Välj rätt siffra</p><div class="number-bank" aria-label="Sifferalternativ">${answers.map((value) => `<button class="number-button" data-number="${value}" aria-label="Siffran ${value}">${value}</button>`).join("")}</div><p class="sr-only" aria-live="polite"></p></section></section>`;
    app.querySelector("[data-home]").onclick = () => { clearTimers(); hub(); };
    app.querySelectorAll("[data-number]").forEach((button) => button.onclick = () => choose(button));
    app.querySelector(".number-button")?.focus();
    hintTimer = setTimeout(() => app.querySelector(`[data-number="${amount}"]`)?.classList.add("count-hint"), 6000);
  };
  const next = () => { clearTimers(); do { amount = 1 + Math.floor(Math.random() * 10); } while (amount === previous); previous = amount; icon = ICONS[Math.floor(Math.random() * ICONS.length)]; makeAnswers(); locked = false; render(); };
  const choose = (button) => {
    if (locked) return; clearTimeout(hintTimer); locked = true; app.querySelector(".count-hint")?.classList.remove("count-hint");
    const result = Number(button.dataset.number), live = app.querySelector("[aria-live]");
    if (result === amount) { button.classList.add("count-correct"); live.textContent = "Rätt! Bra räknat."; nextTimer = setTimeout(next, 1250); }
    else { button.classList.add("count-wrong"); live.textContent = "Prova igen."; setTimeout(() => { button.classList.remove("count-wrong"); locked = false; hintTimer = setTimeout(() => app.querySelector(`[data-number="${amount}"]`)?.classList.add("count-hint"), 6000); }, 600); }
  };
  next();
}
