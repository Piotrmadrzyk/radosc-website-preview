/* ============================================================
   MENU KARTY — pizza, burgery, antipasti, makarony, śniadania
   ------------------------------------------------------------
   JEDYNE miejsce edycji tych kart. Format pozycji:
   { name: "Nazwa", desc: "składniki po przecinku", price: 32, veg: true }
   `price` w złotych (sama liczba); `price` może być stringiem,
   np. "27 / 31" przy dwóch wariantach. `veg` dodaje listek.
   Dane przepisane 1:1 z przekazanych grafik menu.
   ============================================================ */

/* START MENU PIZZA */
window.RADOSC_PIZZA = {
  sizeNote: "Wszystkie pizze — średnica 38 cm.",
  note: "Dwa sosy gratis: pomidorowy i czosnkowy.",
  items: [
    { name: "Margherita", desc: "sos pomidorowy, fior di latte, bazylia", price: 30, veg: true },
    { name: "Capricciosa", desc: "sos pomidorowy, fior di latte, szynka cotto, pieczarki", price: 37 },
    { name: "Pepperoni", desc: "sos pomidorowy, fior di latte, pepperoni, czerwona cebula", price: 39 },
    { name: "BBQ", desc: "sos BBQ, fior di latte, kurczak, kukurydza, czerwona cebula, czosnek", price: 42 },
    { name: "Bianco", desc: "sos śmietanowy, fior di latte, gruszka, gorgonzola, orzechy włoskie, miód, rukola", price: 40, veg: true },
    { name: "Parma", desc: "sos pomidorowy, fior di latte, pomidorki, szynka parmeńska, rukola, parmezan", price: 43 },
    { name: "Funghi", desc: "masło czosnkowe, fior di latte, pieczarki, szynka cotto, karmelizowana cebula, sól morska", price: 41 },
    { name: "Wiejska", desc: "sos pomidorowy, fior di latte, kiełbasa, cebula, ogórek kiszony", price: 41 },
    { name: "Góralska", desc: "sos pomidorowy, fior di latte, boczek, oscypek, konfitura z żurawiny, rukola", price: 44 }
  ]
};
/* KONIEC MENU PIZZA */

/* START MENU BURGERY */
window.RADOSC_BURGERY = {
  sizeNote: "Burgery — 180 g mięsa, w zestawie frytki.",
  items: [
    { name: "Kurczak Burger", desc: "bułka własnego wypieku, chrupiący kurczak marynowany w papryce, sałata, pomidor, piklowana cebula, ogórek konserwowy, cheddar, sos autorski, frytki", price: 41 },
    { name: "Bekon Burger", desc: "bułka własnego wypieku, wołowina, wędzony boczek, wędzony ser, sałata, pomidor, karmelizowana cebula, ogórek konserwowy, mayo-ketchup, frytki", price: 43 },
    { name: "Vege Burak", desc: "kotlet z buraka, sałata, czerwona cebula, grillowany bakłażan, ogórek konserwowy, sos autorski, frytki", price: 42, veg: true },
    { name: "Dodatkowa porcja frytek", price: 12 }
  ]
};
/* KONIEC MENU BURGERY */

/* START MENU ANTIPASTI */
window.RADOSC_ANTIPASTI = {
  sizeNote: "Anti pasti — bruschetta na cieście do pizzy.",
  items: [
    { name: "Bruschetta tricolore", desc: "pesto bazyliowe, cebula czerwona, pomidorki koktajlowe, rukola", price: 15 },
    { name: "Bruschetta Mario", desc: "karmelizowana czerwona cebula, ser kozi, miód", price: 15 }
  ]
};
/* KONIEC MENU ANTIPASTI */

/* START MENU MAKARONY */
window.RADOSC_MAKARONY = {
  sizeNote: "Makaron rzemieślniczy, zapiekany.",
  note: "Każdy makaron dostępny jest również w wersji bezglutenowej.",
  items: [
    { name: "Tagliatelle PPF", desc: "sos bechamel, szynka cotto, pieczarki, fior di latte", price: 35 },
    { name: "Pappardelle", desc: "sos bechamel, wędzony boczek, cebula, fior di latte", price: 35 },
    { name: "Vege Genovese", desc: "sos pesto, pomidorki koktajlowe, cukinia, orzeszki pini, fior di latte", price: 35, veg: true }
  ]
};
/* KONIEC MENU MAKARONY */

/* START MENU ŚNIADANIA
   Przepisane 1:1 z kart śniadaniowych z archiwum zdjęć (7 pozycji). */
window.RADOSC_SNIADANIA = {
  note: "Do każdego śniadania — kawa gratis!",
  items: [
    { name: "English breakfast", desc: "2 jajka sadzone, 2 frankfurterki, 2 plastry boczku, grillowany pomidor, fasolka w sosie pomidorowym, pajda chleba", price: 31 },
    { name: "Jajecznica z bekonem i serem", desc: "jajecznica z 3 jajek, bekon, cebula, szczypiorek, tarty ser, pajda chleba na zakwasie", price: 26 },
    { name: "Chałka na słodko", desc: "chałka maślana w jajku, konfitura porzeczkowa, twaróg waniliowy, kruszonka migdałowa, miód tymiankowy", price: 26 },
    { name: "Twaróg wędzony, z jajkami", desc: "pianka z twarogu wędzonego, jajko poche, karmelizowana brukselka w miodzie, oliwa chili, pajda chleba na zakwasie", price: 25 },
    { name: "Tost cotto", desc: "chlebek shokupan, ser mimolette, prosciutto cotto, suszone pomidory, rukola, sos majonezowy, młode liście", price: 25 },
    { name: "Jajko po turecku", desc: "labneh, palone masło z chili, dwa jajka poche, pomidorki koktajlowe, młode liście, pajda chleba na zakwasie", price: 24 },
    { name: "Pajda z owczym serem", desc: "ser owczy, chutney figowy, orzeszki pini, rukola, oliwa, chili", price: 24 }
  ]
};
/* KONIEC MENU ŚNIADANIA */
