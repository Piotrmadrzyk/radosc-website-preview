# PM POWER LAB — Operacja Kaloryfer

**Strategiczny formularz ustalenia wspólnych treningów.**

Prywatna, żartobliwa ankieta dla dwóch osób: **Piotrka** i **Bartka**, szefa kuchni
Bistro Pełne Radości. Celem jest ustalenie konkretnego planu wspólnych treningów
na siłowni **Zdrofit Rzeszów, al. gen. Leopolda Okulickiego**.

- Adres: `https://piotrmadrzyk.github.io/radosc-website-preview/pm-growth-lab/silownia/`
- Moduł jest **całkowicie niezależny** od formularzy PM Growth Lab dla Michała
  (`../` oraz `../uzupelnienie/`). Nie współdzieli z nimi żadnego pliku, klucza
  `localStorage` ani adresu.

---

## Pliki

```
pm-growth-lab/silownia/
├── index.html    # struktura strony
├── styles.css    # design system (granat + turkus + limonka)
├── script.js     # dane pytań, silnik ekranów, walidacja, kontrakt, eksport
├── img/          # 15 ilustracji WebP
└── README.md     # ten plik
```

---

## Jak działa

- Ekran startowy → **12 ekranów pytań** → podsumowanie z kontraktem → ekran końcowy.
- Jedno pytanie na ekran, własna ilustracja przy każdym pytaniu.
- Pasek postępu, numer pytania i procent u góry.
- Przyciski **Wstecz** / **Dalej** w stałym pasku na dole (z uwzględnieniem
  safe area na iPhonie).
- **Enter** przechodzi dalej wszędzie tam, gdzie jest to bezpieczne — nie działa
  w polu tekstowym ani na przyciskach, a przy polach wyboru przełącza zaznaczenie.
- Autozapis w `localStorage` (klucz `pmpowerlab.kaloryfer.v1`) — po odświeżeniu
  strony formularz proponuje kontynuację od ostatniego miejsca.
- Stopka zawiera **„Zacznij badanie od nowa”** z potwierdzeniem.
- Brak backendu, brak zewnętrznych bibliotek, brak wysyłki czegokolwiek na serwer.

### Walidacja

Żadnego pytania nie da się pominąć. Formularz sprawdza:

- wybór odpowiedzi (jednokrotny i wielokrotny),
- wpisanie własnej godziny po zaznaczeniu „Inna godzina”,
- poprawność daty rozpoczęcia (nie może być z przeszłości),
- **konflikt dni** — ten sam dzień nie może być jednocześnie możliwy (pytanie 4)
  i absolutnie niemożliwy (pytanie 5),
- zatwierdzenie kontraktu przez obie strony przed przejściem na ekran końcowy.

Komunikaty błędów pojawiają się przy pytaniu i jednocześnie jako krótki toast.

### Kontrakt

Po ostatnim pytaniu formularz składa **Kontrakt Operacji Kaloryfer** — tabelę
ustaleń i pełną treść dokumentu, w całości na podstawie udzielonych odpowiedzi.
Kontrakt zatwierdzają dwa przyciski: „Piotrek — zatwierdzam” i „Bartek —
zatwierdzam”. Dopiero po obu zatwierdzeniach pojawia się komunikat o zawarciu
kontraktu i można przejść na ekran końcowy. To zwykłe przełączniki, nie podpis
elektroniczny.

### Eksport

Cztery przyciski, dostępne na ekranie kontraktu i na ekranie końcowym:

| Przycisk | Efekt |
|---|---|
| Kopiuj kontrakt | schowek; przy blokadzie przeglądarki pokazuje okno z alternatywą |
| Pobierz TXT | `kontrakt-operacja-kaloryfer.txt` |
| Pobierz JSON | `operacja-kaloryfer.json` — pełne odpowiedzi i ustalenia |
| Drukuj lub zapisz PDF | systemowe drukowanie; drukuje wyłącznie czysty kontrakt |

### Wskaźnik ryzyka wymówek

Dyskretna plakietka pod paskiem postępu, licząca punkty z odpowiedzi (liczba
treningów, liczba dni, odległość daty startu, liczba wykreślonych wymówek,
liczba dopuszczalnych powodów odwołania, rodzaj kary). Cztery poziomy:
**Niskie**, **Umiarkowane**, **Wysokie**, **Krytyczne**. Nie blokuje niczego
i nie wpływa na walidację — pojawia się dopiero po dwóch odpowiedziach.

---

## Grafiki

15 ilustracji w jednym stylu: półrealistyczna reklamowa grafika 3D, dwóch
powtarzających się bohaterów (szef kuchni w białej bluzie kucharskiej oraz
organizator w granatowej bluzie), klimat sportowo-kulinarny. Pierwsza grafika
powstała z opisu tekstowego, pozostałe 14 na jej podstawie — dzięki temu postacie
i styl są spójne. W obrazach nie ma żadnych napisów ani logotypów.

| Plik | Scena |
|---|---|
| `start.webp` | uścisk dłoni nad hantlem — zawarcie umowy |
| `q01.webp` | obaj wskazują na siebie kciukami |
| `q02.webp` | pomiar bicepsa taśmą krawiecką |
| `q03.webp` | magnesy-hantle na wielkim planerze |
| `q04.webp` | analiza tygodnia jak mapy wojskowej |
| `q05.webp` | kuchenny szczyt i czekająca torba treningowa |
| `q06.webp` | walka z ogromnym budzikiem o świcie |
| `q07.webp` | bieżnia i wielki zegar ścienny |
| `q08.webp` | bloki startowe o wschodzie słońca |
| `q09.webp` | karuzela sprzętu do ćwiczeń |
| `q10.webp` | wynoszenie kanapy z siłowni |
| `q11.webp` | pilny telefon z kuchni |
| `q12.webp` | kawa i sałatka jako kara umowna |
| `kontrakt.webp` | uroczysta przysięga nad hantlem |
| `finisz.webp` | opieranie się wizji burgera |

Wszystkie pliki to WebP o szerokości 1280 px i proporcjach 16:9. Ilustracje
ładują się leniwie, a następna jest wczytywana w tle. Gdyby którejkolwiek
zabrakło, karta pytania po prostu ją pomija — formularz działa dalej.

---

## Zgodność

- iPhone, iPad, Android, komputer; layout od 320 px w górę.
- Brak przewijania w poziomie, uwzględniona safe area, minimalna wysokość
  elementów dotykowych 54 px.
- Widoczny fokus, etykiety `aria-label`, `aria-live`, link „Przejdź do treści”.
- Respektuje `prefers-reduced-motion`.
- Service worker strony nie cache'uje ścieżki `/pm-growth-lab/`, więc zmiany
  w module są widoczne od razu.
