# Polityka prywatności — lista miejsc do uzupełnienia przed produkcją (ETAP 5.9)

Obecna strona `polityka-prywatnosci.html` to szkielet podglądowy.
NIE wpisujemy danych fikcyjnych — poniższe pozycje wymagają realnych
informacji od właścicielki / obsługi prawnej przed startem produkcji.

## Do uzupełnienia (dane, których dziś nie znamy)
1. **Administrator danych** — pełna nazwa firmy, forma prawna, NIP/REGON,
   adres siedziby (Jasionka 954c? — potwierdzić, czy to adres rejestrowy).
2. **Kontakt w sprawach danych** — dedykowany e-mail (czy
   patrycja@restauracjaradosc.pl, czy osobny adres RODO).
3. **Hosting produkcyjny** — nazwa dostawcy i lokalizacja serwerów
   (decyzja o hostingu jeszcze nie zapadła) + zapis o logach serwera.
4. **Cookies** — obecnie strona NIE ustawia własnych cookies; jedyny
   element osadzony to mapa Google (iframe na kontakt/bistro/catering) —
   opisać cookies Google Maps; jeżeli dojdzie analityka → baner zgody.
5. **Analityka** — jeżeli w dniu publikacji zostanie podpięta (GA4 lub
   alternatywa) → sekcja o narzędziu, celu, retencji + mechanizm zgody.
6. **Formularze** — po podłączeniu wysyłki (rekomendacja: Formspree):
   wskazać procesora danych, zakres pól (imię, telefon, e-mail, treść),
   cel (odpowiedź na zapytanie) i podstawę prawną.
7. **Podstawy prawne przetwarzania** — art. 6 ust. 1 lit. a/b/f RODO dla
   poszczególnych celów (kontakt, zapytanie ofertowe, logi techniczne).
8. **Prawa użytkownika** — dostęp, sprostowanie, usunięcie, ograniczenie,
   sprzeciw, przenoszenie, skarga do PUODO (tekst standardowy — do
   akceptacji prawnej).
9. **Okresy przechowywania** — jak długo trzymane są zapytania z formularzy
   i korespondencja (decyzja właścicielki, np. czas obsługi + okres
   przedawnienia roszczeń).
10. **Odbiorcy danych** — hosting, dostawca formularzy, ewent. analityka,
    Google (mapy), Meta (linki do FB/IG — bez pikseli, tylko odnośniki).
11. **Data wejścia w życie** polityki.

## Gdzie w kodzie
- `polityka-prywatnosci.html` — treść do podmiany w całości po zebraniu
  powyższych danych.
- Stopki wszystkich stron linkują do polityki — linki gotowe, bez zmian.
- Checkbox zgody w formularzu cateringu (`name="consent"`) — po
  uzupełnieniu polityki podlinkować ją w treści zgody.
