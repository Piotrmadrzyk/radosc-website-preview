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

## Uruchomienie wysyłki — checklista dla Piotra

Stan na dziś: kod formularza i funkcji jest gotowy i przetestowany, brakuje
wyłącznie konta Resend i wdrożenia na Vercel. Poniżej pełna lista czynności.

### Krok 1 — Resend

1. Załóż konto na [resend.com](https://resend.com) na docelowy adres odbiorcy raportu.
2. W zakładce **API Keys** utwórz klucz (uprawnienie *Sending access* wystarczy).
3. Nadawca:
   - **bez własnej domeny** możesz na start wysyłać z `onboarding@resend.dev`,
     ale Resend dostarczy wtedy wiadomość **wyłącznie na adres właściciela konta**.
     Jeśli konto założysz na docelowy adres odbiorcy, to w zupełności wystarcza.
   - **z własną domeną** (np. `pmgrowthlab.pl`) dodaj ją w zakładce *Domains*,
     ustaw rekordy DNS i użyj adresu w rodzaju `raporty@pmgrowthlab.pl`.

### Krok 2 — Vercel

1. Zaloguj się na [vercel.com](https://vercel.com) kontem GitHub.
2. **Add New → Project** i wybierz repozytorium `radosc-website-preview`.
3. Framework Preset: **Other**. Katalog główny zostaw bez zmian —
   Vercel sam wykryje funkcję w `api/`.
4. Przed pierwszym wdrożeniem dodaj zmienne środowiskowe
   (Settings → Environment Variables, zaznacz wszystkie trzy środowiska):

```
RESEND_API_KEY          = <klucz z Resend>
REPORT_RECIPIENT_EMAIL  = <docelowy adres odbiorcy raportu>
REPORT_FROM_EMAIL       = PM Growth Lab <onboarding@resend.dev>
ALLOWED_ORIGINS         = (zostaw puste — domyślnie dozwolony jest tylko GitHub Pages)
```

5. **Deploy**. Po wdrożeniu adres funkcji to:

```
https://<nazwa-projektu>.vercel.app/api/pm-growth-lab/send-followup-report
```

Zmienne zmienione po wdrożeniu wymagają ponownego wdrożenia
(Deployments → … → Redeploy).

### Krok 3 — sprawdź, że e-mail naprawdę przychodzi

Wklej w terminalu, podmieniając tylko nazwę projektu:

```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: https://piotrmadrzyk.github.io" \
  -d '{"formId":"pm-growth-lab-followup-v1","submissionId":"UZ-TEST-0001","completion":50,"consent":true,"hp":"","sections":[{"n":1,"title":"TEST","items":[{"n":1,"question":"Pytanie testowe","answer":"Odpowiedź testowa","other":"","comment":"Komentarz testowy"}]}]}' \
  https://<nazwa-projektu>.vercel.app/api/pm-growth-lab/send-followup-report
```

Oczekiwany wynik: `HTTP/2 200` oraz `{"ok":true,...}`, a na skrzynce odbiorcy
wiadomość *„PM Growth Lab — odpowiedzi uzupełniające…”*.
Jeśli jej nie ma w Odebranych, sprawdź Spam i Oferty.

Najczęstsze odpowiedzi błędów:

| Odpowiedź | Znaczenie |
|---|---|
| `503 mail_not_configured` | brakuje którejś ze zmiennych środowiskowych |
| `502 mail_send_failed` | Resend odrzucił wysyłkę (zły klucz albo niedozwolony nadawca) |
| `403 origin_not_allowed` | żądanie z innego adresu niż GitHub Pages |

### Krok 4 — przekaż wykonawcy

Odeślij: **adres funkcji** (bez klucza) oraz **potwierdzenie, że testowy e-mail
dotarł**. Wtedy adres zostanie wpisany w `CONFIG.ENDPOINT` w `script.js`,
wdrożony na GitHub Pages i przetestowany na publicznej stronie.

### Uwaga o kopii strony na Vercelu

Vercel opublikuje przy okazji statyczną kopię całego repozytorium pod adresem
`*.vercel.app`. Plik `vercel.json` w katalogu głównym oznacza ją nagłówkiem
`X-Robots-Tag: noindex, nofollow`, więc nie trafi do wyszukiwarek. Adresem
roboczym pozostaje GitHub Pages.

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
