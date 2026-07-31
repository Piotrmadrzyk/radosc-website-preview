# PM GROWTH LAB — pytania uzupełniające

**Strategia. Technologia. Wzrost.**

Drugi formularz przygotowany dla **Michała Elżbieciaka** — 51 pytań uzupełniających
w 10 sekcjach, zbierających informacje, których zabrakło po pierwszym formularzu
strategicznym.

Autor projektu: **Piotr Mądrzyk — PM Growth Lab**

- Strona: `https://piotrmadrzyk.github.io/radosc-website-preview/pm-growth-lab/uzupelnienie/`
- Pierwszy formularz (osobny, nietknięty): `../`

---

## Najważniejsza różnica wobec pierwszego formularza

Michał **niczego nie pobiera i niczego nie wysyła ręcznie**. Na końcu klika
**WYŚLIJ ODPOWIEDZI DO PIOTRA**, a komplet odpowiedzi trafia e-mailem prosto
na skrzynkę Piotra. Nie ma tu przycisków eksportu TXT/JSON ani `mailto:`.

Wysyłkę realizuje funkcja serverless — strona statyczna nie może bezpiecznie
wysłać e-maila, bo każdy klucz umieszczony w JavaScripcie byłby publiczny.

---

## Pliki

```
pm-growth-lab/uzupelnienie/
├── index.html    # struktura strony
├── styles.css    # design system (wspólny język wizualny z pierwszym formularzem)
├── script.js     # 51 pytań, silnik ekranów, zapis, przegląd, wysyłka
└── README.md     # ten plik

api/pm-growth-lab/
└── send-followup-report.js   # funkcja serverless: walidacja + wysyłka przez Resend
```

---

## Jak działa wysyłka

Ten sam wzorzec, co formularze Zielonej Pergoli:

```
przeglądarka → POST JSON → webhook n8n → walidacja i złożenie raportu → Gmail → e-mail
```

Przepływ w n8n: **PM Growth Lab — raport z formularza uzupełniającego**
(`GDu543S2W53Uch1R`, projekt osobisty). Sześć węzłów:

| Węzeł | Rola |
|---|---|
| Formularz uzupełniający PM Growth Lab | webhook `POST`, CORS ograniczony do `https://piotrmadrzyk.github.io`, `ignoreBots` |
| Złóż raport | walidacja zgłoszenia i złożenie raportu HTML oraz wersji tekstowej |
| Czy wysyłać raport? | rozdziela zgłoszenia poprawne od odrzuconych |
| Wyślij raport do Piotra | węzeł Gmail na istniejącym poświadczeniu, adres odbiorcy tylko tutaj |
| Potwierdź przyjęcie | odpowiedź `{ ok: true, submissionId }`, kod 200 |
| Odpowiedz bez wysyłki | honeypot → 200 bez wysyłki, błędy → 400 z kodem błędu |

Adres webhooka jest wpisany w `CONFIG.ENDPOINT` w `script.js`. **Adres odbiorcy
raportu nie występuje w żadnym pliku repozytorium** — jest wyłącznie w węźle
Gmail po stronie n8n.

### Co sprawdza przepływ, zanim wyśle raport

- identyfikator formularza (`pm-growth-lab-followup-v1`),
- zgodę użytkownika (`consent === true`) — bez niej `400 consent_required`,
- honeypot — wypełnione ukryte pole oznacza bota: odpowiedź 200, ale **bez wysyłki**,
- rozmiar zgłoszenia (limit 300 000 znaków) oraz liczbę sekcji i pozycji,
- obecność choć jednej odpowiedzi — puste zgłoszenie dostaje `400 no_answers`,
- escapuje każdy tekst przed zbudowaniem HTML i usuwa znaki sterujące.

Kody błędów zwracane do formularza: `consent_required`, `unknown_form`,
`empty_payload`, `no_answers`, `payload_too_large`, `invalid_payload`.

### Wariant zapasowy (nieużywany)

W repozytorium leży też `api/pm-growth-lab/send-followup-report.js` — funkcja
serverless dla Vercela z wysyłką przez Resend. Jest w pełni przetestowana, ale
**nie jest nigdzie podłączona**; została jako alternatywa, gdyby raport miał
kiedyś wychodzić z adresu transakcyjnego zamiast ze skrzynki Piotra.

## Bezpieczeństwo endpointu

- przyjmuje wyłącznie `POST` (`GET` → 405),
- sprawdza `Origin` — domyślnie tylko `https://piotrmadrzyk.github.io`,
- limit zgłoszenia 300 KB (odrzucenie po nagłówku `Content-Length` i w trakcie odczytu),
- waliduje strukturę: identyfikator formularza, sekcje, pytania, obecność zgody,
- odrzuca zgłoszenia puste i bez ani jednej odpowiedzi,
- escapuje każdy tekst przed zbudowaniem HTML (`<`, `>`, `&`, `"`, `'`) i usuwa znaki sterujące,
- ma pole honeypot — wypełnione oznacza bota, wtedy nic nie jest wysyłane,
- zwraca jednoznaczne `{ ok: true }` albo `{ ok: false, error: … }`,
- nie zapisuje treści odpowiedzi w logach — do logów trafia wyłącznie status,
- nigdy nie zwraca adresu odbiorcy,
- przy braku zmiennych środowiskowych zwraca 503, nigdy fałszywego sukcesu.

Kod funkcji jest publiczny (repozytorium jest publiczne) — i tak może być,
bo nie zawiera żadnych sekretów.

---

## Raport e-mail

Temat:

```
PM Growth Lab — odpowiedzi uzupełniające Michała Elżbieciaka — 31.07.2026, 18:31
```

Treść to raport HTML (ciemny nagłówek marki, sekcje, numery i pełne treści pytań)
plus równoległa wersja tekstowa dla klientów bez HTML. Zawiera:

- datę przesłania, poziom uzupełnienia i identyfikator zgłoszenia,
- wszystkie sekcje z pełnymi treściami pytań i odpowiedziami,
- **własne odpowiedzi** wyróżnione turkusową ramką,
- **komentarze Michała** wyróżnione piaskową ramką,
- listę pytań pozostawionych bez odpowiedzi.

Wiadomość nie zawiera żadnych załączników — całość jest w treści.

---

## Zachowanie formularza

- jedno pytanie lub mała grupa pytań na ekranie, pasek postępu i numer sekcji,
- **przy każdym pytaniu**: gotowe odpowiedzi, „Inna odpowiedź" oraz opcjonalny
  „+ Dodaj komentarz"; komentarze zapisują się osobno i wracają po odświeżeniu,
- pytania otwarte mają główne pole odpowiedzi i osobne pole komentarza,
- każde pytanie można pominąć („Nie wiem / omówimy podczas spotkania"),
- autozapis w `localStorage` (`pmgl.michal.uzupelnienie.v1`) i wznawianie sesji,
- przed wysyłką pełny przegląd: poziom uzupełnienia, odpowiedzi po sekcjach,
  własne odpowiedzi, komentarze i lista braków,
- obowiązkowa zgoda przed wysłaniem, a po niej dodatkowe pytanie potwierdzające,
- po udanej wysyłce zapisywany jest identyfikator zgłoszenia i data; odpowiedzi
  **nie są kasowane**, a ponowna wysyłka wymaga świadomego kliknięcia i potwierdzenia,
- po nieudanej wysyłce dane zostają nietknięte, a komunikat jest spokojny
  i pozwala spróbować ponownie,
- obsługa klawiatury, widoczny fokus, `aria-label` i `aria-live`,
- responsywność od 320 px, bez przewijania w poziomie.

---

## Czego formularz nie zbiera

Danych medycznych, numerów polis i dokumentów, PESEL, danych płatniczych, haseł,
danych osobowych klientów ani pełnych danych pracowników i sponsorów. Przy pytaniu
o firmy prosimy wyłącznie o branżę, skalę i stanowisko osoby decyzyjnej.

---

## Testy

W repozytorium nie ma zależności testowych — testy uruchamiane były lokalnie
(Node + Playwright) i objęły:

- endpoint: metodę, origin, limit rozmiaru, walidację, honeypot, sanityzację
  wstrzykniętego HTML, brak konfiguracji (503), błąd usługi pocztowej (502),
- formularz: przejście przez wszystkie 51 pytań z odpowiedzią, własną odpowiedzią
  i komentarzem, przerwanie i wznowienie sesji, pytanie warunkowe, przegląd,
  wymóg zgody, prawdziwą wysyłkę, blokadę podwójnej wysyłki, obsługę błędu sieci,
- widok raportu na szerokości komputera i telefonu,
- responsywność 320 / 430 / 820 px i brak błędów w konsoli.
