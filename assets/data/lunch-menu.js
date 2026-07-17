/* ============================================================
   START MENU LUNCHOWE
   ------------------------------------------------------------
   JEDYNE miejsce edycji menu lunchowego.
   Po zmianie: zapisz plik, zrób commit i push — strona Bistro
   zaktualizuje się automatycznie.
   `veg: true` dodaje listek opcji wegetariańskiej.
   `note` (opcjonalne) — data obowiązywania menu, np. "13–17 stycznia".
   Ceny zestawów NIE są publikowane, dopóki właściciel ich nie potwierdzi.
   ============================================================ */
window.RADOSC_LUNCH = {
  hours: "od poniedziałku do piątku · 11:00–17:00",
  note: "",
  days: [
    {
      day: "Poniedziałek",
      soup: { name: "Zupa gryczana", veg: true },
      mains: [
        { label: "Danie dnia I", name: "Schab pieczony", desc: "pieczone ziemniaki, sos własny, surówka" },
        { label: "Danie dnia II", name: "Pulpety drobiowe w sosie koperkowym", desc: "puree ziemniaczane, surówka" }
      ]
    },
    {
      day: "Wtorek",
      soup: { name: "Zupa kapuściana", veg: true },
      mains: [
        { label: "Danie dnia I", name: "Burger hawajski", desc: "grillowany filet z kurczaka i ananas, pomidor, ogórek, sałata, sos autorski, frytki" },
        { label: "Danie dnia II", name: "Bitki wieprzowe w sosie cebulowym", desc: "kasza gryczana, ogórek małosolny" }
      ]
    },
    {
      day: "Środa",
      soup: { name: "Zupa pomidorowa z makaronem", veg: true },
      mains: [
        { label: "Danie dnia I", name: "Fileciki z kurczaka w panko", desc: "Grana Padano, cząstki ziemniaczane" },
        { label: "Danie dnia II", name: "Pieczona karkówka", desc: "młode ziemniaki, sos pieprzowy, surówka" }
      ]
    },
    {
      day: "Czwartek",
      soup: { name: "Barszcz biały z kiełbasą i pieczywem" },
      mains: [
        { label: "Danie dnia I", name: "Kotlet schabowy", desc: "puree ziemniaczane, mizeria" },
        { label: "Danie dnia II", name: "Frytki z posypką", desc: "kurczak, warzywa, cheddar, sos czosnkowy" }
      ]
    },
    {
      day: "Piątek",
      soup: { name: "Barszcz czerwony", veg: true },
      mains: [
        { label: "Danie dnia I", name: "Krokiety z kapustą i pieczarkami", desc: "sos pieczarkowy", veg: true },
        { label: "Danie dnia II", name: "Ryba po grecku" },
        { label: "Danie dnia III", name: "Pizza BBQ", desc: "sos BBQ, fior di latte, kurczak, kukurydza, cebula" }
      ]
    }
  ],
  vegetarian: {
    title: "Dania wegetariańskie — codziennie",
    items: [
      { name: "Naleśniki na słodko z serem", desc: "sos owocowy", veg: true },
      { name: "Pieczony ziemniak z gzikiem", veg: true }
    ]
  }
};
/* KONIEC MENU LUNCHOWE */
