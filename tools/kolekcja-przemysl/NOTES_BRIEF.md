# Zadanie: noty kuratorskie do prywatnej galerii pocztówek przemyskich

Piszesz po polsku noty do kart z prywatnej kolekcji (zbiór 104 pocztówek Przemyśla
z lat 1898–1955; oś zbioru: austro-węgierskie miasto garnizonowe i twierdza →
I wojna i oblężenia → II RP → PRL). Strona jest prywatna, kolekcjonerska, nie sklep.

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
  "sygnatura": "PT:1:8",
  "tytul": "...",              // 3–7 słów
  "meta_wydawca": "...",       // do ~45 znaków
  "meta_data": "...",          // do ~26 znaków
  "sig_typ": "...",            // do ~60 znaków
  "nota": "..."                // 2–4 zdania, 220–420 znaków
}
```

### `tytul` — 3–7 słów
- BEZ słowa „Przemyśl”.
- NIE zaczynaj od „Pocztówka”, „Karta”, „Widok”, „Fotografia”.
- Konkretny, rzeczowy, po polsku. Może wskazywać miejsce, obiekt, sytuację albo
  szczegół, który wyróżnia tę kartę spośród sąsiednich.
- W tym zbiorze wiele kart powtarza ten sam motyw (ul. Mickiewicza, ul. Franciszkańska,
  Wybrzeże Franciszka Józefa, „Zerstörte Sanbrücke”, panoramy „Totalansicht”).
  Karty niemal identyczne MUSZĄ mieć RÓŻNE tytuły — różnicuj po detalu, wydawcy,
  roku nakładu, obiegu, kolorze druku, porze roku, kierunku ujęcia.

### `meta_wydawca` — krótka atrybucja
Np. `Salon Malarzy Polskich, Kraków`, `M. G. Rosenfeld, Przemyśl`,
`Kilophot, Wiedeń`, `Współczesna Sztuka, Przemyśl`, `Wyd. „Sztuka”, Kraków`,
`Nakładca nieustalony`. Skracaj, nie przepisuj całości.

### `meta_data` — krótka data
Np. `1898`, `1916`, `ok. 1910–1914`, `po 1932`, `1954`. Jeśli katalog waha się —
zostaw wahanie w formie `ok.` albo zakresu. Nie wymyślaj precyzji. Gdy katalog rozdziela
rok nakładu i rok obiegu, w `meta_data` daj rok NAKŁADU (obieg opisz w nocie).

### `sig_typ` — krótkie określenie techniki/serii
Np. `litografia barwna „Gruss aus”, obiegowa`, `światłodruk, obiegowa`,
`karta poczty polowej, cenzura k.u.k.`, `oryginalna odbitka fotograficzna`,
`seria „Der Krieg 1914/15 in Postkarten”`. Bez wielkich liter typu POWOJENNA
i bez dopisków katalogowych.

### `nota` — 2–4 zdania, 220–420 znaków
Ma mówić: co widać, co w tym jest nietypowe, co wynika z rewersu, kto wydał i jaka
była jego rola, jak to osadza się w czasie.

TWARDE ZASADY:
1. **Wyłącznie dane z katalogu.** Żadnych dat, nazwisk, wydarzeń ani faktów spoza
   rekordu. Nie „dopowiadaj” wiedzy o Przemyślu, o Twierdzy ani o I wojnie, jeśli
   nie ma tego w polach wejściowych.
2. **Niepewność zostaje niepewnością i musi być widoczna.** Jeśli katalog pisze
   „do potwierdzenia”, „nakładca nieustalony”, „odczyt niepewny”, „rok nieczytelny” —
   napisz to wprost („wydawcy nie udało się ustalić”, „rok datownika pozostaje
   nieczytelny”, „datowanie oparte wyłącznie na numerze wydawniczym”). Nie zamiataj
   tego pod dywan.
3. **Zero zachwytu.** Zakazane: przepiękny, piękny, perełka, niesamowity, wspaniały,
   urokliwy, magiczny, klimatyczny, unikatowy, wyjątkowy, cudowny, fascynujący,
   „prawdziwa gratka”, „skarb”. Ton spokojny, rzeczowy, jak nota muzealna.
4. **Nie przepisuj katalogowych uwag handlowych.** Pole `uwagi_katalogu` zawiera
   wewnętrzne decyzje sprzedażowe (premium, ceny, „DO DECYZJI”, „SPOZA SERII”,
   ołówkowe wyceny poprzedniego obrotu). To NIE trafia do noty. Wyjątek: informacja
   o serii/nakładzie/proweniencji może być użyta jako fakt wydawniczy.
5. **Podpisy wojennej propagandy cytuj jako podpisy, nie jako fakt.** Znaczna część
   zbioru to karty wydane przez stronę austro-węgierską i niemiecką: „Einzug der
   siegreichen Deutschen”, „Wkroczenie zwycięskich Niemców”, „Defilierung der
   bayrischen Truppen nach der Wiedereroberung”, serie `Gloria-Viktoria-Album`,
   `Der Krieg 1914/15 in Postkarten` (Ostpreußenhilfe), oficjalne `Kriegsbildkarten`
   Kriegshilfsbüro k.k. MSW. Pisz np. „podpis wydawcy głosi…”, „karta z oficjalnej
   serii…”, a nie powtarzaj hasła jako opisu rzeczywistości. Nie moralizuj — po prostu
   oddziel podpis od obrazu. To samo dotyczy nadruków patriotycznych sojuszu Państw
   Centralnych.
6. **Nazwy dwujęzyczne.** Awersy bywają podpisane po polsku i po niemiecku
   („Wybrzeże Franciszka Józefa / Franz Josefs-Quai”). Można to odnotować jako cechę
   druku, ale nie w każdej nocie.
7. **Kilka obiektów nie jest pocztówkami** — katalog określa je jako fotografie
   (oryginalne odbitki). Jeśli tak jest w polu `typ`, nazwij rzecz po imieniu
   („odbitka”, „fotografia”), nie pisz o niej „pocztówka”.
8. **Każda nota inna.** Nie powtarzaj tego samego schematu zdaniowego. Unikaj tego,
   żeby wiele not zaczynało się tak samo (np. wszystkie od „Na awersie…”, „Karta
   z serii…”, „Widok…”). Zmieniaj punkt wejścia: raz od tego, co widać, raz od
   rewersu, raz od wydawcy, raz od daty, raz od detalu. Nie stosuj wyliczanek.
9. Nie zaczynaj noty od powtórzenia tytułu karty.
10. Nie używaj słowa „pocztówka” w każdej nocie — czasem wystarczy „karta”, „odbitka”,
    „druk”, albo w ogóle bez nazwy nośnika.
11. Jeśli rewers jest czysty/nieobiegowy, można to odnotować, ale nie w każdej nocie —
    tylko tam, gdzie coś to wnosi (np. cała seria nieobiegowa, albo przeciwnie: obieg
    z konkretnym datownikiem, adresatem i miastem docelowym).
12. Długość: policz znaki. Poniżej 220 i powyżej 420 znaków to błąd — popraw przed oddaniem.

## Kontrola przed oddaniem
- liczba obiektów = liczba rekordów wejściowych,
- każda `nota` mieści się w 220–420 znakach,
- żadne dwa `tytul` nie są identyczne,
- żadne z zakazanych słów nie występuje,
- w żadnym `tytul` nie ma słowa „Przemyśl”,
- JSON parsuje się (`python3 -c "import json;json.load(open(...))"`).
