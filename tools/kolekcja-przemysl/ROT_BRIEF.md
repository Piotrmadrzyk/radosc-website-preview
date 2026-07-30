# Zadanie: ustalenie orientacji skanów pocztówek (Przemyśl, seria PT:1)

Skany pocztówek zostały w większości zapisane OBRÓCONE — poziome karty leżą w pionowej
ramce. Twoim zadaniem jest obejrzeć KAŻDY skan i podać, o ile stopni **zgodnie z ruchem
wskazówek zegara** trzeba go obrócić, żeby stanął prosto.

Dopuszczalne wartości: **0, 90, 180, 270**. Nic pomiędzy.

Automatyczne wykrywanie (OCR/OSD) na tych starych drukach zawodzi — **musisz obejrzeć
każdy obraz**. Nie zgaduj po nazwie pliku ani po proporcjach.

## Pliki
- Podglądy do oglądania: `/home/user/radosc-website-preview/.work-prz/review/<nazwa>.jpg`
  (dłuższy bok 460 px — do pierwszej oceny wystarczy).
- Gdy nie masz pewności, wygeneruj warianty obrotu i obejrzyj je:
  `python3 /home/user/radosc-website-preview/tools/kolekcja-przemysl/rotate_candidates.py <nazwa-bez-jpg>`
  → tworzy `/home/user/radosc-website-preview/.work-prz/cand/<nazwa>_90.jpg`, `_180.jpg`, `_270.jpg`
  (560 px). Możesz też podać wybrane stopnie: `... pt-1-9-b 90 270`.
  **Korzystaj z tego zawsze, gdy wahasz się między dwoma wariantami.** To jest normalna
  część pracy, nie ostateczność.

Nazwy: `pt-1-9-a` = AWERS karty PT:1:9, `pt-1-9-b` = REWERS.

## Zasady oceny

### Awers i rewers oceniaj OSOBNO
Przy kartach PIONOWYCH rewers bywa drukowany PROSTOPADLE do zdjęcia — to normalne
i zamierzone, nie błąd. Nie „dopasowuj” rewersu do awersu.

### Awers (strona z obrazem)
Kieruj się treścią zdjęcia: niebo u góry, ziemia/bruk u dołu, ludzie stoją pionowo,
budynki rosną w górę, woda (San) jest pozioma, drukowany podpis pod obrazem czyta się
poziomo. W tym zbiorze awersy bywają dwujęzyczne (polski + niemiecki) — podpis
„Przemyśl – …” / „Przemyśl. Franz Josefs-Quai” ma się czytać poziomo.

Uwaga na karty **wielowidokowe** i **„Gruss aus”** (PT:1:9–19, 37, 56, 73, 81, 100):
mają kilka medalionów w secesyjnej ramce, ułożonych ukośnie. Nie kieruj się skosem
ramki — rozstrzyga napis „Gruss aus Przemyśl” / „Pozdrowienie z Przemyśla” i kierunek
poszczególnych widoków (niebo u góry).

Uwaga na karty **forteczne i wojenne** (Twierdza Przemyśl, wysadzone forty, mosty na
Sanie): rumowisko betonu bywa nieczytelne kompozycyjnie. Szukaj linii horyzontu, pól
i zabudowań w tle oraz drukowanego podpisu („Ein zerschossenes Fort”, „Zerstörte
Sanbrücke”, „Fort X. 10 P. Batt.”). Przy zdjęciach fortów sylwetki żołnierzy
i pochylenie kopuły pancernej to słabe przesłanki — najpewniejszy jest podpis.

### Rewers (strona adresowa) — najważniejsze
Rozstrzygaj po **druku i układzie**, a **NIE po kierunku odręcznego pisma** (autorzy
pisali na kartach pod różnymi kątami, także w poprzek).

Poprawnie ustawiony rewers pocztówki ma jednocześnie:
1. **ramkę znaczka (albo naklejony znaczek) w PRAWYM GÓRNYM rogu**,
2. **linie adresowe poziome, w prawej połowie karty**,
3. **drukowany tekst wydawcy / numer wydawniczy czytający się poziomo**
   (u dołu lub po lewej stronie).

Jeżeli te trzy rzeczy zgadzają się jednocześnie — orientacja jest dobra.
Uwaga: tekst wydawcy bywa CELOWO wydrukowany pionowo wzdłuż pionowej linii dzielącej
kartę (czyta się go z dołu do góry) — to nie znaczy, że karta jest obrócona. Rozstrzyga
ramka znaczka i linie adresowe.

### Karty niedzielone (najwcześniejsze, 1898–1905) — w tym zbiorze jest ich sporo
Rewers ma wtedy tylko adres i drukowany nagłówek. Ustaw tak, żeby nagłówek czytał się
poziomo, od lewej do prawej. Nagłówki, które tu spotkasz:
`Correspondenz-Karte`, `Karta korespondencyjna`, `Weltpostverein — Union postale
universelle`, `Carte postale`, `Levelező-lap`. Znaczek austriacki 2 krajcary / 5 halerzy
w prawym górnym rogu potwierdza ustawienie.

### Karty poczty polowej (Feldpost, I wojna) — częsty przypadek w tej serii
Rewersy Feldpost bywają **bez znaczka** i bez ramki znaczka. Kryteria:
- drukowany nagłówek `Feldpostkarte`, `Tábori postai levelezőlap`, `Korespondencya
  poczty polowej` ma się czytać poziomo, u góry karty;
- okrągły datownik poczty polowej i **prostokątne kaszety cenzury**
  (`K.u.K. Militärzensur Przemyśl`, `Zensuriert k.u.k. Lemberg`, `k.u.k.
  Garnisonsspital Nr. 3 in Przemyśl`) — tekst w kaszecie ma się czytać poziomo.
  Kaszet bywa przybity ukośnie: to nie rozstrzyga o obrocie całej karty, patrz na
  nagłówek i linie adresowe.

### Rewersy fotografii (PT:1:1, PT:1:2, PT:1:3, PT:1:45)
To nie są pocztówki, tylko odbitki fotograficzne. Rewers bywa pusty albo ma tylko
stempel inwentarzowy (`HEERESMUSEUM WIEN — LICHTBILDER-INVENTAR, L.B.I. No. …`)
lub nadruk papieru (`Agfa Lupex`). Kryterium jedyne: tekst stempla/nadruku ma się
czytać poziomo, od lewej do prawej, nie do góry nogami. Gdy rewers jest zupełnie pusty
i nie ma ŻADNEJ przesłanki — wpisz `0` i wymień tę nazwę w raporcie jako niepewną.

## Wynik
Zapisz JSON do wskazanego pliku wyjściowego — obiekt `nazwa → stopnie`:

```json
{
  "pt-1-9-a": 90,
  "pt-1-9-b": 90,
  "pt-1-10-a": 0
}
```

Uwzględnij **wszystkie** nazwy ze swojej listy, także te z wartością `0`.

## Kontrola przed oddaniem
Po zapisaniu JSON-a **sprawdź swoją pracę**: wygeneruj podglądy po obrocie i obejrzyj je
jeszcze raz. Najprościej:

```
cd /home/user/radosc-website-preview/.work-prz
python3 - <<'EOF'
import json, os
from PIL import Image, ImageOps
rot=json.load(open('rot_out/<TWÓJ_PLIK>.json'))
os.makedirs('verify', exist_ok=True)
for k,d in rot.items():
    im=ImageOps.exif_transpose(Image.open(f'orig/{k}.jpg')).rotate(-int(d), expand=True)
    w,h=im.size; s=420.0/max(w,h)
    im.resize((int(w*s),int(h*s))).convert('RGB').save(f'verify/{k}.jpg','JPEG',quality=72)
print(len(rot))
EOF
```
…a potem obejrzyj `verify/*.jpg` (możesz partiami) i popraw wpisy, które nie wyszły.
Ten drugi przebieg jest OBOWIĄZKOWY — na nim wychodzi większość pomyłek 90 vs 270.
Po poprawkach **NADPISZ swój plik JSON** i dopiero wtedy zgłoś zakończenie. Nikt nie
scala wyników przed Twoim ostatnim raportem, więc nie spiesz się z oddaniem.

W raporcie końcowym podaj: ile plików oceniono, rozkład wartości (ile 0 / 90 / 180 / 270)
oraz listę nazw, co do których nadal masz wątpliwość. Nie wklejaj całego JSON-a.
