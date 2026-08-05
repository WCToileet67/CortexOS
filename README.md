# CortexOS

CortexOS to lekki, statyczny system-pulpit działający w przeglądarce. Projekt jest gotowy do wgrania na zwykły hosting statyczny — bez budowania, backendu i instalowania zależności.

## Jak uruchomić lokalnie

```bash
python3 -m http.server 4173
```

Następnie otwórz:

```text
http://127.0.0.1:4173
```

Domyślne hasło logowania: `admin`.

## Jak opublikować stronę

Wgraj zawartość tego katalogu na hosting statyczny, np. GitHub Pages, Netlify, Vercel, Cloudflare Pages albo zwykły serwer Apache/Nginx.

Minimalny zestaw plików do publikacji:

- `index.html`
- `style.css`
- `main.js`
- `config.json`
- `manifest.webmanifest`
- `sw.js`
- `offline.html`
- `brain-brainstorm-creative-svgrepo-com.svg`
- `.nojekyll` przy wdrożeniu na GitHub Pages
- katalogi `aplikacje/`, `jadro/` i `motywy/`

## Co jest już przygotowane

- aplikacja działa jako statyczna strona,
- manifest PWA pozwala dodać CortexOS do ekranu głównego,
- service worker cache'uje pliki aplikacji i pokazuje stronę offline,
- `.htaccess` ustawia typy MIME i podstawowe nagłówki bezpieczeństwa dla Apache,
- `.nojekyll` wyłącza przetwarzanie Jekyll na GitHub Pages,
- dane użytkownika są zapisywane lokalnie w `localStorage`.

## Ważne po wdrożeniu

Po publikacji otwórz stronę w trybie incognito lub wyczyść cache, jeśli nadal widzisz starszą wersję. Service worker przyspiesza działanie, ale przeglądarka może przez chwilę trzymać poprzednie pliki.
