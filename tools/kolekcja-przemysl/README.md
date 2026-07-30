# Dane źródłowe podstrony /kolekcja/przemysl/

Skrypty i dane, z których złożono stronę. Same skany nie są tu trzymane —
oryginały leżą na Dysku Google („FAC2 DZF PT” → „FAC2 PT1 ok  Przemyśl JPG”,
id `1j_D9vl9Pev4AVlb2331-_jySPDpWXmA8`), a wersje wynikowe w
`assets/kolekcja/img_przemysl/` i `assets/kolekcja/thumbs_przemysl/`.

Zakres: **104 pocztówki, sygnatury PT:1:1 – PT:1:104, bez luk, po 2 skany = 208**.
Filtr po kolumnie **`miasto` = „Przemyśl”**, nie po folderze źródłowym.
Seria **DZF:4 („Przemyśl Henner”, 39 pozycji) to fotografie z zakładu — pominięta.**

## Pliki

| plik | co zawiera |
|---|---|
| `rotations.json` | **najważniejszy plik.** Obrót każdego z 208 skanów w stopniach zgodnie z ruchem wskazówek zegara (0/90/180/270). Ustalony wizualnie, skan po skanie, osobno dla awersu i rewersu — automatyczne wykrywanie (tesseract OSD) na tych drukach zawodzi. |
| `noty.json` | 104 noty kuratorskie: tytuł, atrybucja, datowanie, technika, tekst noty. Plik scalony i po poprawkach — to on trafia do `build_page.py`. |
| `noty_fixes.json` | poprawki redakcyjne nanoszone na scalone noty przy kontroli globalnej (duplikaty tytułów, powtarzalne początki zdań). Podagenci piszący noty nie widzą się nawzajem, więc te rzeczy wychodzą dopiero po scaleniu. |
| `classify.py` | przypisanie każdej sygnatury do jednego motywu i jednej epoki + kontrola pokrycia (uruchom, żeby zobaczyć liczebności i sprawdzić, że żadna karta nie wypada poza zasięg filtrów). |
| `decode.py` | dekodowanie base64 z wyników `mcp__Google_Drive__download_file_content` do plików `.jpg` — z dysku na dysk, bez wciągania base64 do kontekstu. Przypisuje wynik po polu `id`, nie po kolejności wywołań. |
| `make_review.py` | małe podglądy (460 px) do oceny orientacji przez podagentów. |
| `rotate_candidates.py` | warianty obrotu jednego skanu — do rozstrzygania wahań 90 vs 270. |
| `merge_rotations.py` | scala cząstkowe oceny w `rotations.json` **i porównuje scalenie z plikami źródłowymi** (patrz „Pułapki” niżej). |
| `merge_notes.py` | scala cząstkowe noty, nanosi `noty_fixes.json` i robi kontrolę globalną (długości, duplikaty tytułów, zakazane słowa, powtarzalne początki). |
| `build_images.py` | generuje pliki wynikowe z nieobróconych oryginałów: 1700 px q86 (pełne) i 560 px q80 (miniatury). |
| `build_page.py` | składa `kolekcja/przemysl/index.html` z katalogu, `classify.py` i not. |
| `contact_sheets.py` | arkusze stykowe 5×4 z podpisaną sygnaturą — do końcowej kontroli orientacji. |
| `check_page.py` | kontrola gotowego HTML-a: liczba kart, komplet skanów, pokrycie filtrów, brak `object-fit: cover`. |
| `NOTES_BRIEF.md`, `ROT_BRIEF.md` | instrukcje, wg których powstały noty i oceny orientacji. Przekazywane podagentom dosłownie. |

## Odtworzenie strony

Skrypty oczekują nieobróconych oryginałów w `.work-prz/orig/` (nazwy `pt-1-1-a.jpg`,
`pt-1-1-b.jpg`, …) oraz katalogu kolekcji jako `.work-prz/prz_pc.json`.

```
python3 decode.py --scan <katalog-wyników-MCP>   # base64 z Dysku -> .work-prz/orig
python3 make_review.py                           # podglądy do oceny orientacji
#   … ocena orientacji przez podagentów wg ROT_BRIEF.md -> .work-prz/rot_out/*.json
python3 merge_rotations.py                       # -> rotations.json + kontrola scalenia
python3 build_images.py                          # oryginały + rotations.json -> pliki wynikowe
#   … noty przez podagentów wg NOTES_BRIEF.md -> .work-prz/notes_out/*.json
python3 merge_notes.py                           # -> noty.json + kontrola globalna
python3 build_page.py                            # katalog + klasyfikacja + noty -> index.html
python3 contact_sheets.py                        # arkusze kontrolne — OBEJRZEĆ WSZYSTKIE
python3 check_page.py                            # kontrola gotowego HTML-a
```

`build_images.py` jest idempotentny z definicji: źródłem jest zawsze nietknięta
migawka oryginałów w `.work-prz/orig/`, a obrót bierze się z `rotations.json`.
Dwukrotne uruchomienie nie obróci obrazu podwójnie ani nie skompresuje go drugi raz.

## Pułapki, na które trzeba uważać

- **Nie scalaj ocen orientacji przed ostatnim raportem podagenta.** Podagenci robią
  obowiązkowy drugi przebieg kontrolny i NADPISUJĄ swój plik JSON poprawkami.
  Scalenie w trakcie bierze wersje sprzed poprawek. Dlatego `merge_rotations.py`
  po scaleniu jeszcze raz czyta pliki źródłowe i porównuje je z wynikiem.
- **Kolizja nazw plików przy równoległym pobieraniu z Dysku.** Nazwa pliku wyniku
  MCP zawiera znacznik czasu o rozdzielczości, która przy jednoczesnych wywołaniach
  potrafi się powtórzyć — jeden wynik nadpisuje drugi i oba skany giną. Zawsze
  sprawdzaj kompletność po `decode.py` i dogrywaj braki pojedynczo.
- **Kolumna `folder_źródłowy` ma dwa warianty zapisu „Przemyśl”** różniące się
  normalizacją Unicode (`ś` jako U+015B vs `s`+U+0301), więc grupowanie po folderze
  rozjeżdża się na 62 + 42. Po kolumnie `miasto` jest poprawnie (wszystkie 143
  rekordy w jednej formie).

## Zasady, które trzeba zachować przy zmianach

- Skan pokazujemy w całości, w naturalnych proporcjach. `object-fit: cover`
  jest zakazany. Obrys passe-partout robi `outline`, a nie `border`, żeby nie
  wchodził w pomiar proporcji.
- Awers i rewers ocenia się osobno. Przy kartach pionowych rewers bywa
  drukowany prostopadle do zdjęcia i to jest poprawne.
- Lata w filtrze to data **wydania** karty, nie data stempla ani moment
  wykonania zdjęcia. Gdy katalog podaje przedział przechodzący przez granicę
  epok, karta stoi przy dolnej granicy przedziału.
- Noty opierają się wyłącznie na katalogu. Niepewność katalogu zostaje
  niepewnością i ma być widoczna w tekście.
- Uwagi handlowe z kolumny `opis_PL` (premium, ceny, „DO DECYZJI”) nie trafiają
  na stronę.
