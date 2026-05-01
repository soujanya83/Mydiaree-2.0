export const RECIPE_MEAL_TYPES = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "snacks", label: "Snacks" },
  { id: "morning_tea", label: "Morning Tea" },
  { id: "afternoon_tea", label: "Afternoon Tea" },
];

export const FOOD_TYPES = [
  { id: "veg", label: "Veg" },
  { id: "non_veg", label: "Non-Veg" },
];

export const INGREDIENT_OPTIONS = [
  "Tomato",
  "Onion",
  "Potato",
  "Rice",
  "Chicken",
  "Paneer",
  "Milk",
  "Curd",
  "Wheat Flour",
  "Salt",
  "Sugar",
  "Oil",
  "Garlic",
  "Ginger",
  "Carrot",
  "Peas",
];

export const initialRecipes = [
  {
    id: "r1",
    name: "Dahi Wada",
    foodType: "veg",
    mealType: "snacks",
    description: "Soft lentil dumplings soaked in spiced yoghurt, topped with chutneys.",
    note: "",
    image:
      "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=900&q=70",
    videoUrl: "",
    ingredients: ["Curd", "Salt", "Oil"],
    author: "Deepti (Superadmin)",
    date: "2022-01-21",
    centreId: "c1",
  },
  {
    id: "r2",
    name: "Chikan Dum Biryani",
    foodType: "non_veg",
    mealType: "lunch",
    description: "Aromatic layered rice cooked slowly with marinated chicken and spices.",
    note: "",
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=70",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ingredients: ["Chicken", "Rice", "Onion", "Ginger", "Garlic"],
    author: "Deepti (Superadmin)",
    date: "2025-09-15",
    centreId: "c1",
  },
  {
    id: "r3",
    name: "Vegetable Pancakes",
    foodType: "veg",
    mealType: "breakfast",
    description: "Fluffy pancakes packed with grated carrot and peas, served warm.",
    note: "",
    image:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=70",
    videoUrl: "",
    ingredients: ["Wheat Flour", "Carrot", "Peas", "Milk"],
    author: "Deepti (Superadmin)",
    date: "2025-03-10",
    centreId: "c1",
  },
];