# Zadanie: noty kuratorskie do prywatnej galerii pocztówek jarosławskich

Piszesz po polsku noty do kart z prywatnej kolekcji (zbiór 58 pozycji z Jarosławia
z lat 1900–1975; oś zbioru: galicyjskie miasto handlowe i kolejowe → I wojna, poczta
polowa i cenzura k.u.k. → II RP → okupacja → PRL). To najdłuższy zakres czasu ze
wszystkich podstron tej kolekcji i jedyny sięgający lat 70. Strona jest prywatna,
kolekcjonerska, nie sklep.

## Wejście
Plik JSON z rekordami katalogowymi. Pola:
- `sygnatura` — identyfikator karty (nie zmieniaj)
- `motyw` — dział, do którego karta trafiła na stronie (kontekst, nie przepisuj)
- `tytul_katalogowy`, `nakladca_fotograf`, `obiekt`, `datowanie`, `typ`, `stan`,
  `uwagi_katalogu`, `slowa_kluczowe`
- `obiekt` to najbogatsze pole: opisuje awers I REWERS (znaczek, datownik, adresat,
  treść wiadomości, kaszety cenzury, numery wydawnicze, ołówkowe zapiski). Stamtąd
  bierz historię.

## Wyjście
Czysty JSON — tablica obiektów, po jednym na każdą sygnaturę z wejścia, w tej samej
kolejności. Zapisz go do wskazanego pliku wyjściowego. Każdy obiekt:

```
{
  "sygnatura": "PT:2:8",
  "tytul": "...",              // 3–7 słów
  "meta_wydawca": "...",       // do ~45 znaków
  "meta_data": "...",          // do ~26 znaków
  "sig_typ": "...",            // do ~60 znaków
  "nota": "..."                // 2–4 zdania, 220–420 znaków
}
```

### `tytul` — 3–7 słów
- BEZ słowa „Jarosław”.
- NIE zaczynaj od „Pocztówka”, „Karta”, „Widok”, „Fotografia”.
- Konkretny, rzeczowy, po polsku. Może wskazywać miejsce, obiekt, sytuację albo
  szczegół, który wyróżnia tę kartę spośród sąsiednich.
- **W tym zbiorze bardzo wiele kart powtarza ten sam motyw** — sama ul. Grunwaldzka
  (Grunwaldgasse) wraca kilkanaście razy, Rynek (Ringplatz) osiem razy,
  ul. Sobieskiego i Kraszewskiego po kilka. Karty niemal identyczne MUSZĄ mieć RÓŻNE
  tytuły — różnicuj po detalu widocznym na awersie (Apteka pod Gwiazdą, klomb
  i latarnia, budynek Casino, magazyn „Turnheim”, automobil, kramy, parowóz),
  po wydawcy, roku nakładu, technice (litografia barwna vs światłodruk cz-b),
  po obiegu (poczta polowa, cenzura, adresat) albo po numerze wydawniczym.
  To jest główne zadanie przy tytułach, nie dodatek.

### `meta_wydawca` — krótka atrybucja
Np. `Wyd. Sztuka, Kraków`, `Salon Malarzy Polskich, Kraków`, `A. Frey, Jarosław`,
`J. Klein, Kraków`, `Ch. Schorr, Jarosław`, `Współczesna Sztuka, Przemyśl`,
`Druk „Akropol”, Kraków`, `Foto „Sztuka”, Jarosław`, `Nakładca nieustalony`.
Skracaj, nie przepisuj całości.

### `meta_data` — krótka data
Np. `1902`, `1908`, `1915`, `ok. 1901–1905`, `1918`, `1941`, `1975`,
`międzywojnie`, `1 poł. XX w.`. Jeśli katalog waha się — zostaw wahanie w formie
`ok.` albo zakresu. Nie wymyślaj precyzji. **Gdy katalog rozdziela rok NAKŁADU i rok
OBIEGU, w `meta_data` daj rok NAKŁADU, a obieg opisz w nocie** — w tym zbiorze te dwie
daty rozjeżdżają się bardzo często (np. nakład 1918, obieg jako Feldpost w 1940).

### `sig_typ` — krótkie określenie techniki/serii
Np. `litografia barwna, obiegowa — poczta polowa`, `światłodruk cz-b, nieobiegowa`,
`karta „Gruss aus”, rewers niepodzielony`, `pocztówka PRL, obiegowa 1975`,
`odbitka fotograficzna cz-b`, `portret atelierowy`, `rysunek, tusz z lawowaniem`.
Bez wielkich liter typu POWOJENNA i bez dopisków katalogowych.

### `nota` — 2–4 zdania, 220–420 znaków
Ma mówić: co widać, co w tym jest nietypowe, co wynika z rewersu, kto wydał i jaka
była jego rola, jak to osadza się w czasie.

TWARDE ZASADY:
1. **Wyłącznie dane z katalogu.** Żadnych dat, nazwisk, wydarzeń ani faktów spoza
   rekordu. Nie „dopowiadaj” wiedzy o Jarosławiu, o Galicji, o I wojnie ani o PRL,
   jeśli nie ma tego w polach wejściowych. Nie dopisuj historii ulic ani budynków.
2. **Niepewność zostaje niepewnością i musi być widoczna.** Kilkanaście pozycji ma
   w katalogu „do potwierdzenia”, „do zawężenia”, „nakładca nieoznaczony”,
   „prawdopodobnie”, „znaczek prawdopodobnie zdjęty”. Napisz to wprost („datowanie
   pozostaje do zawężenia”, „wydawcy nie oznaczono”, „identyfikacja obiektu jest
   w katalogu opatrzona zastrzeżeniem”). Nie zamiataj tego pod dywan i nie zamieniaj
   „prawdopodobnie” w fakt.
3. **Zero zachwytu.** Zakazane: przepiękny, piękny, perełka, niesamowity, wspaniały,
   urokliwy, magiczny, klimatyczny, unikatowy, wyjątkowy, cudowny, fascynujący,
   „prawdziwa gratka”, „skarb”. Ton spokojny, rzeczowy, jak nota muzealna.
4. **Nie przepisuj katalogowych uwag handlowych.** Pole `uwagi_katalogu` zawiera
   wewnętrzne decyzje sprzedażowe (premium, ceny, „DO DECYZJI”, „SPOZA SERII”,
   ołówkowe wyceny poprzedniego obrotu). To NIE trafia do noty. Wyjątek: informacja
   o serii, nakładzie, numerze wydawniczym albo proweniencji może być użyta jako fakt
   wydawniczy. Walor filatelistyczny (np. dopłata „Timbre-taxe” przy przesyłce do
   Paryża) można opisać jako cechę obiegu, ale bez słowa o cenie i bez oceny wartości.
5. **Podpisy i nadruki cytuj jako podpisy, nie jako fakt.** Duża część zbioru
   to karty wydane w monarchii austro-węgierskiej, z dwujęzycznymi podpisami
   (`Grunwaldgasse`, `Ringplatz`, `Rathaus`, `Altes Schloß`), a jedna — z 1941 roku —
   powstała pod okupacją niemiecką i nosi podpisy niemieckie i cyrylicą
   (`St. Annakloster / Монастир св. Анни`). Pisz np. „podpis awersu brzmi…”,
   „karta wydana pod niemieckim zarządem, z podpisem…”, a nie powtarzaj nazewnictwa
   jako neutralnego opisu. Nie moralizuj — po prostu oddziel podpis od obrazu.
   To samo dotyczy transparentów na fotografiach PRL-owskich.
6. **Nazwy dwujęzyczne.** Można odnotować, że karta jest podpisana po polsku
   i po niemiecku, ale nie w każdej nocie — inaczej wyjdzie z tego refren.
7. **Trzynaście obiektów NIE JEST pocztówkami.** Dwanaście to odbitki fotograficzne
   (straż pożarna, portrety atelierowe, pochody powojenne), a jeden — PT:6:13 —
   to odręczny RYSUNEK (studium głowy konia w kiełznie, tusz/ołówek z lawowaniem).
   Sprawdź pole `typ` i nazwij rzecz po imieniu: „odbitka”, „fotografia”, „portret”,
   „rysunek”, „studium”. NIE pisz o nich „pocztówka”, nawet jeśli podłożem jest papier
   pocztówkowy — wtedy napisz właśnie tak: „odbitka na papierze pocztówkowym”.
   Przy PT:6:13 katalog zaznacza, że związek z atelier W. Rosenbluth w Jarosławiu
   pozostaje DO POTWIERDZENIA — ta niepewność ma być w nocie widoczna.
8. **Jedna pozycja (PT:2:51) ma tylko awers**, bez rewersu. Nie pisz o jej odwrociu.
   Można odnotować, że zachował się sam awers.
9. **Każda nota inna.** Nie powtarzaj tego samego schematu zdaniowego. Unikaj tego,
   żeby wiele not zaczynało się tak samo (np. wszystkie od „Na awersie…”, „Karta
   z nakładu…”, „Widok…”). Zmieniaj punkt wejścia: raz od tego, co widać, raz od
   rewersu, raz od wydawcy, raz od daty, raz od detalu. Nie stosuj wyliczanek.
   Przy tylu kartach z tej samej ulicy to jest realne ryzyko — pilnuj go.
10. Nie zaczynaj noty od powtórzenia tytułu karty.
11. Nie używaj słowa „pocztówka” w każdej nocie — czasem wystarczy „karta”, „odbitka”,
    „druk”, albo w ogóle bez nazwy nośnika.
12. Jeśli rewers jest czysty/nieobiegowy, można to odnotować, ale nie w każdej nocie —
    tylko tam, gdzie coś to wnosi (np. cała seria nieobiegowa, albo przeciwnie: obieg
    z konkretnym datownikiem, jednostką wojskową, adresatem i miastem docelowym).
13. Długość: policz znaki. Poniżej 220 i powyżej 420 znaków to błąd — popraw przed oddaniem.

## Kontrola przed oddaniem
- liczba obiektów = liczba rekordów wejściowych,
- każda `nota` mieści się w 220–420 znakach,
- żadne dwa `tytul` nie są identyczne,
- żadne z zakazanych słów nie występuje,
- w żadnym `tytul` nie ma słowa „Jarosław”,
- przy pozycjach z pola `typ` = fotografia / rysunek nie pada słowo „pocztówka”
  jako określenie tego obiektu,
- JSON parsuje się (`python3 -c "import json;json.load(open(...))"`).
