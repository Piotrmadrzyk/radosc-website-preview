/* ============================================================
   START MENU WEEKENDOWE
   ------------------------------------------------------------
   PROJEKT DEMONSTRACYJNY (portfolio) — dania, napoje i ceny
   fikcyjne; nazwy produktów celowo generyczne (bez marek).
   JEDYNE miejsce edycji menu weekendowego. Format jak w menu.js;
   `grams` — gramatura/objętość pozycji.
   ============================================================ */
window.RADOSC_WEEKEND = {
  startNote: "Od września zapraszamy również na weekendowe menu Bistro.",
  hoursNote: "Godziny otwarcia weekendowego podamy pod koniec sierpnia.",
  categories: [
    {
      title: "Przystawki",
      items: [
        { name: "Focaccia ziołowa", desc: "mozzarella, masło czosnkowe, sól morska", grams: "380 g", price: 18, veg: true },
        { name: "Grzanki z pastą", desc: "pieczywo na zakwasie, pasta z pieczonej papryki, oliwa", grams: "300 g", price: 22, veg: true },
        { name: "Frytki z batata", desc: "sos słodko-pikantny", grams: "170 g", price: 20, veg: true }
      ]
    },
    {
      title: "Zupy",
      items: [
        { name: "Domowy rosół", desc: "makaron, natka, oliwa ziołowa", grams: "280 ml", price: 21 },
        { name: "Zupa orientalna", desc: "makaron ryżowy; z kurczakiem lub warzywna (pikantna)", grams: "300 ml", price: "26 / 30" }
      ]
    },
    {
      title: "Dania główne",
      items: [
        { name: "Kotlet schabowy", desc: "purée ziemniaczane, surówka", grams: "440 g", price: 44 },
        { name: "Pierś z kurczaka z grilla", desc: "salsa owocowa, pieczywo płaskie, mix sałat z winegretem", grams: "420 g", price: 43 },
        { name: "Łosoś pieczony", desc: "warzywa julienne, prażony sezam", grams: "380 g", price: 52 },
        { name: "Pappardelle z pesto", desc: "pesto, mozzarella śmietankowa, orzechy", grams: "340 g", price: 40, veg: true },
        { name: "Pierogi domowe", desc: "masło, prażona cebulka", grams: "10 szt.", price: 31, veg: true },
        { name: "Sałatka z kurczakiem", desc: "grillowany kurczak, szpinak, suszone pomidory, żurawina, ser pleśniowy, dressing miodowo-musztardowy", grams: "350 g", price: 39 },
        { name: "Burger klasyczny", desc: "wołowina 200 g, cheddar, czerwona cebula, pomidor, ogórek kiszony, sałata, sosy, frytki; opcja wege na życzenie", grams: "—", price: 44 },
        { name: "Pinsa rzymska", desc: "salami pikantne, mozzarella śmietankowa, miód", grams: "480 g", price: 40 }
      ]
    },
    {
      title: "Desery",
      items: [
        { name: "Puchar lodowy", desc: "bita śmietana, sos karmelowy", grams: "350 g", price: 21 },
        { name: "Rurki z kremem", desc: "krem waniliowy, orzechy", grams: "270 g", price: 23, veg: true },
        { name: "Sernik pieczony", price: 17, veg: true }
      ]
    },
    {
      title: "Kawa",
      items: [
        { name: "Espresso", price: 9 },
        { name: "Espresso podwójne", price: 11 },
        { name: "Americano", price: 12 },
        { name: "Cappuccino", price: 15 },
        { name: "Flat White", price: 16 },
        { name: "Latte", price: 16 },
        { name: "Kawa mrożona", price: 17 },
        { name: "Mleko roślinne", price: "+ 2" },
        { name: "Syrop smakowy", price: "+ 3" }
      ]
    },
    {
      title: "Herbata i matcha",
      items: [
        { name: "Herbata Richmont", desc: "do wyboru: Ceylon Gold, Earl Grey, Green, Forest Fruits", price: 13, veg: true },
        { name: "Matcha Latte", price: 18, veg: true },
        { name: "Matcha mrożona", desc: "mango lub truskawka", price: 19, veg: true }
      ]
    },
    {
      title: "Napoje",
      items: [
        { name: "Woda Kropla Beskidu 0,33 l", desc: "niegazowana lub gazowana", price: 8, veg: true },
        { name: "Coca-Cola, Cola Zero, Fanta, Sprite, Fuze Tea 0,25 l", price: 12, veg: true },
        { name: "Sok Cappy 0,25 l", desc: "pomarańczowy, jabłkowy, multiwitamina", price: 10, veg: true },
        { name: "Sok tłoczony Bracia Sadownicy 0,25 l", desc: "jabłko, jabłko z marchewką", price: 12, veg: true },
        { name: "Domowa lemoniada 0,4 l", desc: "cytrynowa, lawendowa, truskawkowa", price: 15, veg: true }
      ]
    },
    {
      title: "Piwo",
      items: [
        { name: "Żywiec 0% 0,5 l", desc: "różne smaki", price: 13 },
        { name: "Heineken 0,5 l", price: 15 }
      ]
    }
  ]
};
/* KONIEC MENU WEEKENDOWE */
