# Zadanie: ustalenie orientacji skanów pocztówek (Jarosław, seria PT:2 + PT:6:13)

Skany pocztówek bywają w dużej części zapisane OBRÓCONE — poziome karty leżą w pionowej
ramce. Twoim zadaniem jest obejrzeć KAŻDY skan i podać, o ile stopni **zgodnie z ruchem
wskazówek zegara** trzeba go obrócić, żeby stanął prosto.

Dopuszczalne wartości: **0, 90, 180, 270**. Nic pomiędzy.

Automatyczne wykrywanie (OCR/OSD) na tych starych drukach zawodzi — **musisz obejrzeć
każdy obraz**. Nie zgaduj po nazwie pliku ani po proporcjach. NIE ZAKŁADAJ z góry, ile
skanów jest obróconych: w poprzednich zbiorach było to raz 76 %, raz 70 %, raz 40 %.

## Pliki
- Podglądy do oglądania: `/home/user/radosc-website-preview/.work-jar/review/<nazwa>.jpg`
  (dłuższy bok 460 px — do pierwszej oceny wystarczy).
- Gdy nie masz pewności, wygeneruj warianty obrotu i obejrzyj je:
  `python3 /home/user/radosc-website-preview/tools/kolekcja-jaroslaw/rotate_candidates.py <nazwa-bez-jpg>`
  → tworzy `/home/user/radosc-website-preview/.work-jar/cand/<nazwa>_90.jpg`, `_180.jpg`, `_270.jpg`
  (560 px). Możesz też podać wybrane stopnie: `... pt-2-9-b 90 270`.
  **Korzystaj z tego zawsze, gdy wahasz się między dwoma wariantami.** To jest normalna
  część pracy, nie ostateczność.

Nazwy: `pt-2-9-a` = AWERS karty PT:2:9, `pt-2-9-b` = REWERS. Jest też jedna nazwa
spoza serii PT:2 — `pt-6-13-a` / `pt-6-13-b`.

**`pt-2-51` ma TYLKO AWERS** (`pt-2-51-a`), bez rewersu. To nie jest brak w danych —
tak jest w katalogu. Nie szukaj `pt-2-51-b` i nie wpisuj go do wyniku.

## Zasady oceny

### Awers i rewers oceniaj OSOBNO
Przy kartach PIONOWYCH rewers bywa drukowany PROSTOPADLE do zdjęcia — to normalne
i zamierzone, nie błąd. Nie „dopasowuj” rewersu do awersu.

### Awers (strona z obrazem)
Kieruj się treścią zdjęcia: niebo u góry, bruk u dołu, ludzie stoją pionowo, budynki
rosną w górę, drukowany podpis pod obrazem czyta się poziomo.

W tym zbiorze awersy są w większości **dwujęzyczne, polsko-niemieckie** — podpis
„Jarosław – ul. Grunwaldzka / Grunwaldgasse”, „Rynek / Ringplatz”, „Ratusz / Rathaus”,
„Dworzec / Bahnhof”, „Gmach Sokoła / Sokol-Gebäude”, „Stary zamek / Altes Schloß”,
„Klasztor OO. Reformatów / Kloster der Reformierten Brüder” — ma się czytać poziomo.
Na jednej karcie (`pt-2-36`, wydanej w 1941 r.) obok napisu niemieckiego jest napis
**cyrylicą** („Монастир св. Анни”) — to też ma się czytać poziomo, od lewej do prawej.

Uwaga na karty **„Gruss aus Jaroslau” / „Pozdrowienie z Jarosławia”** (`pt-2-10`,
`pt-2-15`, `pt-2-23`): mają widok w ozdobnej ramce i napis ułożony ukośnie albo łukiem.
Nie kieruj się skosem napisu — rozstrzyga kierunek samego widoku (niebo u góry) i to,
że napis daje się przeczytać bez obracania głowy o 90°.

Uwaga na karty z **ożywioną sceną uliczną i targową** (Rynek, ul. Grunwaldzka,
Sobieskiego, Kraszewskiego — to większość zbioru): pionowe latarnie, słupy, krawędzie
kamienic i sylwetki przechodniów są tu najpewniejszą wskazówką. Kramy i wozy na Rynku
bywają ustawione ukośnie — to nie mówi nic o obrocie karty.

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
ramka znaczka i linie adresowe. W tym zbiorze pionowo wzdłuż linii dzielącej drukowały
się m.in. sygnatury „Salon Malarzy Polskich w Krakowie”, „Wydawnictwo Sztuka, Kraków”
z numerem „Déposé”, „A. Frey, Jarosław”, „J. Klein, Kraków”, „Ch. Schorr, Jaroslau”.

### Karty niedzielone (najwcześniejsze, ok. 1900–1906) — jest ich tu kilkanaście
Rewers ma wtedy tylko adres i drukowany nagłówek, bez pionowej linii dzielącej.
Ustaw tak, żeby nagłówek czytał się poziomo, od lewej do prawej. Nagłówki, które tu
spotkasz: `Correspondenz-Karte`, `Karta korespondencyjna`, `Kartka korespondencyjna`,
`Weltpostverein — Union postale universelle`, `Carte postale`, `Post Card`.
Na jednej karcie widnieje adnotacja „tylko na adres” / „Nur für die Adresse” — to też
linia pozioma. Austriacki znaczek 5 h albo 10 h (typ Krone / Franciszek Józef)
w prawym górnym rogu potwierdza ustawienie.

### Karty poczty polowej (Feldpost, I wojna) — bardzo częsty przypadek w tej serii
Rewersy Feldpost bywają **bez znaczka** i bez ramki znaczka. Kryteria:
- drukowany nagłówek `Feldpostkarte`, `Korespondencya poczty polowej`,
  `Tábori postai levelezőlap` ma się czytać poziomo, u góry karty;
- okrągły datownik poczty polowej i **prostokątne kaszety jednostek i cenzury**
  (`K.u.k. Militärzensur`, `Zensuriert`, `k.u.k. Reservespital`, `k.k. Landsturm-
  Marschbataillon Nr. 21`, `k.u.k. Inf.-Reg. Nr 93`, `I.M.G.A. Brief-Stempel`,
  `Von der Armee im Felde`) — tekst w kaszecie ma się czytać poziomo. Kaszet bywa
  przybity ukośnie: to nie rozstrzyga o obrocie całej karty, patrz na nagłówek
  i linie adresowe.
- Jedna karta (`pt-2-80`) ma obieg dopiero z 1940 r. jako **Feldpost II wojny** —
  rewers z niemieckim datownikiem wojskowym, bez znaczka. Ta sama zasada.

### Karty powojenne (PRL) — nowość w tym zbiorze, nie było ich w poprzednich
Zakres datowania sięga **1975 roku**, więc trafisz na rewersy o zupełnie innym układzie
niż austriackie: **bez ozdobnej ramki znaczka**, z poziomym drukiem wydawcy u dołu albo
przy lewej krawędzi — `Krajowa Agencja Wydawnicza`, `Ruch`, `Biuro Wydawnicze „Ruch”`,
`Fot. …`, numer katalogowy i nakład drobnym drukiem, czasem cena. Kolejność ważności
kryteriów:
1. drukowany tekst wydawcy / nazwisko fotografa / numer katalogowy czyta się poziomo,
2. pole na znaczek zaznaczone samym prostokątem z cienkiej kreski albo napisem
   „miejsce na znaczek” — w prawym górnym rogu,
3. linie adresowe (często same kropki albo cienkie linie) poziome, w prawej połowie.
Nie szukaj na tych kartach ramki znaczka w stylu austriackim — jej tam nie ma.

### Rewersy fotografii — w tym zbiorze jest ich dwanaście
Pozycje `pt-2-43`, `pt-2-44`, `pt-2-45`, `pt-2-46`, `pt-2-48`, `pt-2-49`, `pt-2-50`,
`pt-2-52`, `pt-2-53`, `pt-2-54`, `pt-2-55` (oraz `pt-2-51`, który ma sam awers)
to nie pocztówki, tylko odbitki fotograficzne. Rewers bywa pusty, bywa z ołówkową
notatką, bywa z **nadrukiem atelier** (np. `Zakład Fotograficzny`, `Foto „Sztuka”
Jarosław`) albo z pocztówkowym nadrukiem `Post Card / Carte Postale` na papierze
fotograficznym. Kryteria:
- jest nadruk atelier albo pole znaczka → jak przy pocztówce (tekst poziomo,
  pole znaczka w prawym górnym rogu);
- jest tylko ołówkowa notatka → ustaw tak, żeby notatka czytała się poziomo,
  ale **zaznacz tę nazwę w raporcie jako niepewną** (pismo odręczne to słaba przesłanka);
- rewers zupełnie pusty i bez ŻADNEJ przesłanki → wpisz `0` i wymień tę nazwę
  w raporcie jako niepewną.

**Awersy tych fotografii** oceniaj po treści: portret atelierowy (`pt-2-54` — para,
`pt-2-51` — strażak w hełmie) ma głowę u góry; grupy strażaków i pochody PRL-owskie
mają ludzi stojących pionowo, bruk i cień u dołu, transparenty czytające się poziomo
(`Państwowy Dom Dziecka Jarosław`).

### Rysunek `pt-6-13` — jeden obiekt innego rodzaju
To nie pocztówka i nie fotografia, tylko odręczne **studium głowy konia w kiełznie**
(tusz/ołówek z lawowaniem, sepia, cienkie brązowawe podłoże). Awers: głowa konia
ma stać pionowo — uszy i grzywa u góry, chrapy i wodze u dołu. Rewers: pusty arkusz
ze **śladami taśmy/montażu** (jasny pionowy pasek po taśmie przy jednej krawędzi
i ślad kleju przy przeciwnej). Rewers nie ma żadnego druku — ustaw go tak, żeby ślady
taśmy odpowiadały krawędziom awersu, a jeśli nie potrafisz tego rozstrzygnąć,
wpisz `0` i zaznacz w raporcie jako niepewny.

## Wynik
Zapisz JSON do wskazanego pliku wyjściowego — obiekt `nazwa → stopnie`:

```json
{
  "pt-2-9-a": 90,
  "pt-2-9-b": 90,
  "pt-2-10-a": 0
}
```

Uwzględnij **wszystkie** nazwy ze swojej listy, także te z wartością `0`.

## Kontrola przed oddaniem
Po zapisaniu JSON-a **sprawdź swoją pracę**: wygeneruj podglądy po obrocie i obejrzyj je
jeszcze raz. Najprościej:

```
cd /home/user/radosc-website-preview/.work-jar
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
