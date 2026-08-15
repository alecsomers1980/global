// Real menu content transcribed from the client's own PDF menus
// (public/menus/*.pdf) — kept here as on-page HTML instead of PDF links so
// it's actually indexable (the whole point of moving off PDFs). Prices and
// items are exactly as printed; the PDFs remain in public/menus/ in case
// staff want to keep sharing the original design directly.

export type MenuItem = { name: string; desc?: string; price?: string };
export type MenuSection = { name: string; items: MenuItem[] };
export type Menu = { slug: string; name: string; priceNote?: string; sections: MenuSection[] };

export const MENUS: Menu[] = [
  {
    slug: "breakfast",
    name: "Breakfast",
    sections: [
      {
        name: "Waffles",
        items: [
          { name: "Served with sautéed apples", price: "R45.70" },
          { name: "Syrup or honey", price: "R47.90" },
        ],
      },
      {
        name: "Cheese & Mushroom Omelette",
        items: [
          { name: "Made with 2 eggs, filled with diced mushroom, and grated cheese, served with a slice of toast", price: "R66.00" },
          { name: "Vegetable omelette", price: "R66.00" },
        ],
      },
      {
        name: "Double Up",
        items: [{ name: "2 eggs, 2 sausages, 2 bacon and a slice of toast", price: "R69.00" }],
      },
      {
        name: "Eggs Mushroom",
        items: [{ name: "2 eggs scrambled with fried mushrooms and beans, and a slice of toast", price: "R69.90" }],
      },
      {
        name: "Breakfast Cereals",
        items: [
          { name: "Corn flakes", price: "R45.00" },
          { name: "All bran flakes", price: "R45.00" },
          { name: "Muesli with yoghurt", price: "R45.00" },
        ],
      },
      {
        name: "Pancakes",
        items: [
          { name: "Chocolate chip pancakes", price: "R47.90" },
          { name: "With sunny side up and sausages", price: "R47.90" },
        ],
      },
      {
        name: "Avocado On Toast",
        items: [{ name: "2 slices of toast topped with 2 eggs and sliced avocado", price: "R47.90" }],
      },
      {
        name: "Mega Breakfast",
        items: [
          { name: "2 eggs, 3 back bacon, 2 sausages, beef patty, sautéed onion, large chips, and a slice of toast", price: "R67.90" },
        ],
      },
      {
        name: "Egg In A Basket",
        items: [{ name: "2 eggs, 2 slices of toast, sliced avocado and bacon", price: "R67.90" }],
      },
      {
        name: "Extras",
        items: [
          { name: "Large chips", price: "R45.70" },
          { name: "Regular chips", price: "R30.00" },
          { name: "Bacon", price: "R9.00" },
          { name: "Sausage (large)", price: "R25.00" },
          { name: "Cheese, sliced", price: "R12.00" },
          { name: "Egg", price: "R11.00" },
          { name: "Sausage (small)", price: "R15.00" },
          { name: "1 slice toast", price: "R15.00" },
        ],
      },
      {
        name: "Juices",
        items: [
          { name: "Orange juice", price: "R27.00" },
          { name: "Fruit cocktail", price: "R27.00" },
          { name: "Milk", price: "R25.00" },
        ],
      },
      {
        name: "Coffee",
        items: [
          { name: "Cappuccino", desc: "Single R35.00 · Double R43.00" },
          { name: "Espresso", desc: "Single R35.00 · Double R44.00" },
          { name: "Coffee latte", desc: "Single R38.00 · Double R44.00" },
          { name: "Cold brew coffee with ice", desc: "Single R33.90 · Double R42.00" },
        ],
      },
    ],
  },
  {
    slug: "lunch",
    name: "Lunch",
    sections: [
      {
        name: "Salads",
        items: [
          { name: "Pasta salad", desc: "Robot peppers with cheese macaroni and fruit cocktail" },
          { name: "Greek salad", desc: "Lettuce with cucumber, tomatoes and sliced red onion" },
          { name: "Chef salad", desc: "Lettuce with tomatoes, cheddar cheese, boiled eggs, and avocado" },
        ],
      },
      {
        name: "Entrée",
        items: [
          { name: "Potato wedges", desc: "Served with hake fish tart sauce and thousand island", price: "R99.00" },
          { name: "Chicken wings", desc: "6 chicken wings basted with chef sauce, peri-peri, and peri-peri dipping chips", price: "R99.00" },
          { name: "Chicken stir fried", desc: "Stir-fried chicken with mash potato (robot peppers with onion, chicken breast and potato)", price: "R99.00" },
        ],
      },
      {
        name: "Drinks",
        items: [
          { name: "Lemon water", price: "R69.90" },
          { name: "Iced tea", price: "R30.00" },
          { name: "Fresh juice", price: "R26.00" },
          { name: "Smoothie", price: "R35.00" },
        ],
      },
    ],
  },
  {
    slug: "dinner",
    name: "Dinner",
    priceNote: "R210.00 per person",
    sections: [
      { name: "Vegetable", items: [{ name: "Beetroot" }, { name: "Butternut" }, { name: "Spinach" }, { name: "Coleslaw" }] },
      { name: "Salad", items: [{ name: "Salsa" }, { name: "Greek salad" }, { name: "French salad" }, { name: "Chef salad" }] },
      { name: "Entrée", items: [{ name: "Pap" }, { name: "Samp" }, { name: "Rice" }, { name: "Mashed potatoes" }, { name: "Dumpling" }] },
      {
        name: "Meat",
        items: [
          { name: "Grilled chicken" },
          { name: "Grilled beef" },
          { name: "Beef stew" },
          { name: "Tripe (mogudu)" },
          { name: "Hard chicken" },
        ],
      },
      {
        name: "Desserts",
        items: [
          { name: "Custard" },
          { name: "Vanilla crepe cake" },
          { name: "Sweet crepe with white chocolate whipped cream" },
        ],
      },
      { name: "Drinks", items: [{ name: "Lemon water" }, { name: "Orange juice" }, { name: "Lemon juice" }] },
    ],
  },
  {
    slug: "kids",
    name: "Kids",
    priceNote: "R90.00 per child",
    sections: [
      {
        name: "Salads",
        items: [{ name: "Boiled carrots in peanut butter" }, { name: "Creamy cheddar pasta salad" }, { name: "Chicken strips" }],
      },
      { name: "Pastas", items: [{ name: "Mac and cheese" }, { name: "Spaghetti bolognese" }, { name: "Lasagne" }] },
      { name: "Mini Pizza", items: [{ name: "Hawaiian" }, { name: "Sausage / pepperoni" }, { name: "Bacon with sautéed onion" }] },
      { name: "Dessert", items: [{ name: "Vanilla ice cream" }, { name: "Chocolate covered banana" }, { name: "Main chocolate mug cake" }] },
      { name: "Drinks", items: [{ name: "Milkshake" }, { name: "Fruit juice" }, { name: "Apple juice" }, { name: "Milk" }] },
    ],
  },
];
