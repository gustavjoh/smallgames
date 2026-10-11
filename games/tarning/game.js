const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const COLORS = ["#e96b80", "#f1a34a", "#6dab77", "#6679c4", "#8f6bd1", "#ffd45c"];
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const roll = () => 1 + Math.floor(Math.random() * 6);
const face = (value) => `<span class="die-face">${Array.from({ length: 9 }, (_, i) => `<i${PIPS[value].includes(i) ? ' class="pip"' : ""}></i>`).join("")}</span>`;
let count = 2;

function fireworks() {
  if (reducedMotion()) return;
  const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d"), dpr = devicePixelRatio || 1;
  canvas.className = "fireworks"; document.body.append(canvas);
  const resize = () => { canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize();
  const sparks = [], burst = (x, y) => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    for (let i = 0; i < 46; i++) { const a = Math.PI * 2 * i / 46, s = 2 + Math.random() * 3.5; sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color }); }
  };
  const bursts = 5 + Math.floor(Math.random() * 3), start = performance.now();
  for (let i = 0; i < bursts; i++) setTimeout(() => burst(innerWidth * (.15 + Math.random() * .7), innerHeight * (.12 + Math.random() * .4)), i * 260);
  const frame = (now) => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of sparks) {
      p.vx *= .97; p.vy = p.vy * .97 + .06; p.x += p.vx; p.y += p.vy; p.life -= .014;
      if (p.life <= 0) continue;
      ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2); ctx.fill();
    }
    if (now - start < bursts * 260 + 1800) requestAnimationFrame(frame); else canvas.remove();
  };
  requestAnimationFrame(frame);
}

export function diceGame(app, hub) {
  let values = [], rolling = false, done = false, rollTimer;
  const sorted = () => values.every((v, i) => i === 0 || values[i - 1] <= v);
  const sum = () => values.reduce((a, b) => a + b, 0);

  const render = () => {
    app.innerHTML = `<section class="shell dice-shell"><header><span class="logo material-symbols-outlined">casino</span><div><p>KASTA OCH SORTERA</p><h1>Tärning</h1></div><button class="icon-btn material-symbols-outlined" data-home aria-label="Till spelhyllan">home</button></header>
    <section class="dice-game"><p class="dice-label">Hur många tärningar?</p><div class="dice-count" role="group" aria-label="Antal tärningar">${[1, 2, 3, 4, 5].map((n) => `<button data-count="${n}" class="${n === count ? "selected" : ""}" aria-pressed="${n === count}">${n}</button>`).join("")}</div>
    <div class="dice-table" aria-label="Tärningar"></div><p class="dice-sum" aria-live="polite"></p><p class="dice-help"></p>
    <button class="primary dice-roll" data-roll><span class="material-symbols-outlined">casino</span> Kasta</button></section></section>`;
    app.querySelector("[data-home]").onclick = () => { clearInterval(rollTimer); hub(); };
    app.querySelectorAll("[data-count]").forEach((b) => b.onclick = () => { if (rolling) return; count = Number(b.dataset.count); values = []; render(); });
    app.querySelector("[data-roll]").onclick = throwDice;
    drawDice(); status();
  };

  const drawDice = () => {
    const table = app.querySelector(".dice-table");
    table.innerHTML = values.length
      ? values.map((v, i) => `<button class="die${done ? " die-done" : ""}" data-index="${i}" aria-label="Tärning ${i + 1} visar ${v}. Flytta med piltangenterna.">${face(v)}</button>`).join("")
      : Array.from({ length: count }, () => `<span class="die die-empty" aria-hidden="true">${face(6)}</span>`).join("");
    table.querySelectorAll("button.die").forEach(bindDrag);
  };

  const status = () => {
    const sumEl = app.querySelector(".dice-sum"), help = app.querySelector(".dice-help");
    if (!values.length) { sumEl.textContent = ""; help.textContent = "Tryck på Kasta!"; return; }
    sumEl.innerHTML = values.length > 1 ? `${values.join(" + ")} = <b>${sum()}</b>` : `<b>${values[0]}</b>`;
    help.textContent = rolling ? "" : values.length < 2 ? "Kasta igen när du vill." : done ? "Snyggt sorterat! 🎉" : "Dra tärningarna i ordning – minst först.";
  };

  const throwDice = () => {
    if (rolling) return;
    rolling = true; done = false; values = Array.from({ length: count }, roll);
    let ticks = reducedMotion() ? 0 : 8;
    app.querySelector(".dice-table").classList.add("dice-rolling");
    const tick = () => {
      if (ticks-- > 0) { values = values.map(roll); drawDice(); status(); return; }
      clearInterval(rollTimer); rolling = false;
      app.querySelector(".dice-table").classList.remove("dice-rolling");
      if (count > 1 && sorted()) { done = true; fireworks(); }
      drawDice(); status();
    };
    tick(); rollTimer = setInterval(tick, 75);
  };

  const commit = () => {
    if (!done && values.length > 1 && sorted()) { done = true; drawDice(); status(); fireworks(); app.querySelector(".dice-roll").focus(); }
  };

  const bindDrag = (die) => {
    die.onkeydown = (e) => {
      const i = Number(die.dataset.index), j = i + (e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0);
      if (j === i || j < 0 || j >= values.length || done) return;
      e.preventDefault(); [values[i], values[j]] = [values[j], values[i]]; drawDice(); status();
      app.querySelector(`[data-index="${j}"]`).focus(); commit();
    };
    die.onpointerdown = (e) => {
      if (rolling || done || values.length < 2) return;
      e.preventDefault(); die.classList.add("dragging");
      const table = die.parentElement, startX = e.clientX, startY = e.clientY, startLeft = die.offsetLeft;
      const move = (ev) => {
        if (ev.pointerId !== e.pointerId) return;
        const left = startLeft + ev.clientX - startX, center = left + die.offsetWidth / 2;
        const others = [...table.children].filter((d) => d !== die);
        const before = others.find((d) => center < d.offsetLeft + d.offsetWidth / 2);
        if (before ? die.nextElementSibling !== before : table.lastElementChild !== die) table.insertBefore(die, before || null);
        die.style.transform = `translate(${left - die.offsetLeft}px, ${ev.clientY - startY}px) scale(1.08)`;
      };
      const up = (ev) => {
        if (ev.pointerId !== e.pointerId) return;
        removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
        values = [...table.children].map((d) => values[Number(d.dataset.index)]);
        drawDice(); status(); commit();
      };
      addEventListener("pointermove", move); addEventListener("pointerup", up); addEventListener("pointercancel", up);
    };
  };

  render();
}
