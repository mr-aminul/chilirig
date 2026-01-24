export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  heatLevel: 1 | 2 | 3 | 4 | 5;
  ingredients: {
    name: string;
    amount: string;
  }[];
  steps: {
    step: number;
    instruction: string;
  }[];
  tips?: string[];
}

export const recipes: Recipe[] = [
  {
    id: "1",
    title: "Garlic Chili Noodles",
    slug: "garlic-chili-noodles",
    description:
      "Quick, bold, and addictive. These noodles come together in minutes but pack a serious flavor punch.",
    image: "/images/recipes/recipe-garlic-chili-noodles.png",
    prepTime: "5 min",
    cookTime: "10 min",
    servings: 2,
    heatLevel: 3,
    ingredients: [
      { name: "Ramen or udon noodles", amount: "200g" },
      { name: "ChiliRig Original Recipe", amount: "2-3 tbsp" },
      { name: "Garlic, minced", amount: "4 cloves" },
      { name: "Soy sauce", amount: "2 tbsp" },
      { name: "Sesame oil", amount: "1 tsp" },
      { name: "Green onions, sliced", amount: "2 stalks" },
      { name: "Sesame seeds", amount: "1 tbsp" },
    ],
    steps: [
      {
        step: 1,
        instruction:
          "Cook noodles according to package directions. Reserve 1/4 cup pasta water, then drain.",
      },
      {
        step: 2,
        instruction:
          "Heat a large pan over medium heat. Add ChiliRig and garlic, cook for 30 seconds until fragrant.",
      },
      {
        step: 3,
        instruction:
          "Add cooked noodles, soy sauce, and sesame oil. Toss to combine, adding pasta water if needed.",
      },
      {
        step: 4,
        instruction:
          "Garnish with green onions and sesame seeds. Serve immediately.",
      },
    ],
    tips: [
      "Don't skip the pasta water—it helps create a silky sauce.",
      "Adjust heat by using more or less ChiliRig.",
      "Add a fried egg on top for extra protein.",
    ],
  },
  {
    id: "2",
    title: "Crispy Egg Rice Bowl",
    slug: "crispy-egg-rice-bowl",
    description:
      "A simple, satisfying bowl that's perfect for breakfast, lunch, or dinner. The crispy egg is everything.",
    image: "/images/recipes/recipe-crispy-egg-rice-bowl.png",
    prepTime: "5 min",
    cookTime: "10 min",
    servings: 1,
    heatLevel: 2,
    ingredients: [
      { name: "Cooked jasmine rice", amount: "1 cup" },
      { name: "ChiliRig Original Recipe", amount: "1-2 tbsp" },
      { name: "Eggs", amount: "2" },
      { name: "Soy sauce", amount: "1 tbsp" },
      { name: "Green onions, sliced", amount: "1 stalk" },
      { name: "Sesame seeds", amount: "1 tsp" },
    ],
    steps: [
      {
        step: 1,
        instruction:
          "Heat a non-stick pan over medium-high heat. Add a generous amount of oil.",
      },
      {
        step: 2,
        instruction:
          "Crack eggs into the pan. Cook until edges are crispy and whites are set, about 3-4 minutes.",
      },
      {
        step: 3,
        instruction:
          "Place hot rice in a bowl. Drizzle with ChiliRig and soy sauce.",
      },
      {
        step: 4,
        instruction:
          "Top with crispy eggs, green onions, and sesame seeds. Mix everything together before eating.",
      },
    ],
    tips: [
      "Use day-old rice for better texture.",
      "Don't flip the eggs—let them get crispy on one side.",
      "Add a runny yolk for extra richness.",
    ],
  },
  {
    id: "3",
    title: "Spicy Beef Toast",
    slug: "spicy-beef-toast",
    description:
      "Elevate your toast game with our Beef Chili Oil. Rich, umami, and absolutely addictive.",
    image: "/images/recipes/recipe-spicy-beef-toast.png",
    prepTime: "5 min",
    cookTime: "5 min",
    servings: 2,
    heatLevel: 4,
    ingredients: [
      { name: "Sourdough bread, thick slices", amount: "2" },
      { name: "ChiliRig Beef Chili Oil", amount: "2-3 tbsp" },
      { name: "Butter", amount: "2 tbsp" },
      { name: "Fresh cilantro", amount: "A handful" },
      { name: "Lime wedge", amount: "1" },
    ],
    steps: [
      {
        step: 1,
        instruction:
          "Toast bread until golden and crispy on both sides.",
      },
      {
        step: 2,
        instruction:
          "Butter the toast while still warm.",
      },
      {
        step: 3,
        instruction:
          "Generously spread ChiliRig Beef Chili Oil over the buttered toast.",
      },
      {
        step: 4,
        instruction:
          "Garnish with fresh cilantro and a squeeze of lime. Serve immediately.",
      },
    ],
    tips: [
      "Use thick-cut bread for the best texture.",
      "The butter helps balance the heat.",
      "Add a fried egg for a complete meal.",
    ],
  },
  {
    id: "4",
    title: "Chili Oil Dumplings",
    slug: "chili-oil-dumplings",
    description:
      "Classic dumplings elevated with our signature chili oil. A crowd-pleaser every time.",
    image: "/images/recipes/recipe-chili-oil-dumplings.png",
    prepTime: "10 min",
    cookTime: "15 min",
    servings: 4,
    heatLevel: 3,
    ingredients: [
      { name: "Frozen dumplings", amount: "24 pieces" },
      { name: "ChiliRig Original Recipe", amount: "3-4 tbsp" },
      { name: "Soy sauce", amount: "2 tbsp" },
      { name: "Rice vinegar", amount: "1 tbsp" },
      { name: "Green onions, sliced", amount: "2 stalks" },
      { name: "Sesame seeds", amount: "1 tbsp" },
    ],
    steps: [
      {
        step: 1,
        instruction:
          "Cook dumplings according to package directions (steam or pan-fry).",
      },
      {
        step: 2,
        instruction:
          "While dumplings cook, mix ChiliRig, soy sauce, and rice vinegar in a small bowl.",
      },
      {
        step: 3,
        instruction:
          "Arrange cooked dumplings on a plate. Drizzle with the chili oil mixture.",
      },
      {
        step: 4,
        instruction:
          "Garnish with green onions and sesame seeds. Serve hot.",
      },
    ],
  },
  {
    id: "5",
    title: "Chili Oil Pasta",
    slug: "chili-oil-pasta",
    description:
      "Italian meets Asian in this fusion favorite. Simple ingredients, maximum flavor.",
    image: "/images/recipes/recipe-chili-oil-pasta.png",
    prepTime: "5 min",
    cookTime: "12 min",
    servings: 2,
    heatLevel: 2,
    ingredients: [
      { name: "Spaghetti", amount: "200g" },
      { name: "ChiliRig Original Recipe", amount: "2-3 tbsp" },
      { name: "Garlic, sliced", amount: "4 cloves" },
      { name: "Olive oil", amount: "2 tbsp" },
      { name: "Parmesan cheese, grated", amount: "1/4 cup" },
      { name: "Fresh parsley, chopped", amount: "2 tbsp" },
    ],
    steps: [
      {
        step: 1,
        instruction:
          "Cook pasta according to package directions. Reserve 1 cup pasta water, then drain.",
      },
      {
        step: 2,
        instruction:
          "Heat olive oil in a large pan. Add garlic and cook until golden, about 2 minutes.",
      },
      {
        step: 3,
        instruction:
          "Add ChiliRig and stir. Add cooked pasta and toss, adding pasta water as needed.",
      },
      {
        step: 4,
        instruction:
          "Remove from heat. Stir in parmesan and parsley. Serve immediately.",
      },
    ],
  },
];

export function getRecipeBySlug(slug: string): Recipe | undefined {
  return recipes.find((r) => r.slug === slug);
}
