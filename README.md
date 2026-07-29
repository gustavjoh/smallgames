# Smallgames

En samling små spel som kör direkt i webbläsaren. Ingen installation, server
eller byggmiljö krävs för att spela.

## Spela

[Öppna Smallgames](https://gustavjoh.github.io/smallgames/)

## Innehåll

- `index.html` – spelhyllan
- `app.js` – navigation mellan spelen
- `styles.css` – gemensam design
- `games/` – ett spel per mapp

För att lägga till ett nytt spel skapas en ny mapp i `games/` med dess HTML-
rendering och logik. Lägg sedan till spelets kort i `app.js`.

GitHub Pages publicerar filerna direkt från `main`.
