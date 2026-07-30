# Zadanie: noty kuratorskie do prywatnej galerii pocztówek warszawskich

Piszesz po polsku noty do kart z prywatnej kolekcji (zbiór 147 pocztówek Warszawy,
oś zbioru: miasto sprzed 1939 → zniszczenie → odbudowa). Strona jest prywatna,
kolekcjonerska, nie sklep.

## Wejście
Plik JSON z rekordami katalogowymi. Pola:
- `sygnatura` — identyfikator karty (nie zmieniaj)
- `motyw` — dział, do którego karta trafiła na stronie (kontekst, nie przepisuj)
- `tytul_katalogowy`, `nakladca_fotograf`, `obiekt`, `datowanie`, `typ`, `stan`,
  `uwagi_katalogu`, `slowa_kluczowe`
- `obiekt` to najbogatsze pole: opisuje awers I REWERS (znaczek, datownik, adresat,
  treść wiadomości, numery wydawnicze, ołówkowe zapiski). Stamtąd bierz historię.

## Wyjście
Czysty JSON — tablica obiektów, po jednym na każdą sygnaturę z wejścia, w tej samej
kolejności. Zapisz go do wskazanego pliku wyjściowego. Każdy obiekt:

```
{
  "sygnatura": "PT:7:8",
  "tytul": "...",              // 3–7 słów
  "meta_wydawca": "...",       // do ~45 znaków
  "meta_data": "...",          // do ~26 znaków
  "sig_typ": "...",            // do ~60 znaków
  "nota": "..."                // 2–4 zdania, 220–420 znaków
}
```

### `tytul` — 3–7 słów
- BEZ słowa „Warszawa".
- NIE zaczynaj od „Pocztówka", „Karta", „Widok", „Fotografia".
- Konkretny, rzeczowy, po polsku. Może wskazywać miejsce, obiekt, sytuację albo
  szczegół, który wyróżnia tę kartę spośród sąsiednich.
- Karty niemal identyczne (duplikaty, warianty tej samej sceny) muszą mieć RÓŻNE tytuły —
  różnicuj po detalu, porze dnia, kadrze, obiegu.

### `meta_wydawca` — krótka atrybucja
Np. `Książka i Wiedza, fot. E. Falkowski`, `K. Wojutyński, Warszawa`,
`Światowid, fot. T. Bukowski`, `Nakładca nieustalony`. Skracaj, nie przepisuj całości.

### `meta_data` — krótka data
Np. `ok. 1949–1950`, `1952`, `1902`, `ok. 1915–1918`. Jeśli katalog waha się — zostaw
wahanie w formie `ok.` albo zakresu. Nie wymyślaj precyzji.

### `sig_typ` — krótkie określenie techniki/serii
Np. `pocztówka fotograficzna, seria „Odbudowa Warszawy”`, `światłodruk, obiegowa`,
`oryginalna odbitka, zestaw „Pamiątka z Warszawy”`, `wklęsłodruk, obiegowa`.
Bez wielkich liter typu POWOJENNA i bez dopisków katalogowych.

### `nota` — 2–4 zdania, 220–420 znaków
Ma mówić: co widać, co w tym jest nietypowe, co wynika z rewersu, kto wydał i jaka
była jego rola, jak to osadza się w czasie.

TWARDE ZASADY:
1. **Wyłącznie dane z katalogu.** Żadnych dat, nazwisk, wydarzeń ani faktów spoza
   rekordu. Nie „dopowiadaj" wiedzy o Warszawie, której nie ma w polach wejściowych.
2. **Niepewność zostaje niepewnością i musi być widoczna.** Jeśli katalog pisze
   „do potwierdzenia", „wydawca nieustalony", „odczyt niepewny" — napisz to wprost
   („wydawcy nie udało się ustalić", „sygnatura rysownika pozostaje nieodczytana",
   „datowanie oparte wyłącznie na numerze wydawniczym"). Nie zamiataj tego pod dywan.
3. **Zero zachwytu.** Zakazane: przepiękny, piękny, perełka, niesamowity, wspaniały,
   urokliwy, magiczny, klimatyczny, unikatowy, wyjątkowy, cudowny, fascynujący,
   „prawdziwa gratka", „skarb". Ton spokojny, rzeczowy, jak nota muzealna.
4. **Nie przepisuj katalogowych uwag handlowych.** Pola `uwagi_katalogu` zawierają
   wewnętrzne decyzje sprzedażowe (premium, ceny, „DO DECYZJI", „SPOZA SERII",
   ołówkowe wyceny poprzedniego obrotu). To NIE trafia do noty. Wyjątek: informacja
   o serii/klastrze może być użyta jako fakt wydawniczy.
5. **Podpisy propagandowe cytuj jako podpisy, nie jako fakt.** Wiele kart z serii
   „Odbudowa Warszawy" (Książka i Wiedza) i „Cały naród buduje swoją stolicę"
   ma podpisy agitacyjne. Pisz np. „podpis wydawcy głosi…", „karta opatrzona hasłem…",
   a nie powtarzaj hasła jako opisu rzeczywistości. Nie komentuj tego jednak
   moralizatorsko — po prostu oddziel podpis od obrazu.
6. **Każda nota inna.** Nie powtarzaj tego samego schematu zdaniowego. Unikaj tego,
   żeby wiele not zaczynało się tak samo (np. wszystkie od „Na awersie…", „Karta z serii…",
   „Widok…"). Zmieniaj punkt wejścia: raz od tego, co widać, raz od rewersu, raz od
   wydawcy, raz od daty, raz od detalu. Nie stosuj wyliczanek.
7. Nie zaczynaj noty od powtórzenia tytułu karty.
8. Nie używaj słowa „pocztówka" w każdej nocie — czasem wystarczy „karta", „odbitka",
   „druk", albo w ogóle bez nazwy nośnika.
9. Jeśli rewers jest czysty/nieobiegowy, można to odnotować, ale nie w każdej nocie —
   tylko tam, gdzie coś to wnosi (np. cała seria nieobiegowa, albo przeciwnie: obieg
   z konkretnym datownikiem).
10. Długość: policz znaki. Poniżej 220 i powyżej 420 znaków to błąd — popraw przed oddaniem.

## Kontrola przed oddaniem
- liczba obiektów = liczba rekordów wejściowych,
- każda `nota` mieści się w 220–420 znakach,
- żadna dwa `tytul` nie są identyczne,
- żadne z zakazanych słów nie występuje,
- JSON parsuje się (`python3 -c "import json;json.load(open(...))"`).
