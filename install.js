const KEY = "smallgames-install-dismissed";
let deferred = null;
const store = {
  get: () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
  set: () => { try { localStorage.setItem(KEY, "1"); } catch (e) {} },
};
const standalone = () => navigator.standalone === true || (window.matchMedia && matchMedia("(display-mode: standalone)").matches);
const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; document.dispatchEvent(new Event("install-ready")); });

export function installBanner(container) {
  const old = document.querySelector(".install-banner"); if (old) old.remove();
  if (standalone() || store.get()) return;
  const ios = isIos();
  if (!ios && !deferred) { document.addEventListener("install-ready", () => installBanner(container), { once: true }); return; }
  const el = document.createElement("div");
  el.className = "install-banner"; el.setAttribute("role", "note");
  el.innerHTML = `<span class="install-icon" aria-hidden="true">📲</span><p><b>Spara som app</b>${ios ? "Tryck på <em>Dela</em>-knappen i Safari och välj <em>Lägg till på hemskärmen</em>." : "Lägg spelen på startskärmen så öppnas de som en riktig app."}</p>${ios ? "" : '<button class="install-go" type="button">Installera</button>'}<button class="install-close" type="button" aria-label="Stäng">✕</button>`;
  container.append(el);
  el.querySelector(".install-close").onclick = () => { store.set(); el.remove(); };
  const go = el.querySelector(".install-go");
  if (go) go.onclick = () => { deferred.prompt(); deferred.userChoice.then(() => { deferred = null; store.set(); el.remove(); }); };
}
addEventListener("appinstalled", () => { store.set(); const b = document.querySelector(".install-banner"); if (b) b.remove(); });
