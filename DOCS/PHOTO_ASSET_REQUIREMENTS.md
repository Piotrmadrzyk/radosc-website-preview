# Wymagania fotograficzne — brakujące zdjęcia sekcji

Stan na ETAP 5.7: sekcje Bistro (Śniadania, Bufet, Kawa, Desery, Menu
weekendowe) dostały docelowe układy wizualne. Tam, gdzie autentyczne zdjęcie
istnieje, jest już osadzone (`.bm-figure`). Tam, gdzie zdjęcia wciąż brakuje,
w HTML stoi **widoczny, zaprojektowany placeholder** (`.bm-ph`, złota
przerywana ramka + „Zdjęcie już wkrótce") oznaczony komentarzem
`<!-- TODO: zastąpić zdjęciem własnym — ... -->`. Podmiana = wstawienie
`<figure class="bm-figure ...">` z plikiem w miejsce `div.bm-ph`.

Wspólne wymagania: JPEG (konwersję do WebP robimy skryptem), min. 1600 px po
dłuższym boku (sloty renderują do ~1200 px), naturalne światło dzienne spójne
z resztą sesji, bez logotypów osób trzecich. Prawa do zdjęć: wyłącznie własne
materiały właścicielki/wykonawcy sesji.

| Sekcja | Plik docelowy | Miejsce w HTML | Kadr / treść | Orientacja | Proporcja | Alt | Status |
|---|---|---|---|---|---|---|---|
| Śniadania (Bistro) — kadr główny | `assets/img/sniadanie-jajka.jpg` | `bistro.html` → `#sniadania`, placeholder `.bm-ph.r45` | gotowe śniadanie z karty (np. jajka, pajda na zakwasie) na stole przy oknie | pionowa | 4:5 | „Śniadanie z jajkami i pajdą chleba na zakwasie" | **obowiązkowe — placeholder na żywo** |
| Śniadania (Bistro) — detal | `assets/img/sniadanie-detal.jpg` | `bistro.html` → `#sniadania`, placeholder `.bm-ph.sm.r219` (ukryty ≤900 px) | detal: pieczywo / jajka / kawa śniadaniowa | pozioma | 21:9 (kadrowane z 4:3) | „Pieczywo, jajka i kawa do śniadania w Bistro" | opcjonalne |
| Bufet (Bistro) | `assets/img/bufet-dania-na-wage.jpg` | `bistro.html` → `#bufet`, trzeci kadr kolażu `.bm-ph.sm.r43` | lada/bemary z daniami dnia, talerz nakładany przez gościa | pozioma | 4:3 | „Bufet z daniami dnia w Bistro Pełne Radości" | **obowiązkowe — placeholder na żywo** |
| Kawa (Bistro) | `assets/img/kawa-espresso.jpg` | `bistro.html` → `#kawa`, placeholder `.bm-ph.r169` | filiżanka z naszego ekspresu na stoliku, zieleń oranżerii w tle | pozioma | 16:9 | „Filiżanka kawy podana w Bistro" | **obowiązkowe — placeholder na żywo** |
| Herbata / matcha | `assets/img/matcha-herbata.jpg` | opcjonalny drugi kadr w `#kawa` | matcha latte lub herbata w szkle | pionowa | 3:4 | „Matcha latte w Bistro Pełne Radości" | opcjonalne |
| Desery (Bistro) — witryna | `assets/img/deser-witryna.jpg` | `bistro.html` → `#desery`, placeholder `.bm-ph.sm.r219` pod listą | witryna słodkości z sernikami/ciastami dnia | pozioma | 21:9 (kadrowane z 4:3) | „Witryna z sernikiem i ciastami przygotowanymi przez Bistro" | **obowiązkowe — placeholder na żywo** |
| Burgery (Pizza) | `assets/img/burger-classic.jpg` | `pizza.html` → `#burgery`, zakomentowany `PHOTO-SLOT` | burger z frytkami z karty, zbliżenie | pozioma | 4:3 | „Burger z frytkami podany w Bistro" | **obowiązkowe** |

Zdjęcia już osadzone w ETAPIE 5.7 (nie wymagają działań):
`lunch-dnia` + `lunch-zupa` (kolaż Bufetu), `deser-slodki` (Desery),
`danie-glowne` (Menu weekendowe), `danie-lunch-2` + `pasta-domowa` +
`serwis-talerze` (Z kuchni), `bistro-stol` + `bistro-wnetrze-kwiaty-1000`
(Wnętrze / O Bistro).

Po dostarczeniu plików:
1. wrzucić JPEG do `assets/img/`,
2. wygenerować WebP (skrypt sharp — jakość 76–82, jak reszta),
3. podmienić `div.bm-ph` na `<figure class="bm-figure ...">` wg komentarza TODO,
4. sprawdzić `width`/`height` w tagu względem realnych proporcji pliku,
5. przejść test regresji (brak 404, brak CLS).
