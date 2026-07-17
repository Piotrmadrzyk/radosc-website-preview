# Plan globalnego dolnego przycisku „Menu" (ETAP 5.6)

> Dokument przygotowawczy — w ETAPIE 5.5.1 zachowanie przycisku NIE zostało
> zmienione. Pełny, spójny panel zostanie wdrożony w osobnym ETAPIE 5.6.

## Stan obecny (inwentaryzacja, commit bazowy b8a28e7)

Przycisk „Menu" w dolnym pasku `.mobile-cta` występuje na wszystkich 7 stronach.
Markup jest powielony per strona (wspólny wzorzec `<nav class="mobile-cta">`,
brak wspólnego komponentu). Cele linku są dziś niespójne:

| Strona | href dolnego „Menu" |
|---|---|
| index.html | `#dzis` |
| bistro.html | `#lunch-tygodnia` |
| pizza.html | `#menu` |
| catering.html | `#oferta` |
| realizacje.html | `index.html#dzis` |
| kontakt.html | `index.html#dzis` |
| polityka-prywatnosci.html | `index.html#dzis` |

Wszystkie linki technicznie działają (cele istnieją) — problemem jest
niespójność doświadczenia, nie awaria.

## Stan docelowy — bottom sheet

Po tapnięciu „Menu" na każdej stronie otwiera się ten sam dolny panel
(bottom sheet) z trzema pozycjami:

1. **Pizza i burgery** → `pizza.html#menu`
2. **Lunche i bufet** → `bistro.html#lunch-tygodnia`
3. **Menu weekendowe — wkrótce** → `bistro.html#menu-weekendowe`
   (do potwierdzenia przez właścicielkę: start „od września")

## Wymagania techniczne

- **Accessibility:** panel jako `role="dialog"` + `aria-modal="true"`,
  `aria-labelledby` na nagłówku panelu; przycisk otwierający z
  `aria-expanded` i `aria-controls`.
- **Focus trap:** po otwarciu fokus wchodzi do panelu (pierwsza pozycja),
  Tab/Shift+Tab krąży wewnątrz; po zamknięciu fokus wraca na przycisk „Menu".
- **Escape** zamyka panel (spójnie z menu mobilnym w headerze).
- Zamknięcie także: tap w tło (scrim) i przycisk zamknięcia.
- **safe-area-inset-bottom:** `padding-bottom: env(safe-area-inset-bottom)`
  na panelu i pasku `.mobile-cta` (iPhone z home indicatorem).
- **Blokada scrolla** strony pod panelem (istniejący mechanizm
  `body.menu-open`), bez przesunięcia layoutu (scrollbar compensation
  nie jest potrzebna na mobile; na desktop panel nie występuje).
- Animacja wsuwania z poszanowaniem `prefers-reduced-motion`.
- Bez nowych bibliotek — czysty HTML/CSS/JS jak reszta strony.

## Zakres ETAPU 5.6 (poza tym dokumentem)

- Wspólny markup panelu (jeden szablon wstrzykiwany na każdej stronie
  albo zduplikowany identycznie jak stopka — do decyzji przy wdrożeniu).
- Ujednolicenie href przycisku na wszystkich 7 stronach (otwiera panel).
- Testy: otwieranie/zamykanie, focus trap, Escape, safe-area, brak
  poziomego scrolla, zero błędów konsoli.
