# Radość — podgląd nowej strony głównej

Działający prototyp strony głównej **Bistro Pełne Radości**, zbudowany 1:1 na
podstawie zatwierdzonej makiety **ETAP 3D.1 — Final Polish** („świetlista
oranżeria”). Czysty HTML + CSS + JavaScript — bez frameworka, bez backendu,
bez sekretów.

## Adresy

- **Repozytorium:** https://github.com/Piotrmadrzyk/radosc-website-preview
- **Publiczny podgląd (GitHub Pages):** https://piotrmadrzyk.github.io/radosc-website-preview/
- **Gałąź publikowana przez Pages:** `preview/redesign-2026` (gałąź domyślna)
- **Gałąź `main`:** istnieje jako główna linia; podgląd publikuje się z `preview/redesign-2026`

Domena produkcyjna **restauracjaradosc.pl NIE jest podłączona** — to wyłącznie
wersja podglądowa (strona ma `noindex`).

## Struktura

```
├── index.html          — strona główna (hero + sekcje zapowiedzi)
├── bistro.html         — podstrona Bistro
├── pizza.html          — podstrona Pizza (kategorie menu, jak zamówić)
├── catering.html       — podstrona Catering (oferta, proces, formularz)
├── realizacje.html     — podstrona Realizacje (filtry JS)
├── kontakt.html        — podstrona Kontakt (dane, formularz, mapa)
├── polityka-prywatnosci.html
├── css/
│   ├── fonts.css       — lokalne fonty Fraunces + Inter (latin + latin-ext)
│   └── styles.css      — style: hero desktop/mobile, sekcje, responsywność
├── js/main.js          — menu mobilne, nagłówek, animacje, walidacja formularzy, filtry
├── assets/fonts/       — pliki woff2
├── assets/img/         — biblioteka prawdziwych zdjęć (dania, pizza, bufety, serwis, eventy)
├── screenshots/        — zrzuty z publicznego adresu po wdrożeniu
└── .github/workflows/deploy-pages.yml — automatyczne wdrożenie Pages
```

Wszystkie ścieżki w projekcie są względne, więc strona działa poprawnie
z podkatalogu `/radosc-website-preview/`.

## Uruchomienie lokalne

Nie ma kroku build — dowolny statyczny serwer:

```bash
python3 -m http.server 8131
# → http://localhost:8131
```

## Wysyłanie kolejnych zmian

Każdy push do `preview/redesign-2026` automatycznie aktualizuje ten sam
publiczny link (workflow `deploy-pages.yml`):

```bash
git checkout preview/redesign-2026
# ...edycja plików...
git add -A && git commit -m "opis poprawki"
git push origin preview/redesign-2026
```

## Sprawdzenie wdrożenia (GitHub Actions)

- Zakładka **Actions** w repozytorium: https://github.com/Piotrmadrzyk/radosc-website-preview/actions
- Workflow „Deploy GitHub Pages” — zielony status = podgląd zaktualizowany.
- Wdrożenie trwa zwykle ok. 1 minuty od pusha.

## Dalsza praca

Poprawki zlecaj Claude Code w tej samej sesji/projekcie — edytuje pliki,
testuje lokalnie (zrzuty w 5 szerokościach ekranu), commituje i wypycha na
`preview/redesign-2026`; link pozostaje ten sam.

## Treści — dane do potwierdzenia

Na stronie celowo NIE ma niepotwierdzonych danych (adres, godziny, telefon,
statystyki, zakres ZEN). Formularz kontaktowy jest demonstracyjny (bez
wysyłki). Przed publikacją produkcyjną:

- uzupełnić prawdziwe dane kontaktowe i godziny otwarcia,
- podłączyć wysyłkę formularza,
- potwierdzić zgody wizerunkowe do obu zdjęć (jak w ETAPIE 3D),
- usunąć `<meta name="robots" content="noindex">`.
