# ETAP 5.8 — lightbox zdjęć i ekspozycja social media (Bistro)

## Kadr Bufetu (przejęte z 5.7.1, potwierdzone w 5.8)
Kadr główny kolażu: `bufet-dania-na-wage` (oryginał bez zmian).
Kadrowanie przez CSS: kontener `aspect-ratio:1/1` na desktopie
(`16/10` ≤640 px) + `object-position:50% 100%` — widoczny pas źródła
y = 600–1800/1800, ciemna szyba osłony (y ≈ 0–520) całkowicie poza kadrem
(0% powierzchni). W lightboxie otwiera się pełny, nieprzycięty oryginał.

## Duplikat wnętrza (przejęte z 5.7.1)
`bistro-wnetrze-kwiaty-1000` występuje wyłącznie w „O Bistro".
Trzeci kadr paska „Wnętrze i atmosfera": `catering-event-goscie-1000`
(wieczorne przyjęcie przy wspólnym stole w samym Bistro).

## Lightbox (`js/lightbox.js`, ~8,5 KB bez kompresji)
Własny moduł bez zależności; inicjalizacja strzeżona flagą
`window.__RADOSC_LIGHTBOX__`. Grupy (`data-lb` na `<figure>`):

| Grupa | Zdjęcia | Liczba |
|---|---|---|
| `sniadania` | sniadanie-stol | 1 |
| `bufet` | bufet-dania-na-wage, bufet-cieple-dodatki, bufet-swieze-salatki | 3 |
| `kawa` | herbata-rozgrzewajaca | 1 |
| `desery` | deser-slodki, deser-ciasto | 2 |
| `weekend` | danie-glowne | 1 |
| `kuchnia` | lunch-dnia, lunch-zupa, pasta-domowa | 3 |
| `o-bistro` | bistro-wnetrze-kwiaty-1000 | 1 |
| `wnetrze` | bistro-stol, serwis-talerze, catering-event-goscie-1000 | 3 |
| `realizacje` (ETAP 6.1, strona Realizacje) | 14 kart galerii; lista nawigacji liczona przy otwarciu wyłącznie z kart widocznych w aktywnym filtrze | 14 |

Uwaga (ETAP 6.0): grupa `social` przestała istnieć — miniatury sekcji
„Z życia Bistro" są linkami do profili FB/IG, nie otwierają lightboxa.
ETAP 6.1: miniatura „Codziennie w Radości" = `mini-codziennie`
(kadr 4:5 z sniadanie-stol; plik mini-radosc usunięty), podpis trzeciej
miniatury zmieniony uczciwie na „Pizza prosto z pieca" (w repo nie ma
zdjęcia kulis pracy kuchni). Lightbox dostał dyskretne strzałki
poprzednie/następne w pasku podpisu (aktywne tylko w grupach >1 zdjęcia,
wyłączane na końcach — bez zapętlania) i pętlę fokusu obejmującą X oraz
strzałki. Blok social przy Menu Weekendowym odchudzony do jednego
zdania z linkiem „Sprawdź aktualności".

Zasady: nawigacja wyłącznie w obrębie grupy (bez zapętlania, licznik
„2 / 3"); pojedyncze zdjęcie = brak licznika i brak nawigacji. Mobile:
swipe lewo/prawo = następne/poprzednie, swipe w dół lub X lub tap w tło
= zamknięcie; scroll strony zablokowany (`body.lb-open`). Desktop: klik
otwiera, drag myszką zmienia, Esc/tło/X zamyka, strzałki ←/→ działają
z klawiatury; bez wielkich strzałek w UI. Dostępność: `role="dialog"`,
`aria-modal`, fokus na X po otwarciu, pętla fokusu w modalu, powrót
fokusu do figury otwierającej, figury mają `role="button"` + `tabindex`
+ `aria-label`, Enter/Spacja otwiera; `prefers-reduced-motion`
respektowane. Afordancja: kursor zoom-in + dyskretna lupka na hoverze
(desktop); bez ikon na mobile, bez tekstu „kliknij, aby powiększyć".

## Social media (statyczne — bez feedów, skryptów Meta i iframe'ów)
Prawdziwe profile (jedyne używane URL-e):
- Facebook: https://www.facebook.com/bistro.pelneradosci
- Instagram: https://www.instagram.com/bistro.pelneradosci

Wszystkie linki: `target="_blank"` + `rel="noopener noreferrer"` + polskie
`aria-label`.

Miejsca na stronie Bistro:
1. **Sekcja główna `#z-zycia-bistro`** (między „Z kuchni" a „O Bistro"):
   3 pionowe miniatury 640 px (`mini-lunch` = danie-lunch-2,
   `mini-pizza` = pizza-piec-2, `mini-radosc` = plater-przystawki —
   żadne nie występuje nigdzie indziej na Bistro) + 2 przyciski CTA.
   Podpisy uczciwe: „Codzienne lunche", „Prosto z pieca", „Dzieje się dziś".
   Bez fałszywego interfejsu IG, bez polubień, bez przycisku play.
2. **Zaproszenie kontekstowe — Bufet**: linijka z linkiem do Facebooka.
3. **Zaproszenie kontekstowe — Desery**: linijka z linkiem do Instagrama.
4. **Finał `#badz-na-biezaco`** (po FAQ, przed stopką): krótki blok
   z dwoma przyciskami.
5. Istniejące wcześniej: przyciski przy Menu weekendowym (kontekst:
   ogłoszenie startu) i ikony w stopce.

## Kawa — uwaga na przyszłość
Docelowo po nowej sesji zdjęciowej uzupełnić sekcję o wysokiej jakości
kadr kawy lub ekspresu. Obecna herbata: AKCEPTOWALNE TYMCZASOWO (audyt).

## Wyniki testów (ETAP 5.8, lokalny Chromium na plikach identycznych
z artefaktem — sumy SHA-256 weryfikowane w logu workflow)
- 83/83 PASS: viewporty 360×800/390×844/430×932/768×1024/1024×768/
  1280×800/1440×900 (0 px poziomego scrolla, 0 uszkodzonych obrazów,
  konsola czysta, 0×404), hamburger 5/5 (otwarcie+zamknięcie),
  bottom sheet 5/5, kotwice 7/7, lightbox 20+ asercji (grupy, licznik,
  granice grupy, swipe/drag, Esc/tło/X, fokus, scroll-lock, race,
  proporcje, reduced-motion, dopasowanie do viewportu 360/1440),
  `__MAIN_JS_EXECUTIONS__ === 1`, `navigationInitialized === true`,
  `contentReady === true`, `noindex, nofollow` nietknięty.
- Wydajność: CLS 0,017 @390 / 0,001 @1440; LCP 180–208 ms (localhost);
  transfer całej strony z pełnym scrollem ~2,19 MB (wzrost o ~184 KB:
  3 miniatury WebP 640 px + 8,4 KB lightbox.js).
