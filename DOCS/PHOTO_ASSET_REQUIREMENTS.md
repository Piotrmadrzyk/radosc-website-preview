# Wymagania fotograficzne — brakujące zdjęcia sekcji

Stan na ETAP 5.6.1: w repozytorium są wyłącznie zdjęcia lunchowe, pizzy,
wnętrza i eventowe. **Brakuje dedykowanych zdjęć: bufetu na wagę, śniadań,
kawy, herbaty/matchy, deserów i burgerów.** Sekcje zostały zaprojektowane tak,
żeby wyglądały dobrze bez zdjęcia; w HTML czekają gotowe, ZAKOMENTOWANE sloty
(`<!-- PHOTO-SLOT: ... -->`) — po wgraniu pliku wystarczy odkomentować blok.

Wspólne wymagania: JPEG (konwersję do WebP robimy skryptem), min. 1600 px po
dłuższym boku (sloty renderują do ~1200 px), naturalne światło dzienne spójne
z resztą sesji, bez logotypów osób trzecich. Prawa do zdjęć: wyłącznie własne
materiały właścicielki/wykonawcy sesji.

| Sekcja | Plik docelowy | Miejsce w HTML | Kadr / treść | Orientacja | Proporcja | Alt | Status |
|---|---|---|---|---|---|---|---|
| Bufet (Bistro) | `assets/img/bufet-dania-na-wage.jpg` | `bistro.html` → `#bufet`, slot przed CTA | lada bufetowa z daniami na wagę, talerz nakładany przez gościa | pozioma | 4:3 | „Bufet z daniami na wagę w Bistro Pełne Radości" | **obowiązkowe** |
| Śniadania (Bistro) | `assets/img/sniadanie-jajka.jpg` | `bistro.html` → `#sniadania`, slot nad listą menu | jedno danie śniadaniowe z karty (np. jajka, pajda) na stole przy oknie | pozioma | 4:3 | „Śniadanie z jajkami i pajdą chleba na zakwasie" | **obowiązkowe** |
| Kawa (Bistro) | `assets/img/kawa-espresso.jpg` | `bistro.html` → `#kawa`, slot nad siatką | espresso/latte na stoliku, zieleń oranżerii w tle | pozioma | 4:3 | „Espresso i kawa mleczna na stole w Bistro" | obowiązkowe |
| Herbata / matcha | `assets/img/matcha-herbata.jpg` | opcjonalny drugi kadr w `#kawa` (dodać analogiczny slot) | matcha latte lub herbata w szkle | pionowa | 3:4 | „Matcha latte w Bistro Pełne Radości" | opcjonalne |
| Desery (Bistro) | `assets/img/deser-witryna.jpg` | `bistro.html` → `#desery`, slot nad listą | witryna/deska z deserem dnia (mamy tylko bezy z sesji lunchowej — używane gdzie indziej) | pozioma | 4:3 | „Witryna z deserami dnia w Bistro" | **obowiązkowe** |
| Burgery (Pizza) | `assets/img/burger-classic.jpg` | `pizza.html` → `#burgery`, slot nad listą menu | burger z frytkami z karty, zbliżenie | pozioma | 4:3 | „Burger z frytkami podany w Bistro" | **obowiązkowe** |

Po dostarczeniu plików:
1. wrzucić JPEG do `assets/img/`,
2. wygenerować WebP (skrypt sharp — jakość 82, jak reszta),
3. odkomentować odpowiedni blok `PHOTO-SLOT`,
4. sprawdzić `width`/`height` w tagu względem realnych proporcji pliku,
5. przejść test regresji (brak 404, brak CLS).
