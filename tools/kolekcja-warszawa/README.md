# Dane źródłowe podstrony /kolekcja/warszawa/

Skrypty i dane, z których złożono stronę. Same skany nie są tu trzymane —
oryginały leżą na Dysku Google („FAC2 DZF PT”), a wersje wynikowe w
`assets/kolekcja/img_warszawa/` i `assets/kolekcja/thumbs_warszawa/`.

## Pliki

| plik | co zawiera |
|---|---|
| `rotations.json` | **najważniejszy plik.** Obrót każdego z 294 skanów w stopniach zgodnie z ruchem wskazówek zegara (0/90/180/270). Ustalony wizualnie, skan po skanie, osobno dla awersu i rewersu — automatyczne wykrywanie (tesseract OSD) na tych drukach zawodzi. 206 z 294 wymagało obrotu. |
| `noty.json` | 147 not kuratorskich: tytuł, atrybucja, datowanie, technika, tekst noty, przypisany motyw i przedział lat. |
| `classify.py` | przypisanie każdej sygnatury do jednego motywu i jednej epoki + kontrola pokrycia (uruchom, żeby zobaczyć liczebności). |
| `build_images.py` | generuje pliki wynikowe z nieobróconych oryginałów: 1700 px q86 (pełne) i 560 px q80 (miniatury). |
| `build_page.py` | składa `kolekcja/warszawa/index.html` z katalogu, `classify.py` i not. |
| `contact_sheets.py` | arkusze stykowe 5×4 z podpisaną sygnaturą — do kontroli orientacji. |
| `make_review.py`, `rotate_candidates.py` | podglądy używane przy ustalaniu orientacji. |
| `NOTES_BRIEF.md`, `ROT_BRIEF.md` | instrukcje, wg których powstały noty i oceny orientacji. |

## Odtworzenie strony

Skrypty oczekują nieobróconych oryginałów w `.work/orig/` (nazwy `pt-7-1-a.jpg`,
`pt-7-1-b.jpg`, …) oraz katalogu kolekcji jako `war_pc.json`; ścieżki są ustawione
na górze każdego skryptu.

```
python3 build_images.py          # oryginały + rotations.json -> pliki wynikowe
python3 build_page.py            # katalog + klasyfikacja + noty -> index.html
python3 contact_sheets.py        # arkusze kontrolne
```

`build_images.py` jest idempotentny z definicji: źródłem jest zawsze nietknięta
migawka oryginałów, a obrót bierze się z `rotations.json`. Dwukrotne uruchomienie
nie obróci obrazu podwójnie ani nie skompresuje go drugi raz.

## Zasady, które trzeba zachować przy zmianach

- Skan pokazujemy w całości, w naturalnych proporcjach. `object-fit: cover`
  jest zakazany.
- Awers i rewers ocenia się osobno. Przy kartach pionowych rewers bywa
  drukowany prostopadle do zdjęcia i to jest poprawne.
- Lata w filtrze to data **wydania** karty, nie data stempla ani moment
  wykonania zdjęcia.
- Noty opierają się wyłącznie na katalogu. Niepewność katalogu zostaje
  niepewnością i ma być widoczna w tekście.
