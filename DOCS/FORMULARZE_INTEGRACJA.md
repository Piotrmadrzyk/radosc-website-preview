# Formularze — przygotowanie do podłączenia wysyłki (ETAP 5.9)

## Stan obecny
Dwa formularze (`catering.html` → zapytanie cateringowe, `kontakt.html` →
wiadomość ogólna): `class="demo-form"`, `method="post"`, **bez `action`**.
Wszystkie pola mają poprawne atrybuty `name` (name, phone, email, event,
date, guests, place, message, consent / name, email, topic, message),
`autocomplete` i walidację po stronie JS (`js/main.js`).

## Jak działa tryb demo → produkcja (przygotowane w 5.9)
`js/main.js` waliduje pola przy submit. Zachowanie zależy od atrybutu
`action` na `<form>`:
- **bez `action`** (teraz): submit zatrzymany, komunikat demo w `.form-status`;
- **z `action`**: po pozytywnej walidacji submit przechodzi **natywnie**
  do usługi — zero zmian w JS przy integracji.

## Podłączenie (dokładnie 2 kroki na formularz)
1. Ustaw `action="https://…adres-usługi…"` na `<form>`.
2. Usuń linijkę `<p class="form-note">Formularz demonstracyjny…</p>`.
(Instrukcja powtórzona w komentarzu HTML nad każdym formularzem.)

## Porównanie usług (dla tego projektu: czysty statyczny HTML)
| Usługa | Pasuje? | Uwagi |
|---|---|---|
| **Formspree** | **TAK — rekomendacja** | działa z każdym hostingiem statycznym (w tym GitHub Pages i docelowym hostingiem domeny); integracja = samo `action`; darmowy plan ~50 zgłoszeń/mies. (2 formularze OK); spam-filtr i powiadomienia e-mail wbudowane; zgodne z naszym mechanizmem `action` |
| Netlify Forms | tylko jeśli hosting przejdzie na Netlify | wymaga hostowania NA Netlify (atrybut `data-netlify`); na GitHub Pages/innym hostingu nie zadziała |
| EmailJS | możliwe, niezalecane | wymaga JS SDK i klucza publicznego w kodzie klienta; więcej kodu, łatwiejszy abuse limitów |
| Resend | nie bez backendu | to API do wysyłki e-mail — wymaga funkcji serwerowej (nie ma jej na statycznym hostingu) |

**Rekomendacja: Formspree** — jedyna opcja w pełni niezależna od wyboru
docelowego hostingu, bez kodu po stronie klienta, spójna z przygotowanym
mechanizmem `action`. Decyzja i założenie konta: po stronie właściciela
(adres docelowy zgłoszeń: prawdopodobnie patrycja@restauracjaradosc.pl —
do potwierdzenia).

Po integracji: przetestować oba formularze (poprawny submit, walidacja,
strona podziękowania/`_next`), dodać temat/redirect wg dokumentacji usługi
i zaktualizować politykę prywatności (przetwarzanie danych przez procesora).
