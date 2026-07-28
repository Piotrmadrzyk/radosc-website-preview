/* ============================================================
   START MENU LUNCHOWE
   ------------------------------------------------------------
   PROJEKT DEMONSTRACYJNY (portfolio) — dania i ceny fikcyjne.
   JEDYNE miejsce edycji menu lunchowego.
   `veg: true` dodaje listek opcji wegetariańskiej.
   `note` (opcjonalne) — data obowiązywania menu.
   ============================================================ */
window.RADOSC_LUNCH = {
  hours: "od poniedziałku do piątku · 11:00–17:00",
  note: "",
  days: [
    {
      day: "Poniedziałek",
      soup: { name: "Krem z pieczonej dyni", veg: true },
      mains: [
        { label: "Danie dnia I", name: "Pieczony schab w sosie własnym", desc: "pieczone ziemniaki, surówka" },
        { label: "Danie dnia II", name: "Klopsiki drobiowe w sosie koperkowym", desc: "purée ziemniaczane, surówka" }
      ]
    },
    {
      day: "Wtorek",
      soup: { name: "Zupa jarzynowa", veg: true },
      mains: [
        { label: "Danie dnia I", name: "Kurczak z grilla w sosie ziołowym", desc: "ryż, mix sałat, frytki do wyboru" },
        { label: "Danie dnia II", name: "Zrazy wieprzowe w sosie cebulowym", desc: "kasza gryczana, ogórek małosolny" }
      ]
    },
    {
      day: "Środa",
      soup: { name: "Zupa pomidorowa z makaronem", veg: true },
      mains: [
        { label: "Danie dnia I", name: "Polędwiczki z kurczaka w chrupiącej panierce", desc: "parmezan, cząstki ziemniaczane" },
        { label: "Danie dnia II", name: "Pieczona karkówka", desc: "młode ziemniaki, sos pieprzowy, surówka" }
      ]
    },
    {
      day: "Czwartek",
      soup: { name: "Żurek z jajkiem i kiełbasą" },
      mains: [
        { label: "Danie dnia I", name: "Kotlet schabowy", desc: "purée ziemniaczane, mizeria" },
        { label: "Danie dnia II", name: "Leczo warzywne z ryżem", desc: "papryka, cukinia, pomidory", veg: true }
      ]
    },
    {
      day: "Piątek",
      soup: { name: "Barszcz czerwony", veg: true },
      mains: [
        { label: "Danie dnia I", name: "Naleśniki ze szpinakiem i serem", desc: "sos serowy", veg: true },
        { label: "Danie dnia II", name: "Dorsz pieczony z warzywami" },
        { label: "Danie dnia III", name: "Pizza Zagroda", desc: "sos BBQ, mozzarella, kurczak, kukurydza, cebula" }
      ]
    }
  ],
  vegetarian: {
    title: "Dania wegetariańskie — codziennie",
    items: [
      { name: "Naleśniki na słodko z serem", desc: "sos owocowy", veg: true },
      { name: "Pieczony ziemniak z twarożkiem", veg: true }
    ]
  }
};
/* KONIEC MENU LUNCHOWE */
