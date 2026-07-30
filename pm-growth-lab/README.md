# PM GROWTH LAB — Formularz strategiczny

**Strategia. Technologia. Wzrost.**

Interaktywny formularz strategiczny przygotowany indywidualnie dla **Michała Elżbieciaka**
(ubezpieczenia, benefity pracownicze, ubezpieczenia grupowe, produkty SWRN).

Autor projektu: **Piotr Mądrzyk — PM Growth Lab**

---

## Do czego służy

Formularz zbiera komplet informacji potrzebnych do przygotowania:

- diagnozy obecnego modelu biznesowego,
- wyboru pierwszego produktu do promocji,
- propozycji osobnej marki produktowej (benefity bez pracodawcy),
- struktury nowej strony internetowej,
- pierwszego lejka sprzedażowego,
- planu pilotażu reklamowego i wyliczenia opłacalności,
- systemu pozyskiwania klientów generujących przychód odnawialny.

84 pytania podzielone na 9 etapów, pokazywane pojedynczo lub w małych,
logicznie powiązanych grupach. Pytania warunkowe pojawiają się wyłącznie
wtedy, gdy wynikają z wcześniejszych odpowiedzi.

---

## Pliki

```
pm-growth-lab/
├── index.html    # struktura strony (logo SVG, ekran, nawigacja, modal, toast)
├── styles.css    # cały design system (granat + turkus/błękit, responsywność)
├── script.js     # schemat 84 pytań, silnik ekranów, zapis, walidacja, eksport
└── README.md     # ten plik
```

Brak frameworków, brak zależności, brak backendu, brak plików zewnętrznych
(fonty systemowe, ikony jako własne SVG). Nic nie jest pobierane z sieci.

---

## Uruchomienie

**Lokalnie — najprościej:**
otwórz `index.html` podwójnym kliknięciem. Wszystko działa z protokołu `file://`,
łącznie z zapisem odpowiedzi i pobieraniem plików.

**Lokalnie — z serwerem (zalecane do testów mobilnych):**

```bash
cd pm-growth-lab
python3 -m http.server 8080
# → http://localhost:8080
```

**GitHub Pages:** wgraj katalog do repozytorium i włącz Pages —
strona będzie dostępna pod `https://<użytkownik>.github.io/<repo>/pm-growth-lab/`.

**Netlify:** przeciągnij katalog `pm-growth-lab` do panelu Netlify (drag & drop).
Nie jest potrzebna żadna komenda budowania — `publish directory` to ten katalog.

---

## Jak działa zapis odpowiedzi

- Każda odpowiedź zapisuje się automatycznie w `localStorage`
  (klucz `pmgl.michal.formularz.v1`) — ok. 0,35 s po ostatniej zmianie.
- Po zapisie w pasku nawigacji pojawia się potwierdzenie **„Odpowiedzi zapisane”**.
- Po ponownym wejściu strona pyta: *„Znaleźliśmy zapisane odpowiedzi.
  Chcesz kontynuować od miejsca, w którym skończyłeś?”* — do wyboru
  **Kontynuuj** albo **Zacznij od początku**.
- Dane nie są nigdzie wysyłane. Zostają wyłącznie w przeglądarce na urządzeniu.
- Link **„Wyczyść zapisane odpowiedzi”** w stopce usuwa je trwale (z potwierdzeniem).

---

## Eksport odpowiedzi

Na ekranie podsumowania dostępne są przyciski:

| Przycisk | Efekt |
|---|---|
| ZOBACZ MOJE ODPOWIEDZI | rozwija czytelne podsumowanie wszystkich odpowiedzi, etap po etapie |
| POPRAW ODPOWIEDZI | wraca do pierwszego pytania z zachowaniem wszystkich danych |
| SKOPIUJ ODPOWIEDZI | kopiuje pełny raport TXT do schowka |
| POBIERZ ODPOWIEDZI JAKO TXT | plik gotowy do wklejenia do ChatGPT lub Claude |
| POBIERZ ODPOWIEDZI JAKO JSON | pełne dane strukturalne (do dalszej obróbki) |

Nagłówek pliku TXT:

```
FORMULARZ STRATEGICZNY
MICHAŁ ELŻBIECIAK
PM GROWTH LAB
Data wypełnienia: 30.07.2026, godz. 14:05
Uzupełnienie odpowiedzi: 96%
```

Dalej wszystkie pytania i odpowiedzi pogrupowane w 9 etapów.

---

## Etapy

1. Michał i jego działalność (pyt. 1–7)
2. SWRN i przychód odnawialny (pyt. 8–21)
3. Produkty, które warto promować (pyt. 22–32)
4. Grupy klientów (pyt. 33–39)
5. Sprzedaż i obsługa leadów (pyt. 40–50)
6. Marka i komunikacja (pyt. 51–61)
7. Obecne kanały i nowy Facebook (pyt. 62–70)
8. Fundacja i działalność społeczna (pyt. 71–76)
9. Cele i budżet (pyt. 77–84)

---

## Obsługa i dostępność

- **Enter** — przejście do następnego ekranu (w polach wielolinijkowych: **Ctrl/⌘ + Enter**).
- **Esc** — zamknięcie okna dialogowego.
- Pełna obsługa klawiatury i czytelny fokus na każdym elemencie.
- Poprawne etykiety `label` oraz role ARIA dla grup wyboru i macierzy.
- Responsywność: telefon (od 320 px), tablet, komputer — bez przewijania w poziomie.
- Na telefonie przyciski mają min. 48–54 px wysokości, a pasek nawigacji
  respektuje `safe-area` (nie chowa się pod paskiem systemowym).
- `prefers-reduced-motion` wyłącza animacje przejść.

---

## Typy pytań w formularzu

| Typ | Zastosowanie |
|---|---|
| pojedynczy wybór | pytania zamknięte, zawsze z opcją „nie wiem / muszę sprawdzić” |
| wielokrotny wybór | obszary działalności, grupy klientów, kanały (z limitem wyboru, np. maks. 3) |
| pole tekstowe / opisowe | odpowiedzi otwarte, z chipsami *Muszę sprawdzić / Omówię podczas spotkania / Nie dotyczy* |
| skala 1–10 | ocena roboczej nazwy „Benefity bez etatu” |
| macierz | np. „czy dostajesz informację, gdy klient…” — wiersz × tak / nie / nie wiem |
| ranking | produkty o największym potencjale, ustawiane w kolejności |
| lista pozycji | produkty SWRN i stawki prowizji — dowolna liczba wierszy |

---

## Walidacja

Bez komunikatów o błędach. Gdy brakuje kluczowej informacji, pojawia się
spokojny komunikat:

> Potrzebujemy tej informacji, żeby prawidłowo policzyć model biznesowy.

Pola opisowe i uzupełniające są opcjonalne — formularz nigdy nie blokuje
przejścia dalej z powodu drobiazgu.

---

## Modyfikacje

Cała treść formularza to jedna tablica `SCREENS` na początku `script.js`.
Aby dodać, usunąć lub zmienić pytanie, wystarczy edytować ten fragment —
numeracja pytań (`n`), warunki (`showIf`), etapy i eksport dostosują się same.

Kolory i typografia: zmienne CSS w `:root` w `styles.css`.
