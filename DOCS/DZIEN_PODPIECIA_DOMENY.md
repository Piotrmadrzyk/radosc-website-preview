# CO ZROBIĆ W DNIU PODPIĘCIA DOMENY restauracjaradosc.pl (ETAP 5.9)

Kolejność ma znaczenie. Szczegóły techniczne i przykładowe pliki:
`DOCS/PLAN_MIGRACJI_RESTAURACJARADOSC_PL.md` + `DOCS/MIGRACJA_PRZYKLADY/`
(pliki przykładowe są oznaczone „NIE UŻYWAĆ NA PREVIEW").

## Przed przełączeniem DNS
- [ ] Formularze podpięte i przetestowane (patrz `DOCS/FORMULARZE_INTEGRACJA.md`),
      usunięte `<p class="form-note">` z obu formularzy
- [ ] Polityka prywatności uzupełniona (patrz `DOCS/POLITYKA_PRYWATNOSCI_DO_UZUPELNIENIA.md`)
- [ ] Dane potwierdzone z właścicielką (`DOCS/DO_POTWIERDZENIA_Z_WLASCICIELKA.md`)

## Dzień przełączenia — zmiany w kodzie
- [ ] **canonical** — `<link rel="canonical">` na każdej z 7 stron z docelowym URL-em
- [ ] **usunięcie noindex** — zdjąć `<meta name="robots" content="noindex, nofollow">` ze WSZYSTKICH 7 stron
- [ ] **robots.txt** — wgrać produkcyjny (wzór: `MIGRACJA_PRZYKLADY/robots-przyklad.txt`)
- [ ] **sitemap.xml** — wygenerować z docelowymi URL-ami (wzór: `sitemap-przyklad.xml`)
- [ ] **Open Graph / Twitter** — podmienić `og:url`, `og:image` i `twitter:image`
      z adresów `piotrmadrzyk.github.io/...` na docelową domenę (7 stron)
- [ ] **JSON-LD** — podmienić wszystkie `url`, `@id`, `image`, `hasMenu`
      z adresów preview na docelową domenę (Restaurant, FoodEstablishment, FAQPage)
- [ ] **favicon** — obecnie inline SVG „R"; opcjonalnie dodać favicon.ico + apple-touch-icon
      z prawdziwym logo (wymaga pliku logo od właścicielki)
- [ ] **przekierowania** — 301 ze starych URL-i poprzedniej strony (jeżeli istniały)
      oraz www/bez-www i http→https (wzór: `redirects-przyklad.txt`)

## Dzień przełączenia — konfiguracja zewnętrzna
- [ ] **DNS/hosting** — podpięcie domeny, certyfikat SSL, wymuszenie HTTPS
- [ ] **Google Search Console** — dodanie i weryfikacja domeny, zgłoszenie sitemap.xml
- [ ] **Analytics** — jeżeli decyzja na tak: instalacja + baner zgody + aktualizacja polityki
- [ ] **Google Business Profile** — podpięcie adresu strony do wizytówki,
      spójność NAP (nazwa/adres/telefon) z JSON-LD

## Weryfikacja po przełączeniu
- [ ] Wszystkie 7 stron odpowiada 200 po HTTPS na docelowej domenie
- [ ] `noindex` NIE występuje w żadnym źródle (grep!)
- [ ] `site:restauracjaradosc.pl` po kilku dniach — sprawdzenie indeksowania
      + raport „Stan" w Search Console
- [ ] Test wyników rozszerzonych (Rich Results) dla JSON-LD
- [ ] Podgląd udostępniania FB/LinkedIn (debugger OG) i X/Twitter
- [ ] **Lighthouse** — końcowa weryfikacja Performance/A11y/Best Practices/SEO
      na produkcyjnym URL-u (mobile i desktop)
- [ ] Formularze: wysyłka testowa z produkcyjnej domeny dochodzi na skrzynkę
- [ ] Telefony klikalne na prawdziwym telefonie (723 800 801 / 601 940 856)

## Stan meta tagów na dziś (zweryfikowane w 5.9)
Wszystkie 7 stron ma: title, description, robots=noindex (celowo),
OG (title/description/type/url/image/alt/locale/site_name), Twitter card,
JSON-LD (Restaurant/FoodEstablishment + FAQPage), lang="pl", viewport,
favicon (inline SVG). Adresy w OG/JSON-LD wskazują preview — do podmiany
wg checklisty powyżej.
