const WORDS = [["☀️","SOL"],["🚗","BIL"],["🐱","KATT"],["🐟","FISK"],["🍦","GLASS"],["🐶","HUND"],["🌙","MÅNE"],["🍌","BANAN"],["🍎","ÄPPLE"],["🐸","GRODA"],["🐭","MUS"],["🦊","RÄV"],["🌸","ROS"],["🐮","KALV"],["🏠","HUS"],["🚀","RAKET"],["🦋","MAL"],["🍓","BÄR"],["🐳","VAL"],["🎈","BOLL"]];
const DISTRACTORS = "ABCDEFGHIKLMNOPRSTUVYÅÄÖ".split("");
const shuffle = (items) => [...items].sort(() => Math.random() - .5);

function pickWord(previous) { const choices = WORDS.filter(([, word]) => word !== previous); return choices[Math.floor(Math.random() * choices.length)]; }
function letterPool(word) {
  const needed = word.split(""), extras = [];
  while (extras.length < needed.length) { const letter = DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)]; if (!needed.includes(letter) || !extras.includes(letter)) extras.push(letter); }
  return shuffle([...needed, ...extras]).map((letter, index) => ({ id: `${letter}-${index}`, letter }));
}

export function spellingGame(app, hub) {
  let emoji = "", word = "", pool = [], position = 0, hintTimer, nextTimer;
  const clearTimers = () => { clearTimeout(hintTimer); clearTimeout(nextTimer); };
  const scheduleHint = () => { clearTimeout(hintTimer); hintTimer = setTimeout(() => { const next = pool.find((item) => item.letter === word[position]); app.querySelector(`[data-letter-id="${next?.id}"]`)?.classList.add("needs-hint"); }, 6000); };
  const render = () => {
    const slots = word.split("").map((letter, index) => `<span class="word-slot ${index < position ? "filled" : ""} ${index === position ? "current" : ""}">${index < position ? letter : ""}</span>`).join("");
    app.innerHTML = `<section class="shell spelling-shell"><header><span class="logo material-symbols-outlined">spellcheck</span><div><p>ORDLEK</p><h1>Stavning</h1></div><button class="icon-btn material-symbols-outlined" data-home aria-label="Till spelhyllan">home</button></header><section class="spelling-game" aria-label="Stava ordet"><p class="spell-prompt">Vilket ord är det?</p><div class="word-emoji" aria-hidden="true">${emoji}</div><div class="word-slots" aria-label="Ordet som ska stavas">${slots}</div><p class="letter-help">Tryck på bokstäverna i rätt ordning</p><div class="letter-bank" aria-label="Bokstavsalternativ">${pool.map((item) => `<button class="letter-button" data-letter-id="${item.id}" aria-label="Bokstaven ${item.letter}">${item.letter}</button>`).join("")}</div></section></section>`;
    app.querySelector("[data-home]").onclick = () => { clearTimers(); hub(); };
    app.querySelectorAll("[data-letter-id]").forEach((button) => button.onclick = () => choose(button)); scheduleHint();
  };
  const nextRound = () => { clearTimers(); [emoji, word] = pickWord(word); pool = letterPool(word); position = 0; render(); };
  const celebrate = () => { const panel = app.querySelector(".spelling-game"); panel.classList.add("word-complete"); const message = document.createElement("div"); message.className = "spell-celebration"; message.innerHTML = `<span class="material-symbols-outlined">celebration</span><strong>Bra stavat!</strong>`; panel.append(message); nextTimer = setTimeout(nextRound, 1500); };
  const choose = (button) => {
    if (button.disabled) return; clearTimeout(hintTimer); app.querySelector(".needs-hint")?.classList.remove("needs-hint"); const letter = button.textContent;
    if (letter !== word[position]) { button.classList.add("wrong-letter"); button.disabled = true; setTimeout(() => { button.classList.remove("wrong-letter"); button.disabled = false; scheduleHint(); }, 650); return; }
    button.disabled = true; button.classList.add("right-letter"); const slot = app.querySelector(".word-slot.current"), start = button.getBoundingClientRect(), end = slot.getBoundingClientRect(); const flyer = document.createElement("span"); flyer.className = "letter-flyer"; flyer.textContent = letter; flyer.style.setProperty("--x", `${end.left + end.width / 2 - start.left - start.width / 2}px`); flyer.style.setProperty("--y", `${end.top + end.height / 2 - start.top - start.height / 2}px`); button.append(flyer);
    setTimeout(() => { pool = pool.filter((item) => item.id !== button.dataset.letterId); position += 1; position === word.length ? celebrate() : render(); }, 560);
  };
  nextRound();
}
