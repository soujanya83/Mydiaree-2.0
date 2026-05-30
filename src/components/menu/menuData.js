export const MEAL_TIMES = [
  { id: "breakfast", label: "Breakfast" },
  { id: "morning_tea", label: "Morning Tea" },
  { id: "lunch", label: "Lunch" },
  { id: "afternoon_tea", label: "Afternoon Tea" },
  { id: "late_snacks", label: "Late Snacks" },
];

/** Menu row id → recipe API `type` key (e.g. late_snacks → SNACKS) */
export const MENU_MEAL_TO_RECIPE_TYPE = {
  breakfast: "BREAKFAST",
  morning_tea: "MORNING_TEA",
  lunch: "LUNCH",
  afternoon_tea: "AFTERNOON_TEA",
  late_snacks: "SNACKS",
};

export function normalizeMealTypeKey(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

/** Filter flat recipe list for a menu meal row (Add Menu Items modal). */
export function getRecipesForMenuMeal(allRecipes, mealId) {
  if (!mealId || !Array.isArray(allRecipes)) return [];
  const targetKey = normalizeMealTypeKey(
    MENU_MEAL_TO_RECIPE_TYPE[mealId] || mealId,
  );
  return allRecipes.filter((r) => {
    const recipeKey = normalizeMealTypeKey(r.type || r.mealType);
    return recipeKey === targetKey;
  });
}

export const WEEKDAYS = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
];

export const MENU_ITEM_LIBRARY = {
  breakfast: [
    { id: "b1", name: "French fries", note: "oil fries, Tomato" },
    { id: "b2", name: "Toast & Jam", note: "wholemeal bread" },
    { id: "b3", name: "Cereal with milk", note: "with fresh fruit" },
    { id: "b4", name: "Pancakes", note: "with maple syrup" },
  ],
  morning_tea: [
    { id: "mt1", name: "Fresh fruit platter" },
    { id: "mt2", name: "Yoghurt cups" },
    { id: "mt3", name: "Cheese & crackers" },
  ],
  lunch: [
    { id: "l1", name: "chikan dum biryani" },
    { id: "l2", name: "Dalbati" },
    { id: "l3", name: "milk" },
    { id: "l4", name: "Pasta with veggies" },
    { id: "l5", name: "Vegetable curry & rice" },
  ],
  afternoon_tea: [
    { id: "at1", name: "Sandwich triangles" },
    { id: "at2", name: "Muffins" },
    { id: "at3", name: "Smoothie" },
  ],
  late_snacks: [
    { id: "ls1", name: "Rice crackers" },
    { id: "ls2", name: "Banana slices" },
    { id: "ls3", name: "Warm milk" },
  ],
};

export const initialMenu = {
  breakfast: { mon: ["b1"] },
};

export const dailyRequirements = [
  "1 serve meat (30g cooked meat, 40g cooked chicken, 50g fish, 85g legumes)",
  "1 serve fruit (75g fresh fruit or equivalent - 3 types)",
  "1 serve vegetables (½ cup cooked, 1 cup salad)",
  "2 serves dairy (100ml milk, 100ml custard, 25g yoghurt, 15g hard cheese)",
  "2 serves grains (1 slice bread, ¼ cooked rice or pasta, 35g crispbread)",
];

export const fortnightlyRequirements = [
  "4 times red meat meal",
  "2 times white meat meal",
  "2 times fish meal",
  "2 times vegetarian meal",
];