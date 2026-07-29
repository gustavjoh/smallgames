export type GameEntry = {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  available: boolean;
};

export const games: GameEntry[] = [
  {
    id: "emoji-memory",
    title: "Emoji Memory",
    description: "Hitta par snabbast och samla flest poäng.",
    icon: "🧠",
    accent: "#e46582",
    available: true,
  },
];
