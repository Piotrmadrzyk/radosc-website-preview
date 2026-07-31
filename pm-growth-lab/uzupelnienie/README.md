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

## Uruchomienie wysyłki — co trzeba zrobić raz

### 1. Konto Resend i zweryfikowana domena

Załóż konto na [resend.com](https://resend.com), dodaj domenę nadawcy
(np. `pmgrowthlab.pl`) i wygeneruj klucz API. Bez zweryfikowanej domeny
Resend pozwala wysyłać tylko na adres właściciela konta.

### 2. Wdrożenie funkcji na Vercel

Podłącz to repozytorium do nowego projektu na [vercel.com](https://vercel.com).
Vercel automatycznie wykryje katalog `api/` i opublikuje funkcję pod adresem:

```
https://<nazwa-projektu>.vercel.app/api/pm-growth-lab/send-followup-report
```

Projekt na Vercelu obsługuje wyłącznie tę funkcję — strona nadal stoi
na GitHub Pages i nic w niej się nie zmienia.

### 3. Zmienne środowiskowe (Vercel → Settings → Environment Variables)

| Zmienna | Znaczenie |
|---|---|
| `RESEND_API_KEY` | klucz API z Resend |
| `REPORT_RECIPIENT_EMAIL` | adres, na który ma trafiać raport (adres Piotra) |
| `REPORT_FROM_EMAIL` | adres nadawcy z domeny zweryfikowanej w Resend, np. `raporty@pmgrowthlab.pl` |
| `ALLOWED_ORIGINS` | opcjonalnie — dodatkowe originy, po przecinku (do testów lokalnych) |

Żadna z tych wartości nie znajduje się w repozytorium ani w kodzie strony.

### 4. Wpisanie adresu funkcji w formularzu

W `script.js`, w obiekcie `CONFIG` na samej górze:

```js
var CONFIG = {
  ENDPOINT: 'https://<nazwa-projektu>.vercel.app/api/pm-growth-lab/send-followup-report',
  ...
};
```

Sam adres endpointu nie jest sekretem — sekrety zostają po stronie serwera.

**Dopóki `ENDPOINT` jest pusty, formularz nie udaje wysyłki.** Przycisk
informuje wprost, że wysyłka nie została jeszcze uruchomiona, a odpowiedzi
zostają zapisane na urządzeniu.

---

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
