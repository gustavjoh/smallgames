const levels = { easy: ["Lätt", "4 × 4", 8], medium: ["Mellan", "4 × 6", 12], hard: ["Svår", "6 × 6", 18] };
const emojis = ["🍓", "🦊", "🌈", "🪐", "🍄", "🐳", "🦋", "🍉", "🌻", "🦄", "🎈", "🐸", "🍩", "🌵", "🚀", "🐙", "🍒", "🦖"];
const colors = ["#ec5d78", "#5a83e8", "#9b73e9", "#e5a23d"];

const shuffle = (items) => [...items].sort(() => Math.random() - .5);
const deck = (pairs) => shuffle(emojis.slice(0, pairs).flatMap((emoji, index) => [{ id: index * 2, emoji }, { id: index * 2 + 1, emoji }]));

export function memoryGame(app, hub) {
  let level = "easy", players = 1, cards = [], flipped = [], scores = [], current = 0, locked = false;
  const renderSetup = () => {
    app.innerHTML = `<section class="shell"><header><span class="logo material-symbols-outlined">extension</span><div><p>SPELKVÄLL</p><h1>Memory</h1></div><button class="icon-btn material-symbols-outlined" data-home aria-label="Till spelhyllan">home</button></header>
      <div class="setup"><div class="intro"><span class="material-symbols-outlined">auto_awesome</span><h2>Hitta alla par</h2><p>Välj utmaning och antal spelare. Redo att testa minnet?</p></div>
      <fieldset><legend>Svårighetsgrad</legend><div class="choices">${Object.entries(levels).map(([key, [name, size]]) => `<button class="${level === key ? "selected" : ""}" data-level="${key}"><strong>${name}</strong><small>${size}</small></button>`).join("")}</div></fieldset>
      <fieldset><legend>Antal spelare</legend><div class="choices players">${[1,2,3,4].map(n => `<button class="${players === n ? "selected" : ""}" data-players="${n}"><span class="material-symbols-outlined">group</span><strong>${n}</strong></button>`).join("")}</div></fieldset>
      <button class="primary" data-start><span class="material-symbols-outlined">play_arrow</span>Starta spel</button></div></section>`;
    app.querySelector("[data-home]").onclick = hub;
    app.querySelectorAll("[data-level]").forEach(button => button.onclick = () => { level = button.dataset.level; renderSetup(); });
    app.querySelectorAll("[data-players]").forEach(button => button.onclick = () => { players = Number(button.dataset.players); renderSetup(); });
    app.querySelector("[data-start]").onclick = start;
  };
  const start = () => { cards = deck(levels[level][2]); flipped = []; scores = Array(players).fill(0); current = 0; locked = false; renderGame(); };
  const renderGame = () => {
    const scoreHtml = scores.map((score, i) => `<div class="score ${current === i ? "active" : ""}" style="--color:${colors[i]}"><span>Spelare ${i + 1}</span><strong>${score}<small> par</small></strong></div>`).join("");
    app.innerHTML = `<section class="shell"><header><span class="logo material-symbols-outlined">extension</span><div><p>SPELKVÄLL</p><h1>Memory</h1></div><button class="icon-btn material-symbols-outlined" data-home aria-label="Till spelhyllan">home</button></header>
      <section class="play"><div class="game-info"><b>${levels[level][0]} · ${levels[level][1]}</b><span><i style="background:${colors[current]}"></i>Spelare ${current + 1}s tur</span></div><div class="scores">${scoreHtml}</div><div class="board ${level}">${cards.map(card => { const face = flipped.includes(card.id) || card.matched; return `<button class="memory ${face ? "flipped" : ""} ${card.matched ? "matched" : ""}" data-card="${card.id}" ${locked || card.matched ? "disabled" : ""} aria-label="${face ? `Kort ${card.emoji}` : "Vänd kort"}"><span><em class="back material-symbols-outlined">question_mark</em><em class="front">${card.emoji}</em></span></button>`; }).join("")}</div></section></section>`;
    app.querySelector("[data-home]").onclick = hub;
    app.querySelectorAll("[data-card]").forEach(button => button.onclick = () => flip(Number(button.dataset.card)));
  };
  const flip = (id) => {
    if (locked || flipped.includes(id) || cards.find(card => card.id === id).matched) return;
    flipped.push(id); renderGame();
    if (flipped.length < 2) return;
    locked = true;
    const [one, two] = flipped.map(id => cards.find(card => card.id === id));
    const matched = one.emoji === two.emoji;
    setTimeout(() => {
      if (matched) { cards = cards.map(card => card.id === one.id || card.id === two.id ? { ...card, matched: true } : card); scores[current]++; }
      else current = (current + 1) % players;
      flipped = []; locked = false; renderGame();
      if (cards.every(card => card.matched)) setTimeout(winner, 300);
    }, matched ? 620 : 950);
  };
  const winner = () => {
    const best = Math.max(...scores), winners = scores.map((score, i) => score === best ? i + 1 : null).filter(Boolean);
    const modal = document.createElement("div"); modal.className = "modal";
    modal.innerHTML = `<div><span class="material-symbols-outlined">emoji_events</span><p>OMGÅNGEN ÄR KLAR</p><h2>${winners.length === 1 ? `Spelare ${winners[0]} vinner!` : "Det blev oavgjort!"}</h2><p>${winners.length === 1 ? `${best} hittade par — snyggt spelat!` : `Spelare ${winners.join(" och ")} delar förstaplatsen.`}</p><button class="secondary">Inställningar</button><button class="primary">Spela igen</button></div>`;
    document.body.append(modal); modal.querySelector(".secondary").onclick = () => { modal.remove(); renderSetup(); }; modal.querySelector(".primary").onclick = () => { modal.remove(); start(); };
  };
  renderSetup();
}
