import { memoryGame } from "./games/memory/game.js";
import { spellingGame } from "./games/stavning/game.js";
import { countGame } from "./games/rakna/game.js";

const app = document.querySelector("#app");

function hub() {
  app.innerHTML = `
    <section class="shell"><header><span class="logo material-symbols-outlined">sports_esports</span><div><p>VÄLJ ETT SPEL</p><h1>Smallgames</h1></div></header>
    <div class="intro"><span class="material-symbols-outlined">celebration</span><h2>Små spel, stor spelglädje.</h2><p>Välj en favorit och börja spela direkt. Fler spel dyker upp här allt eftersom.</p></div>
    <div class="library"><article class="game-tile"><i>🧠</i><div><h2>Memory</h2><p>Hitta par snabbast och samla flest poäng.</p></div><button data-game="memory"><span class="material-symbols-outlined">play_arrow</span>Spela</button></article>
    <article class="game-tile spelling-tile"><i>✏️</i><div><h2>Stavning</h2><p>Se emojin och bygg ordet bokstav för bokstav.</p></div><button data-game="spelling"><span class="material-symbols-outlined">play_arrow</span>Spela</button></article>
    <article class="game-tile count-tile"><i>🔢</i><div><h2>Räkna</h2><p>Räkna emojier och välj rätt siffra.</p></div><button data-game="count"><span class="material-symbols-outlined">play_arrow</span>Spela</button></article></div></section>`;
  app.querySelector("[data-game='memory']").addEventListener("click", () => memoryGame(app, hub));
  app.querySelector("[data-game='spelling']").addEventListener("click", () => spellingGame(app, hub));
  app.querySelector("[data-game='count']").addEventListener("click", () => countGame(app, hub));
}

hub();
