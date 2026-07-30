# Zadanie: ustalenie orientacji skanów pocztówek

Skany pocztówek zostały w większości zapisane OBRÓCONE — poziome karty leżą w pionowej
ramce. Twoim zadaniem jest obejrzeć KAŻDY skan i podać, o ile stopni **zgodnie z ruchem
wskazówek zegara** trzeba go obrócić, żeby stanął prosto.

Dopuszczalne wartości: **0, 90, 180, 270**. Nic pomiędzy.

Automatyczne wykrywanie (OCR/OSD) na tych starych drukach zawodzi — **musisz obejrzeć
każdy obraz**. Nie zgaduj po nazwie pliku ani po proporcjach.

## Pliki
- Podglądy do oglądania: `/home/user/radosc-website-preview/.work/review/<nazwa>.jpg`
  (dłuższy bok 460 px — do pierwszej oceny wystarczy).
- Gdy nie masz pewności, wygeneruj warianty obrotu i obejrzyj je:
  `python3 /home/user/radosc-website-preview/.work/rotate_candidates.py <nazwa-bez-jpg>`
  → tworzy `/home/user/radosc-website-preview/.work/cand/<nazwa>_90.jpg`, `_180.jpg`, `_270.jpg`
  (560 px). Możesz też podać wybrane stopnie: `... pt-7-1-b 90 270`.
  **Korzystaj z tego zawsze, gdy wahasz się między dwoma wariantami.** To jest normalna
  część pracy, nie ostateczność.

Nazwy: `pt-7-1-a` = AWERS karty PT:7:1, `pt-7-1-b` = REWERS.

## Zasady oceny

### Awers i rewers oceniaj OSOBNO
Przy kartach PIONOWYCH rewers bywa drukowany PROSTOPADLE do zdjęcia — to normalne
i zamierzone, nie błąd. Nie „dopasowuj" rewersu do awersu.

### Awers (strona z obrazem)
Kieruj się treścią zdjęcia: niebo u góry, ziemia/bruk u dołu, ludzie stoją pionowo,
budynki rosną w górę, woda jest pozioma, drukowany podpis pod obrazem czyta się poziomo.

### Rewers (strona adresowa) — najważniejsze
Rozstrzygaj po **druku i układzie**, a **NIE po kierunku odręcznego pisma** (autorzy
pisali na kartach pod różnymi kątami, także w poprzek).

Poprawnie ustawiony rewers pocztówki ma jednocześnie:
1. **ramkę znaczka (albo naklejony znaczek) w PRAWYM GÓRNYM rogu**,
2. **linie adresowe poziome, w prawej połowie karty**,
3. **drukowany tekst wydawcy / cenę / numer wydawniczy czytający się poziomo**
   (u dołu lub po lewej stronie).

Jeżeli te trzy rzeczy zgadzają się jednocześnie — orientacja jest dobra.
Uwaga: tekst wydawcy bywa CELOWO wydrukowany pionowo wzdłuż pionowej linii dzielącej
kartę (czyta się go z dołu do góry) — to nie znaczy, że karta jest obrócona. Rozstrzyga
ramka znaczka i linie adresowe.

Gdy znaczka ani linii nie ma (rewers czysty, karta nieobiegowa), decyduj po drukowanym
tekście wydawcy: ma się czytać normalnie, poziomo.

### Rewersy fotografii z zestawu „Pamiątka z Warszawy" (pt-8-55…pt-8-65-b)
To wąskie paski z samą pieczątką „FOT. J. KRYWULT – WARSZAWA / prawa autorskie
i reprodukcji zastrzeżone". Kryterium jedyne: tekst ma się czytać poziomo, od lewej
do prawej, nie do góry nogami.

### Karty jednodzielne (najwcześniejsze, ~1900–1905)
Rewers ma wtedy tylko adres i napis „Carte Postale" — ustaw tak, żeby drukowany napis
„Carte Postale" / „Wsiemirnyj Pocztowyj Sojuz" czytał się poziomo.

## Wynik
Zapisz JSON do wskazanego pliku wyjściowego — obiekt `nazwa → stopnie`:

```json
{
  "pt-7-1-a": 90,
  "pt-7-1-b": 90,
  "pt-8-9-a": 0
}
```

Uwzględnij **wszystkie** nazwy ze swojej listy, także te z wartością `0`.

## Kontrola przed oddaniem
Po zapisaniu JSON-a **sprawdź swoją pracę**: wygeneruj podglądy po obrocie i obejrzyj je
jeszcze raz. Najprościej:

```
cd /home/user/radosc-website-preview/.work
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

W raporcie końcowym podaj: ile plików oceniono, rozkład wartości (ile 0 / 90 / 180 / 270)
oraz listę nazw, co do których nadal masz wątpliwość. Nie wklejaj całego JSON-a.
