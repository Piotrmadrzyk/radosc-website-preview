# Plan migracji na domenę restauracjaradosc.pl

> **STATUS: DOKUMENTACJA — NIE WDRAŻAĆ.**
> Migracja nastąpi **dopiero po sprzedaży projektu i akceptacji właścicielki**.
> Do tego czasu: żadnych zmian DNS, żadnej ingerencji w obecną stronę
> restauracjaradosc.pl, preview pozostaje `noindex, nofollow`.

## 1. Warunek startu

- [ ] Właścicielka zaakceptowała nową stronę i zakup projektu.
- [ ] Ustalony termin migracji i okno serwisowe.
- [ ] Potwierdzone odpowiedzi z `DO_POTWIERDZENIA_Z_WLASCICIELKA.md`.

## 2. Checklista dostępów (do zebrania przed migracją)

| Dostęp | Potrzebny do | Status |
|---|---|---|
| Hosting obecnej strony | kopia zapasowa, ewentualne przekierowania | ☐ |
| Panel DNS domeny restauracjaradosc.pl | przełączenie domeny | ☐ |
| Repozytorium docelowe (lub to repo) | wdrożenie kodu | ☐ |
| Google Search Console (stara domena) | eksport URL-i, zgłoszenie zmian | ☐ |
| Google Analytics (jeśli istnieje) | ciągłość pomiarów | ☐ |
| Google Business Profile (obie lokalizacje) | aktualizacja linków | ☐ |

## 3. Kopia starej strony

1. Pełny backup plików i bazy (jeśli CMS) z hostingu.
2. Zrzut `wget --mirror` jako niezależna kopia statyczna.
3. Zapis nagłówków HTTP i mapy przekierowań obecnej strony.
4. Przechowywać kopię do min. 6 miesięcy po migracji.

## 4. Zebranie wszystkich starych URL-i

Źródła: Search Console (Indeksowanie → Strony), sitemap starej strony,
`site:restauracjaradosc.pl` w Google, logi serwera (min. 3 miesiące),
linki przychodzące (Search Console → Linki).

## 5. Tabela mapowania URL-i

Wzór (uzupełnić po zebraniu URL-i):

| Stary URL | Nowy URL | Typ | Uwagi |
|---|---|---|---|
| / | / | 200 | strona główna |
| /menu (przykład) | /pizza.html | 301 | jeśli istnieje |
| /kontakt (przykład) | /kontakt.html | 301 | |
| … | … | 301 | każdy stary URL musi mieć cel |

Zasada: **żaden stary URL z ruchem nie może kończyć się na 404.**
Brakujący odpowiednik → przekierowanie na najbliższą tematycznie stronę.

## 6. Przekierowania 301

- Wdrożyć po przełączeniu domeny, na serwerze docelowym (np. `_redirects`/`.htaccess`
  zależnie od hostingu — przykład w `MIGRACJA_PRZYKLADY/redirects-przyklad.txt`).
- 301 (trwałe), nie 302.
- Testować każdą pozycję tabeli mapowania (curl -I).

## 7. Canonical

- Po migracji każda podstrona otrzymuje `<link rel="canonical">` wskazujący
  własny adres na `https://restauracjaradosc.pl/…`.
- Na preview NIE dodajemy canonicali produkcyjnych (mogłyby mylić roboty).

## 8. sitemap.xml

- Wygenerować dla 7 podstron produkcyjnych (przykład:
  `MIGRACJA_PRZYKLADY/sitemap-przyklad.xml`).
- Opublikować dopiero na produkcji; zgłosić w Search Console.

## 9. robots.txt

- Produkcyjny `robots.txt` (przykład: `MIGRACJA_PRZYKLADY/robots-przyklad.txt`):
  zezwala na indeksację, wskazuje sitemap.
- Preview (GitHub Pages) pozostaje bez produkcyjnego robots.txt.

## 10. Zdjęcie noindex — dopiero po testach

Kolejność: wdrożenie na domenę → testy (sekcja 12) → dopiero wtedy usunięcie
`<meta name="robots" content="noindex, nofollow">` ze wszystkich 7 podstron
**na produkcji**.

## 11. Preview zachowuje noindex

Wersja preview (piotrmadrzyk.github.io) na stałe pozostaje `noindex, nofollow`,
także po migracji — żeby nie konkurować z produkcją (duplicate content).

## 12. Testy 404

- Przejść całą tabelę mapowania (301 → 200, bez łańcuchów przekierowań).
- Sprawdzić 404 dla przypadkowych ścieżek (poprawna strona błędu).
- Sprawdzić assets (obrazy WebP/JPEG, CSS, JS) na nowej domenie.

## 13. Search Console

- Dodać i zweryfikować usługę `restauracjaradosc.pl` (jeśli nie istnieje).
- Zgłosić sitemap.
- Monitorować raport Indeksowanie → Strony przez 4–8 tygodni.
- Sprawdzić raport „Ręczne działania" i „Bezpieczeństwo".

## 14. Rich Results Test

- Przetestować każdą podstronę z JSON-LD (Restaurant, FoodEstablishment, FAQPage)
  w Rich Results Test po migracji.
- Poprawić błędy/ostrzeżenia przed zgłoszeniem sitemap.

## 15. Monitorowanie pozycji po migracji

- Zapisać stan wyjściowy: zapytania i pozycje z Search Console starej domeny.
- Po migracji monitorować tygodniowo (min. 8 tygodni): kliknięcia, wyświetlenia,
  średnia pozycja, pokrycie indeksu.
- Alarm: spadek kliknięć >30% utrzymujący się 2 tygodnie → przegląd mapowania
  i przekierowań.

## 16. Plan rollbacku

1. DNS: przywrócić poprzednie rekordy (zanotować je PRZED zmianą — TTL, A/AAAA/CNAME/MX!).
2. Stara strona pozostaje nietknięta na hostingu do czasu stabilizacji — rollback
   to wyłącznie powrót DNS.
3. Nie kasować niczego ze starego hostingu przez min. 6 miesięcy.
4. Po rollbacku: wycofać zgłoszenie sitemap, wrócić do monitoringu.

---

**Uwaga:** rekordy MX (poczta na domenie) muszą zostać zachowane przy każdej
zmianie DNS — adres patrycja@restauracjaradosc.pl działa na tej domenie.
