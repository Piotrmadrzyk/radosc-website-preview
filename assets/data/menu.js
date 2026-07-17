/* ============================================================
   MENU KARTY — pizza, burgery, śniadania
   ------------------------------------------------------------
   JEDYNE miejsce edycji tych trzech kart. Format pozycji:
   { name: "Nazwa", desc: "składniki po przecinku", price: 32 }
   `price` w złotych (sama liczba). Pozycje bez potwierdzonej ceny
   zostawić bez pola price — strona pokaże pozycję bez ceny.
   ============================================================ */

/* START MENU PIZZA
   UWAGA: grafika z menu pizzy nie została jeszcze przekazana.
   Lista celowo pusta — strona pokazuje wtedy elegancki komunikat
   „zadzwoń i zapytaj”. Po otrzymaniu menu wystarczy dopisać pozycje
   według formatu powyżej. `sizeNote` — wspólna informacja o rozmiarze,
   np. "Wszystkie pizze ⌀32 cm". */
window.RADOSC_PIZZA = {
  sizeNote: "",
  items: []
};
/* KONIEC MENU PIZZA */

/* START MENU BURGERY
   UWAGA: grafika z menu burgerów nie została jeszcze przekazana.
   Lista celowo pusta — jak wyżej. */
window.RADOSC_BURGERY = {
  items: []
};
/* KONIEC MENU BURGERY */

/* START MENU ŚNIADANIA
   Przepisane 1:1 z kart śniadaniowych z archiwum zdjęć (7 pozycji).
   Do każdego śniadania: kawa gratis. */
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
