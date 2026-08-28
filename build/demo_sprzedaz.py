# -*- coding: utf-8 -*-
"""
build/demo_sprzedaz.py — Zielona Pergola jest strona demonstracyjna na sprzedaz.

DLACZEGO TO ISTNIEJE

Dwa powody, oba wazne.

1. PRYWATNY ADRES I NUMER BYLY PUBLICZNE.
   Na 18 stronach (polskich i angielskich) widnial prywatny gmail wlasciciela
   i jego numer telefonu — na ekranie, w odnosnikach mailto: i tel:, oraz
   w danych strukturalnych JSON-LD, ktore czytaja wyszukiwarki. Strona stoi
   publicznie na GitHub Pages. Wlasciciel konsekwentnie nie publikuje swoich
   danych; Pergola zostala pominieta, bo mieszka w osobnym repozytorium.

2. STRONA NIE MOWILA, ZE MOZNA JA KUPIC.
   Pisala, ze jest "projektem demonstracyjnym", ale nikt sie z tego nie
   dowiadywal, ze taka strone mozna zamowic dla siebie — a to jedyny powod,
   dla ktorego ona istnieje.

CO ROBI
  1. Przestawia kontakty na firmowe Probatum.
  2. Dokleja pasek sprzedazowy nad stopka — po polsku w wersji PL,
     po angielsku w katalogu en/.
  3. Przepisuje linijke na dole stopki.

Skrypt mozna puszczac wielokrotnie — pomija strony, ktore juz maja pasek.

JAK URUCHOMIC
    cd build && python3 demo_sprzedaz.py

CZEGO NIE RUSZA
  - oferta.html — to katalog funkcji, ma wlasny mechanizm sprzedazowy
    i wlasny formularz; drugi pasek bylby powtorzeniem,
  - 404.html,
  - katalogow kolekcja/ i pm-growth-lab/ — to osobne projekty, ktore
    przypadkiem mieszkaja w tym samym repozytorium,
  - zmyslonego adresu pocztowego restauracji (ul. Cyprysowa 12). Jest czescia
    scenografii, a pasek mowi wprost, ze lokal nie istnieje.
"""

import os
import re

from urllib.parse import quote

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

# Prawdziwe dane firmowe.
MAIL = u'kontakt@probatum.pl'
TEL_POKAZ = u'573 569 141'
TEL_LINK = u'+48573569141'

# Dane prywatne, ktore maja zniknac ze strony.
MAIL_PRYWATNY = u'piotr.aparat@gmail.com'
TEL_PRYWATNY_LINK = u'+48795870359'
TEL_PRYWATNY_POKAZ = u'795 870 359'

AKCENT = u'#A9812F'          # zloto Pergoli
AKCENT_TEKST = u'#15321F'    # ciemna zielen — czytelna na zlocie

# Stopki do przepisania. Wersji angielskich jest kilka — powstawaly osobno.
DOPISKI = {
    u'Projekt demonstracyjny (portfolio). Fikcyjna marka, dane i zdjęcia poglądowe. '
    u'Zbudowano z pomocą AI.':
        u'Strona demonstracyjna Probatum — restauracja jest zmyślona. '
        u'<a href="https://probatum.pl" style="color:inherit">probatum.pl</a>',

    u'Demo project (portfolio). Fictional brand, sample data and illustrative photos. '
    u'Built with AI.':
        u'A Probatum demo site — the restaurant is fictional. '
        u'<a href="https://probatum.pl" style="color:inherit">probatum.pl</a>',

    u'Demonstration project (portfolio). Fictional brand, sample data and illustrative '
    u'photos. Built with the help of AI.':
        u'A Probatum demo site — the restaurant is fictional. '
        u'<a href="https://probatum.pl" style="color:inherit">probatum.pl</a>',

    u'Demonstration project (portfolio). Fictional brand; sample data and photos. '
    u'Built with the help of AI.':
        u'A Probatum demo site — the restaurant is fictional. '
        u'<a href="https://probatum.pl" style="color:inherit">probatum.pl</a>',
}

NOWY_EN = (u'A Probatum demo site \u2014 the restaurant is fictional. '
           u'<a href="https://probatum.pl" style="color:inherit">probatum.pl</a>')

# Wersji angielskiej linijki jest kilka — powstawaly osobno i roznia sie
# drobiazgami ("Fictional" / "Fictitious", "sample data" / "data for
# illustration only"). Wyliczanie ich wszystkich z palca skonczyloby sie
# tym, ze kolejny wariant zostalby przeoczony, wiec lapiemy wzorcem.
WZOR_EN = re.compile(r'[^<>]*(?:portfolio|[Dd]emo project|[Dd]emonstration project)'
                     r'[^<>]*(?:Fictional|Fictitious)[^<>]*AI\.', re.S)

TRESC = {
    'pl': {
        'etykieta': u'Probatum · strona demonstracyjna',
        'tytul':    u'Ta strona jest do wzięcia',
        'akapit1':  u'<b>Zielona Pergola nie istnieje.</b> To projekt pokazowy — zbudowany '
                    u'po to, żeby restaurator zobaczył swoją przyszłą stronę, zanim za nią '
                    u'zapłaci. Wszystko, co tu działa, działa naprawdę: rezerwacja stolika, '
                    u'zamówienie pizzy, lunch dnia na cały tydzień, catering i asystent, '
                    u'który odpowiada gościom.',
        'akapit2':  u'Bierzemy ten sam szkielet i przestawiamy go na Twój lokal — treści, '
                    u'zdjęcia, kolory, formularze. Nie zaczynamy od pustej kartki, więc '
                    u'wiadomo z góry, jak to będzie wyglądać i ile będzie kosztować.',
        'btn1':     u'Zarezerwuj tę stronę',
        'btn2':     u'Zobacz, co ta strona potrafi',
        'kontakt':  u'Napisz albo zadzwoń:',
        'temat':    u'Rezerwuję stronę: Zielona Pergola',
        'katalog':  u'oferta.html',
        'aria':     u'Informacja o stronie demonstracyjnej',
    },
    'en': {
        'etykieta': u'Probatum · demo site',
        'tytul':    u'This site is available',
        'akapit1':  u'<b>Zielona Pergola does not exist.</b> It is a showcase project — '
                    u'built so that a restaurant owner can see their future website before '
                    u'paying for it. Everything here genuinely works: table booking, pizza '
                    u'ordering, the weekly lunch menu, catering and an assistant that '
                    u'answers guests.',
        'akapit2':  u'We take this same structure and rebuild it around your venue — copy, '
                    u'photos, colours, forms. We do not start from a blank page, so you know '
                    u'up front how it will look and what it will cost.',
        'btn1':     u'Reserve this site',
        'btn2':     u'See what this site can do',
        'kontakt':  u'Email or call:',
        'temat':    u'Site reservation: Zielona Pergola',
        'katalog':  u'../oferta.html',
        'aria':     u'Information about this demonstration site',
    },
}


def pasek(jezyk):
    d = TRESC[jezyk]
    return (u'\n<!-- ————— PASEK SPRZEDAZOWY PROBATUM ————— -->\n'
            u'<section class="pmd-pasek" aria-label="%(aria)s">\n'
            u'  <div class="pmd-in">\n'
            u'    <p class="pmd-etykieta">%(etykieta)s</p>\n'
            u'    <h2 class="pmd-tytul">%(tytul)s</h2>\n'
            u'    <p class="pmd-opis">%(akapit1)s</p>\n'
            u'    <p class="pmd-opis">%(akapit2)s</p>\n'
            u'    <div class="pmd-akcje">\n'
            u'      <a class="pmd-btn" href="mailto:%(mail)s?subject=%(temat)s">%(btn1)s</a>\n'
            u'      <a class="pmd-btn2" href="%(katalog)s">%(btn2)s</a>\n'
            u'    </div>\n'
            u'    <p class="pmd-kontakt">%(kontakt)s\n'
            u'      <a href="mailto:%(mail)s">%(mail)s</a>\n'
            u'      · <a href="tel:%(tel_link)s">%(tel_pokaz)s</a>\n'
            u'    </p>\n'
            u'  </div>\n'
            u'</section>\n'
            u'<style>\n'
            u'  .pmd-pasek{background:#14161b;border-top:3px solid %(akcent)s;\n'
            u'    padding:52px 20px 56px;color:#c9ced8;\n'
            u'    font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}\n'
            u'  .pmd-in{max-width:720px;margin:0 auto;display:grid;gap:16px;\n'
            u'    text-align:center;justify-items:center}\n'
            u'  .pmd-etykieta{margin:0;font-size:.74rem;letter-spacing:.16em;\n'
            u'    text-transform:uppercase;color:%(akcent)s;font-weight:700}\n'
            u'  .pmd-tytul{margin:0;color:#fff;font-size:clamp(1.7rem,4vw,2.3rem);\n'
            u'    line-height:1.15;font-weight:700;letter-spacing:-.02em;text-wrap:balance}\n'
            u'  .pmd-opis{margin:0;font-size:1rem;line-height:1.72;color:#c9ced8;max-width:62ch}\n'
            u'  .pmd-opis b{color:#fff}\n'
            u'  .pmd-akcje{display:flex;flex-wrap:wrap;gap:12px;margin-top:6px;\n'
            u'    justify-content:center}\n'
            u'  .pmd-btn,.pmd-btn2{display:inline-block;text-decoration:none;\n'
            u'    padding:.85rem 1.5rem;border-radius:999px;font-weight:700;font-size:.94rem;\n'
            u'    transition:transform .18s ease}\n'
            u'  .pmd-btn{background:%(akcent)s;color:%(akcent_tekst)s}\n'
            u'  .pmd-btn2{background:transparent;color:#e7e9ee;\n'
            u'    border:1px solid rgba(255,255,255,.26)}\n'
            u'  .pmd-btn:hover,.pmd-btn2:hover{transform:translateY(-2px)}\n'
            u'  .pmd-btn2:hover{border-color:rgba(255,255,255,.5)}\n'
            u'  .pmd-btn:focus-visible,.pmd-btn2:focus-visible{outline:2px solid #fff;\n'
            u'    outline-offset:3px}\n'
            u'  .pmd-kontakt{margin:4px 0 0;font-size:.92rem;color:#9aa2af}\n'
            u'  .pmd-kontakt a{color:#fff;text-decoration:none;\n'
            u'    border-bottom:1px solid rgba(255,255,255,.35)}\n'
            u'  .pmd-kontakt a:hover{border-bottom-color:#fff}\n'
            u'  @media (prefers-reduced-motion:reduce){\n'
            u'    .pmd-btn,.pmd-btn2{transition:none}\n'
            u'    .pmd-btn:hover,.pmd-btn2:hover{transform:none}}\n'
            u'</style>\n') % {
        'aria': d['aria'], 'etykieta': d['etykieta'], 'tytul': d['tytul'],
        'akapit1': d['akapit1'], 'akapit2': d['akapit2'],
        'btn1': d['btn1'], 'btn2': d['btn2'], 'kontakt': d['kontakt'],
        'katalog': d['katalog'], 'temat': quote(d['temat'], safe=''),
        'mail': MAIL, 'tel_link': TEL_LINK, 'tel_pokaz': TEL_POKAZ,
        'akcent': AKCENT, 'akcent_tekst': AKCENT_TEKST,
    }


def przerob(sciezka, jezyk, z_paskiem):
    with open(sciezka, encoding='utf-8') as fh:
        t = fh.read()
    przed = t
    zrobione = []

    # 1. Prywatny adres — na ekranie, w mailto: i w JSON-LD.
    if MAIL_PRYWATNY in t:
        zrobione.append('mail x%d' % t.count(MAIL_PRYWATNY))
        t = t.replace(MAIL_PRYWATNY, MAIL)

    # 2. Prywatny numer — trzy postacie: odnosnik tel:, numer na ekranie
    #    i pole "telephone" w danych strukturalnych.
    ile = (t.count('tel:' + TEL_PRYWATNY_LINK) + t.count(TEL_PRYWATNY_POKAZ)
           + t.count('"%s"' % TEL_PRYWATNY_LINK))
    if ile:
        t = t.replace('tel:' + TEL_PRYWATNY_LINK, 'tel:' + TEL_LINK)
        t = t.replace('"%s"' % TEL_PRYWATNY_LINK, '"%s"' % TEL_LINK)
        t = t.replace(TEL_PRYWATNY_POKAZ, TEL_POKAZ)
        zrobione.append('telefon x%d' % ile)

    # 3. Pasek sprzedazowy nad stopka.
    if z_paskiem and 'pmd-pasek' not in t:
        i = t.rfind('<footer')
        if i != -1:
            t = t[:i] + pasek(jezyk) + t[i:]
            zrobione.append('pasek')

    # 4. Linijka na dole stopki.
    zrobiony_dopisek = False
    for stary, nowy in DOPISKI.items():
        if stary in t:
            t = t.replace(stary, nowy)
            zrobiony_dopisek = True
            break
    if not zrobiony_dopisek and WZOR_EN.search(t):
        t = WZOR_EN.sub(NOWY_EN, t)
        zrobiony_dopisek = True
    if zrobiony_dopisek:
        zrobione.append('dopisek')

    if t != przed:
        with open(sciezka, 'w', encoding='utf-8') as fh:
            fh.write(t)
    return zrobione


# oferta.html ma wlasny mechanizm sprzedazowy; 404 nie jest strona tresciowa.
BEZ_PASKA = {'oferta.html', '404.html'}


def main():
    zadania = []
    for nazwa in sorted(os.listdir(ROOT)):
        if nazwa.endswith('.html'):
            zadania.append((os.path.join(ROOT, nazwa), 'pl',
                            nazwa not in BEZ_PASKA, nazwa))
    kat_en = os.path.join(ROOT, 'en')
    if os.path.isdir(kat_en):
        for nazwa in sorted(os.listdir(kat_en)):
            if nazwa.endswith('.html'):
                zadania.append((os.path.join(kat_en, nazwa), 'en',
                                nazwa not in BEZ_PASKA, 'en/' + nazwa))

    zmienione = 0
    for sciezka, jezyk, z_paskiem, etykieta in zadania:
        zrobione = przerob(sciezka, jezyk, z_paskiem)
        if zrobione:
            zmienione += 1
            print('  %-32s %s' % (etykieta, ', '.join(zrobione)))
        else:
            print('  %-32s bez zmian' % etykieta)
    print('\nZmienionych stron: %d' % zmienione)


if __name__ == '__main__':
    main()
