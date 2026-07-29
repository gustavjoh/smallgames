# Smallgames

En liten, snabb spelhylla för enkla spel i webbläsaren. Just nu finns **Emoji
Memory**; fler spel kan läggas till utan att ändra själva spelhubben.

## Spela

Den publicerade versionen finns på
[gustavjoh.github.io/smallgames](https://gustavjoh.github.io/smallgames/).

## Lokal utveckling

Kräver Node.js 22 eller nyare.

```bash
npm install
npm run dev
```

Bygg en produktionsversion med `npm run build`.

## Lägg till ett spel

1. Lägg spelets komponent och logik i `src/games/<spel-namn>/`.
2. Lägg till en post i `src/games/registry.ts` med titel, ikon, beskrivning och
   färg.
3. Koppla spelet från spelhubben i `app/page.tsx`.

Varje spel ska hålla sin egen status lokalt och fungera med tangentbord och
mobilskärm.

## Publicering

Varje push till `main` bygger den statiska sidan och publicerar den automatiskt
via GitHub Pages. Arbetsflödet finns i
`.github/workflows/deploy-pages.yml`.
