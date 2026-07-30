# Dane źródłowe podstrony /kolekcja/jaroslaw/

Skrypty i dane, z których złożono stronę. Same skany nie są tu trzymane —
oryginały leżą na Dysku Google, a wersje wynikowe w
`assets/kolekcja/img_jaroslaw/` i `assets/kolekcja/thumbs_jaroslaw/`.

Zakres: **58 pozycji, 115 skanów, lata 1900–1975**.
Filtr po kolumnie **`miasto` = „Jarosław”**, nie po folderze źródłowym.

| co | ile |
|---|---|
| rekordów z miastem „Jarosław” w katalogu | 117 |
| z tego PT (na stronie) | 58 — 57 × PT:2 + PT:6:13 |
| z tego DZF:9 / DZF:4 / DZF:6 (pominięte) | 34 / 14 / 11 = 59 |
| skanów | 115 (57 kart × 2 + PT:2:51 z jednym skanem) |

Serie **DZF to fotografie zakładowe** (foldery B. Henner, Henryk Probstein,
Zigler, W. Rosenbluth, Adolf Frey) — materiał na osobny projekt, tu pominięty.

## Gdzie leżą oryginały na Dysku

Folder nadrzędny „FAC2 DZF PT” (`1lG8HpMUo6kJ35D-w1udUtGBo2EZiybFF`), a w nim:

- **„FAC2 PT2 Jarosław JPG”** `1_ecs__8f5MmNsS9kcDIRo4JZBYVBrTBs` — 113 plików.
  Wbrew obawom folder zawiera **dokładnie** jarosławski podzbiór serii PT:2;
  skanów Jasła, Lwowa, Częstochowy ani kart „kora brzozy” tam nie ma.
- **PT:6:13** — `1rwdvbOBOqt3ygIcjrJu-iY1fdsf95CUc` (awers) i
  `1Et7WU7cDKZ7N7HVJDG-mKcCq2IMHKtm6` (rewers), oba w folderze
  **„FAC2 PT6 Kora Brzozy JPG”** `1EQ1wZCjcy7T4QyOxrimk_tcb7k6UD1cy`.
  **Nie ma go w „FAC2 PT6 Różne JPG”** (`1CXN-…`) — ten folder zawiera wyłącznie
  PT:6:28–38. Patrz „Pułapki” niżej.

## Pliki

| plik | co zawiera |
|---|---|
| `rotations.json` | **najważniejszy plik.** Obrót każdego ze 115 skanów w stopniach zgodnie z ruchem wskazówek zegara (0/90/180/270). Ustalony wizualnie, skan po skanie, osobno dla awersu i rewersu — automatyczne wykrywanie (tesseract OSD) na tych drukach zawodzi. Rozkład: 31 × 0, 83 × 90, 1 × 270; obrotu wymaga 84 ze 115 skanów. |
| `noty.json` | 58 not kuratorskich: tytuł, atrybucja, datowanie, technika, tekst noty. Plik scalony i po poprawkach — to on trafia do `build_page.py`. |
| `noty_fixes.json` | poprawki redakcyjne nanoszone na scalone noty przy kontroli globalnej. Podagenci piszący noty nie widzą się nawzajem, więc kolizje tytułów przy kartach z tym samym motywem wychodzą dopiero po scaleniu — a w tym zbiorze sama ul. Grunwaldzka wraca kilkanaście razy. |
| `jar_pc.json` | 58 rekordów katalogowych po filtrze — wejście dla not i dla `build_page.py`. |
| `extract_catalog.py` | filtr katalogu z kontrolą luk w serii, kart jednostronnych i sygnatur spoza Jarosławia. |
| `classify.py` | przypisanie każdej sygnatury do jednego motywu i jednej epoki + kontrola pokrycia (uruchom, żeby zobaczyć liczebności i sprawdzić, że żadna karta nie wypada poza zasięg filtrów ani żadna etykieta nie jest pusta). |
| `decode.py` | dekodowanie base64 z wyników `mcp__Google_Drive__download_file_content` do plików `.jpg` — z dysku na dysk, bez wciągania base64 do kontekstu. Przypisuje wynik po polu `id`, nie po kolejności wywołań. |
| `make_review.py` | małe podglądy (460 px) do oceny orientacji przez podagentów. |
| `rotate_candidates.py` | warianty obrotu jednego skanu — do rozstrzygania wahań 90 vs 270. |
| `merge_rotations.py` | scala cząstkowe oceny w `rotations.json` **i porównuje scalenie z plikami źródłowymi** (patrz „Pułapki”). Komplet nazw bierze z `.work-jar/expected.json`, więc brak `pt-2-51-b` nie jest błędem. |
| `merge_notes.py` | scala cząstkowe noty, nanosi `noty_fixes.json` i robi kontrolę globalną (długości, duplikaty tytułów, zakazane słowa, powtarzalne początki, a dodatkowo: czy obiekt o `typ` = fotografia/rysunek nie został nazwany „pocztówką”). |
| `build_images.py` | generuje pliki wynikowe z nieobróconych oryginałów: 1700 px q86 (pełne) i 560 px q80 (miniatury). |
| `build_page.py` | składa `kolekcja/jaroslaw/index.html` z katalogu, `classify.py` i not. Obsługuje kartę jednostronną. |
| `contact_sheets.py` | arkusze stykowe 5×4 z podpisaną sygnaturą — do końcowej kontroli orientacji. |
| `check_page.py` | kontrola gotowego HTML-a: liczba kart, komplet skanów wg kolumny `skany`, pokrycie filtrów, poprawność karty jednostronnej, brak `object-fit: cover`. |
| `check_browser.py` | Playwright: filtry z licznikami, powiększenie, odwracanie, karta jednostronna, wejście z adresu, proporcje na content-box po wymuszeniu `loading="eager"`, mobile 390 px, konsola. |
| `NOTES_BRIEF.md`, `ROT_BRIEF.md` | instrukcje, wg których powstały noty i oceny orientacji. Przekazywane podagentom dosłownie. |

## Odtworzenie strony

Skrypty oczekują nieobróconych oryginałów w `.work-jar/orig/` (nazwy `pt-2-1-a.jpg`,
`pt-2-1-b.jpg`, …, `pt-6-13-a.jpg`) oraz katalogu kolekcji jako `.work-jar/jar_pc.json`.

```
python3 extract_catalog.py <FAC2_katalog.xlsx>   # -> jar_pc.json + kontrole
python3 decode.py --scan <katalog-wyników-MCP>   # base64 z Dysku -> .work-jar/orig
python3 make_review.py                           # podglądy do oceny orientacji
#   … ocena orientacji przez podagentów wg ROT_BRIEF.md -> .work-jar/rot_out/*.json
python3 merge_rotations.py                       # -> rotations.json + kontrola scalenia
python3 build_images.py                          # oryginały + rotations.json -> pliki wynikowe
#   … noty przez podagentów wg NOTES_BRIEF.md -> .work-jar/notes_out/*.json
python3 merge_notes.py                           # -> noty.json + kontrola globalna
python3 build_page.py                            # katalog + klasyfikacja + noty -> index.html
python3 contact_sheets.py                        # arkusze kontrolne — OBEJRZEĆ WSZYSTKIE
python3 check_page.py                            # kontrola gotowego HTML-a
python3 check_browser.py                         # kontrola w przeglądarce
```

`build_images.py` jest idempotentny z definicji: źródłem jest zawsze nietknięta
migawka oryginałów w `.work-jar/orig/`, a obrót bierze się z `rotations.json`.
Dwukrotne uruchomienie nie obróci obrazu podwójnie ani nie skompresuje go drugi raz.

## Pułapki, na które trzeba uważać

- **PT:6:13 nie leży tam, gdzie mówi kolumna `folder_źródłowy`.** Katalog podaje
  folder „Jarosław W. Rosenbluth”, ale para skanów tego rysunku jest w folderze
  **„FAC2 PT6 Kora Brzozy JPG”**. W folderze Rosenblutha leży co innego pod myloną
  nazwą: plik **`PT:6:13b.jpg` (`1VRh4aSQOlxwsga2D5mSkXzNbkS6M2UEE`) to w istocie
  rewers portretu ślubnego DZF:6:13** — z nadrukiem „Zakład Fotograficzny
  W. Rosenbluth w Jarosławiu”, a jego awers nosi tam nazwę `DZF:6:13a.jpg`.
  Rozstrzygnięcie wymagało obejrzenia obu par: właściwe PT:6:13 to studium głowy
  konia z rewersem ze śladami taśmy, dokładnie jak opisuje katalog.
- **Seria PT:2 jest mieszana.** Jarosław to numery 1–55 i 79–80; 56–58 to karty
  „kora brzozy” bez miasta, 59 to Lwów, 60 Częstochowa, 61–78 Jasło. Filtrowanie
  po zakresie sygnatur da zły zbiór — filtruj po kolumnie `miasto`.
- **`folder_źródłowy` kłamie także inaczej:** 14 rekordów z miastem „Jarosław”
  siedzi w folderze „Przemyśl Henner”, a nazwy folderów mają warianty różniące się
  normalizacją Unicode (`ś` jako U+015B vs `s` + U+0301), więc grupowanie po nich
  rozjeżdża się cicho.
- **PT:2:51 ma tylko awers.** Cały potok musi to przetrwać: pobieranie, ocena
  orientacji, `build_images`, `build_page`, siatka i lightbox. Karta nie dostaje
  `data-back`, nie ma przycisku odwracania, ma adnotację „tylko awers”, a `app.js`
  ma funkcję `hasBack()` chroniącą powiększenie (podmiana obrazu, przycisk,
  wstępne wczytanie drugiej strony, skrót `F`). `check_page.py` i `check_browser.py`
  sprawdzają to osobno.
- **Nie scalaj ocen orientacji przed ostatnim raportem podagenta.** Podagenci robią
  obowiązkowy drugi przebieg kontrolny i NADPISUJĄ swój plik JSON poprawkami.
  Scalenie w trakcie bierze wersje sprzed poprawek. Dlatego `merge_rotations.py`
  po scaleniu jeszcze raz czyta pliki źródłowe i porównuje je z wynikiem.
- **Kolizja nazw plików przy równoległym pobieraniu z Dysku.** Nazwa pliku wyniku
  MCP zawiera znacznik czasu o rozdzielczości, która przy jednoczesnych wywołaniach
  potrafi się powtórzyć — jeden wynik nadpisuje drugi i oba skany giną. Zawsze
  sprawdzaj kompletność po `decode.py` i licz md5 wszystkich plików (dwa identyczne
  pliki pod różnymi nazwami = pomylone przypisanie). W tym przebiegu kolizja nie
  wystąpiła: 115 plików, 115 różnych sum md5.

## Znane wątpliwości w danych źródłowych

- **`pt-2-43-b`** — skan rewersu jest wąskim paskiem 505 × 1600 px, podczas gdy
  awers to 1600 × 1178 px poziomo. To fragment, nie cały rewers; orientacja
  (napis ołówkiem „JAROSŁAW” poziomo) jest poprawna, ale sam skan na Dysku jest
  niepełny. Do przeskanowania na nowo.
- **`pt-6-13-b`** — rewers rysunku jest pustym arkuszem ze śladami taśmy; rozróżnienie
  0° od 180° nie jest rozstrzygalne. Wpisano 0.
- **`pt-2-44-b`, `pt-2-46-b`, `pt-2-48-b`, `pt-2-50-b`, `pt-2-52-b`, `pt-2-54-b`,
  `pt-2-55-b`** — rewersy fotografii bez druku wydawcy; orientację ustalono po
  kierunku ołówkowej notatki, co jest słabszą przesłanką niż druk. Wszystkie
  zgadzają się z orientacją własnego awersu.

## Zasady, które trzeba zachować przy zmianach

- Skan pokazujemy w całości, w naturalnych proporcjach. `object-fit: cover`
  jest zakazany. Obrys passe-partout robi `outline`, a nie `border`, żeby nie
  wchodził w pomiar proporcji.
- Awers i rewers ocenia się osobno. Przy kartach pionowych rewers bywa
  drukowany prostopadle do zdjęcia i to jest poprawne — w tym zbiorze dotyczy to
  PT:2:47 i PT:2:54.
- Lata w filtrze to data **wydania** karty, nie data stempla. W tym zbiorze te dwie
  daty rozjeżdżają się częściej niż gdzie indziej (nakład 1918 — obieg 1940).
  Gdy katalog podaje przedział przechodzący przez granicę epok, karta stoi przy
  dolnej granicy przedziału.
- Epoka `enn` („datowanie nieustalone”) jest dla trzech pozycji, przy których katalog
  pisze samo „1 poł. XX w.” i nie skłania się w żadną stronę. Nie wolno ich cicho
  wcisnąć do „do 1914” — to byłoby zmyślenie precyzji, której katalog nie ma.
- Noty opierają się wyłącznie na katalogu. Niepewność katalogu zostaje
  niepewnością i ma być widoczna w tekście.
- Trzynaście obiektów nie jest pocztówkami (dwanaście odbitek i jeden rysunek).
  Noty mają je nazywać po imieniu; `merge_notes.py` to sprawdza.
- Uwagi handlowe z kolumny `opis_PL` (premium, ceny, „DO DECYZJI”) nie trafiają
  na stronę.
