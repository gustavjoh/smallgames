"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { games } from "../src/games/registry";

type Difficulty = "easy" | "medium" | "hard";
type Card = { id: number; emoji: string; matched: boolean };

const DIFFICULTIES: Record<Difficulty, { label: string; size: string; pairs: number }> = {
  easy: { label: "Lätt", size: "4 × 4", pairs: 8 },
  medium: { label: "Mellan", size: "4 × 6", pairs: 12 },
  hard: { label: "Svår", size: "6 × 6", pairs: 18 },
};

const EMOJIS = [
  "🍓", "🦊", "🌈", "🪐", "🍄", "🐳", "🦋", "🍉", "🌻", "🦄",
  "🎈", "🐸", "🍩", "🌵", "🚀", "🐙", "🍒", "🦖",
];

const PLAYER_COLORS = ["#ec5d78", "#5a83e8", "#9b73e9", "#e5a23d"];

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeDeck(pairCount: number): Card[] {
  return shuffle(EMOJIS.slice(0, pairCount).flatMap((emoji, index) => [
    { id: index * 2, emoji, matched: false },
    { id: index * 2 + 1, emoji, matched: false },
  ]));
}

export default function Home() {
  const [view, setView] = useState<"hub" | "memory">("hub");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [playerCount, setPlayerCount] = useState(1);
  const [started, setStarted] = useState(false);
  const [deck, setDeck] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [winnerVisible, setWinnerVisible] = useState(false);

  const activeDifficulty = DIFFICULTIES[difficulty];
  const gameComplete = started && deck.length > 0 && deck.every((card) => card.matched);
  const leaders = useMemo(() => {
    const bestScore = Math.max(...scores, 0);
    return scores.map((score, index) => score === bestScore ? index : -1).filter((index) => index >= 0);
  }, [scores]);

  useEffect(() => {
    if (gameComplete) {
      const timeout = window.setTimeout(() => setWinnerVisible(true), 500);
      return () => window.clearTimeout(timeout);
    }
  }, [gameComplete]);

  function startGame() {
    setDeck(makeDeck(activeDifficulty.pairs));
    setFlipped([]);
    setScores(Array.from({ length: playerCount }, () => 0));
    setCurrentPlayer(0);
    setLocked(false);
    setWinnerVisible(false);
    setStarted(true);
  }

  function openSettings() {
    setStarted(false);
    setWinnerVisible(false);
    setFlipped([]);
  }

  function returnToHub() {
    setView("hub");
    setStarted(false);
    setWinnerVisible(false);
    setFlipped([]);
  }

  function handleCardClick(card: Card) {
    if (locked || card.matched || flipped.includes(card.id) || flipped.length === 2) return;

    const nextFlipped = [...flipped, card.id];
    setFlipped(nextFlipped);

    if (nextFlipped.length !== 2) return;

    setLocked(true);
    const [firstId, secondId] = nextFlipped;
    const first = deck.find((item) => item.id === firstId);
    const second = deck.find((item) => item.id === secondId);
    const isMatch = first?.emoji === second?.emoji;

    window.setTimeout(() => {
      if (isMatch) {
        setDeck((cards) => cards.map((item) =>
          item.id === firstId || item.id === secondId ? { ...item, matched: true } : item,
        ));
        setScores((values) => values.map((score, index) =>
          index === currentPlayer ? score + 1 : score,
        ));
      } else {
        setCurrentPlayer((player) => (player + 1) % playerCount);
      }
      setFlipped([]);
      setLocked(false);
    }, isMatch ? 650 : 1050);
  }

  const visibleCard = (card: Card) => card.matched || flipped.includes(card.id);

  if (view === "hub") {
    return (
      <main className="game-shell">
        <section className="game-card game-hub" aria-label="Smallgames spelhylla">
          <header className="game-header">
            <div className="brand-mark" aria-hidden="true"><span className="material-symbols-outlined">sports_esports</span></div>
            <div><p className="eyebrow">VÄLJ ETT SPEL</p><h1>Smallgames</h1></div>
          </header>
          <div className="hub-intro">
            <span className="material-symbols-outlined sparkle" aria-hidden="true">celebration</span>
            <h2>Små spel, stor spelglädje.</h2>
            <p>Välj en favorit och börja spela direkt. Fler spel dyker upp här allt eftersom.</p>
          </div>
          <div className="game-library">
            {games.map((game) => (
              <article className="game-tile" key={game.id} style={{ "--game-accent": game.accent } as CSSProperties}>
                <span className="game-tile-icon" aria-hidden="true">{game.icon}</span>
                <div><h2>{game.title}</h2><p>{game.description}</p></div>
                <button className="play-tile-button" onClick={() => setView("memory")} aria-label={`Spela ${game.title}`}><span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>Spela</button>
              </article>
            ))}
            <article className="game-tile coming-soon" aria-label="Plats för nästa spel">
              <span className="game-tile-icon" aria-hidden="true">✨</span>
              <div><h2>Nästa spel</h2><p>En ledig plats för nästa enkla spel.</p></div>
              <span className="soon-label">Snart</span>
            </article>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="game-shell">
      <section className="game-card" aria-label="Memoryspel">
        <header className="game-header">
          <div className="brand-mark" aria-hidden="true"><span className="material-symbols-outlined">extension</span></div>
          <div>
            <p className="eyebrow">SPELKVÄLL</p>
            <h1>Emoji Memory</h1>
          </div>
          <button className="icon-button" onClick={returnToHub} aria-label="Till spelhyllan"><span className="material-symbols-outlined">home</span></button>
        </header>

        {!started ? (
          <section className="setup-panel" aria-labelledby="setup-title">
            <div className="setup-intro">
              <span className="material-symbols-outlined sparkle" aria-hidden="true">auto_awesome</span>
              <h2 id="setup-title">Hitta alla par</h2>
              <p>Välj utmaning och antal spelare. Redo att testa minnet?</p>
            </div>

            <fieldset>
              <legend>Svårighetsgrad</legend>
              <div className="choice-grid difficulty-grid">
                {(Object.entries(DIFFICULTIES) as [Difficulty, typeof activeDifficulty][]).map(([key, value]) => (
                  <button key={key} className={`choice-button ${difficulty === key ? "selected" : ""}`} onClick={() => setDifficulty(key)} aria-pressed={difficulty === key}>
                    <strong>{value.label}</strong><span>{value.size}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Antal spelare</legend>
              <div className="choice-grid player-grid">
                {[1, 2, 3, 4].map((count) => (
                  <button key={count} className={`choice-button ${playerCount === count ? "selected" : ""}`} onClick={() => setPlayerCount(count)} aria-pressed={playerCount === count}>
                    <span className="material-symbols-outlined" aria-hidden="true">group</span><strong>{count}</strong>
                  </button>
                ))}
              </div>
            </fieldset>

            <button className="primary-button" onClick={startGame}><span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>Starta spel</button>
          </section>
        ) : (
          <section className="play-panel">
            <div className="game-info">
              <span className="difficulty-pill">{activeDifficulty.label} · {activeDifficulty.size}</span>
              <p className="turn-message"><span className="turn-dot" style={{ background: PLAYER_COLORS[currentPlayer] }} />Spelare {currentPlayer + 1}s tur</p>
            </div>

            <div className={`scoreboard players-${playerCount}`} aria-label="Poängtavla">
              {scores.map((score, index) => (
                <div className={`player-score ${currentPlayer === index ? "active" : ""}`} key={index} style={{ "--player-color": PLAYER_COLORS[index] } as CSSProperties}>
                  <span>Spelare {index + 1}</span><strong>{score}<small> par</small></strong>
                </div>
              ))}
            </div>

            <div className={`board board-${difficulty}`} aria-label="Spelbräde">
              {deck.map((card) => (
                <button key={card.id} className={`memory-card ${visibleCard(card) ? "is-flipped" : ""} ${card.matched ? "is-matched" : ""}`} onClick={() => handleCardClick(card)} disabled={locked || card.matched} aria-label={visibleCard(card) ? `Kort: ${card.emoji}` : "Vänd kort"}>
                  <span className="card-inner">
                    <span className="card-face card-back"><span className="material-symbols-outlined" aria-hidden="true">question_mark</span></span>
                    <span className="card-face card-front" aria-hidden={!visibleCard(card)}>{card.emoji}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </section>

      {winnerVisible && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="winner-title">
          <section className="winner-modal">
            <span className="material-symbols-outlined trophy" aria-hidden="true">emoji_events</span>
            <p className="eyebrow">OMGÅNGEN ÄR KLAR</p>
            <h2 id="winner-title">{leaders.length === 1 ? `Spelare ${leaders[0] + 1} vinner!` : "Det blev oavgjort!"}</h2>
            <p>{leaders.length === 1 ? `${scores[leaders[0]]} hittade par — snyggt spelat!` : `${leaders.map((player) => `Spelare ${player + 1}`).join(" och ")} delar förstaplatsen.`}</p>
            <div className="modal-actions">
              <button className="secondary-button" onClick={openSettings}>Inställningar</button>
              <button className="primary-button" onClick={startGame}><span className="material-symbols-outlined" aria-hidden="true">replay</span>Spela igen</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
