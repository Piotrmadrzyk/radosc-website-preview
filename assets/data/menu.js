/* ============================================================
   MENU KARTY — pizza, burgery, antipasti, makarony, śniadania
   ------------------------------------------------------------
   PROJEKT DEMONSTRACYJNY (portfolio). Dania i ceny są fikcyjne,
   przygotowane wyłącznie na potrzeby przykładowej strony.
   JEDYNE miejsce edycji tych kart. Format pozycji:
   { name: "Nazwa", desc: "składniki po przecinku", price: 32, veg: true }
   `price` w złotych (sama liczba) lub string, np. "27 / 31".
   ============================================================ */

/* START MENU PIZZA */
window.PERGOLA_PIZZA = {
  sizeNote: "Wszystkie pizze — średnica 40 cm.",
  note: "Sos czosnkowy lub ziołowy w cenie.",
  items: [
    { name: "Ogrodowa", desc: "sos pomidorowy, mozzarella, świeża bazylia, oliwa", price: 32, veg: true },
    { name: "Pergola Classic", desc: "sos pomidorowy, mozzarella, szynka, pieczarki", price: 38 },
    { name: "Ostra Nuta", desc: "sos pomidorowy, mozzarella, salami pikantne, papryka, czerwona cebula", price: 41 },
    { name: "Zagroda", desc: "sos BBQ, mozzarella, kurczak, kukurydza, cebula, kolendra", price: 43 },
    { name: "Słodko-Słona", desc: "sos śmietanowy, mozzarella, gruszka, ser pleśniowy, orzechy, miód, rukola", price: 42, veg: true },
    { name: "Alpejska", desc: "sos pomidorowy, mozzarella, pomidorki, szynka dojrzewająca, rukola, płatki sera", price: 45 },
    { name: "Leśna", desc: "masło ziołowe, mozzarella, mieszanka grzybów, cebula karmelizowana, tymianek", price: 42, veg: true },
    { name: "Swojska", desc: "sos pomidorowy, mozzarella, kiełbasa swojska, cebula, ogórek kiszony", price: 42 },
    { name: "Górska", desc: "sos pomidorowy, mozzarella, boczek, ser wędzony, konfitura żurawinowa, rukola", price: 46 }
  ]
};
/* KONIEC MENU PIZZA */

/* START MENU BURGERY */
window.PERGOLA_BURGERY = {
  sizeNote: "Burgery — 190 g mięsa, w zestawie frytki.",
  items: [
    { name: "Drobiowy Chrupiący", desc: "bułka maślana, panierowany kurczak, sałata, pomidor, piklowana cebula, ogórek, cheddar, sos ziołowy, frytki", price: 42 },
    { name: "Wołowy z Boczkiem", desc: "bułka maślana, wołowina, chrupiący boczek, ser wędzony, sałata, pomidor, cebula karmelizowana, sos BBQ, frytki", price: 45 },
    { name: "Warzywny z Ciecierzycy", desc: "kotlet z ciecierzycy, sałata, czerwona cebula, grillowana cukinia, ogórek, sos jogurtowy, frytki", price: 43, veg: true },
    { name: "Dodatkowa porcja frytek", price: 13 }
  ]
};
/* KONIEC MENU BURGERY */

/* START MENU ANTIPASTI */
window.PERGOLA_ANTIPASTI = {
  sizeNote: "Przystawki — na cieście pizzowym.",
  items: [
    { name: "Bruschetta Ogrodowa", desc: "pomidory, czerwona cebula, bazylia, oliwa, rukola", price: 16, veg: true },
    { name: "Bruschetta z Kozim Serem", desc: "cebula karmelizowana, ser kozi, miód", price: 17, veg: true }
  ]
};
/* KONIEC MENU ANTIPASTI */

/* START MENU MAKARONY */
window.PERGOLA_MAKARONY = {
  sizeNote: "Makaron świeży, przygotowywany na miejscu.",
  note: "Każdy makaron dostępny również w wersji bezglutenowej.",
  items: [
    { name: "Tagliatelle z Kurczakiem", desc: "sos śmietanowy, kurczak, pieczarki, parmezan", price: 36 },
    { name: "Pappardelle z Boczkiem", desc: "sos śmietanowy, boczek, cebula, natka", price: 36 },
    { name: "Penne Warzywne", desc: "pesto, pomidorki, cukinia, orzechy, parmezan", price: 35, veg: true }
  ]
};
/* KONIEC MENU MAKARONY */

/* START MENU ŚNIADANIA */
window.PERGOLA_SNIADANIA = {
  note: "Do każdego śniadania — kawa w cenie.",
  items: [
    { name: "Śniadanie Angielskie", desc: "2 jajka sadzone, kiełbaski, boczek, grillowany pomidor, fasolka w sosie, pieczywo", price: 32 },
    { name: "Jajecznica z Boczkiem", desc: "jajecznica z 3 jajek, boczek, cebula, szczypiorek, tarty ser, pieczywo na zakwasie", price: 27 },
    { name: "Chałka na Słodko", desc: "chałka maślana w jajku, konfitura, twaróg waniliowy, kruszonka, miód", price: 27, veg: true },
    { name: "Twaróg ze Szczypiorkiem", desc: "twaróg, rzodkiewka, szczypiorek, oliwa, pieczywo na zakwasie", price: 24, veg: true },
    { name: "Tost z Szynką i Serem", desc: "pieczywo tostowe, ser, szynka, suszone pomidory, rukola, sos, młode liście", price: 26 },
    { name: "Jajka po Benedyktyńsku", desc: "dwa jajka w koszulce, sos holenderski, szpinak, pieczywo na zakwasie", price: 26, veg: true },
    { name: "Owsianka Owocowa", desc: "owsianka na mleku lub roślinnym, sezonowe owoce, orzechy, miód", price: 22, veg: true }
  ]
};
/* KONIEC MENU ŚNIADANIA */
