export type HeatLevel = 1 | 2 | 3 | 4 | 5;

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  heatLevel: HeatLevel;
  category: "original" | "beef" | "gift-set";
  inStock: boolean;
  flavorNotes: string[];
  ingredients: string[];
  nutrition?: {
    servingSize: string;
    calories: number;
    totalFat: string;
    sodium: string;
  };
}

export const products: Product[] = [
  {
    id: "1",
    name: "Original Recipe Chili Oil",
    slug: "original-recipe-chili-oil",
    description:
      "Our signature blend of slow-infused chilies, garlic, and premium oils. Bold flavor with balanced heat.",
    price: 18.99,
    image: "/images/products/product-1.png",
    images: [
      "/images/products/product-1.png",
      "/images/products/product-1.png",
      "/images/products/product-1.png",
    ],
    heatLevel: 3,
    category: "original",
    inStock: true,
    flavorNotes: ["Garlicky", "Umami", "Crunchy", "Smoky"],
    ingredients: [
      "Premium vegetable oil",
      "Dried red chilies",
      "Garlic",
      "Sichuan peppercorns",
      "Sea salt",
      "Sesame seeds",
    ],
    nutrition: {
      servingSize: "1 tsp (5ml)",
      calories: 45,
      totalFat: "5g",
      sodium: "120mg",
    },
  },
  {
    id: "2",
    name: "Beef Chili Oil",
    slug: "beef-chili-oil",
    description:
      "Rich, umami-packed chili oil made with real beef. Not for the faint of taste. This one bites back.",
    price: 24.99,
    image: "/images/products/product-2.png",
    images: [
      "/images/products/product-2.png",
      "/images/products/product-2.png",
      "/images/products/product-2.png",
    ],
    heatLevel: 4,
    category: "beef",
    inStock: true,
    flavorNotes: ["Umami", "Beefy", "Rich", "Bold"],
    ingredients: [
      "Premium vegetable oil",
      "Real beef",
      "Dried red chilies",
      "Garlic",
      "Sichuan peppercorns",
      "Sea salt",
      "Sesame seeds",
    ],
    nutrition: {
      servingSize: "1 tsp (5ml)",
      calories: 50,
      totalFat: "5.5g",
      sodium: "140mg",
    },
  },
  {
    id: "3",
    name: "Extra Hot Chili Oil",
    slug: "extra-hot-chili-oil",
    description:
      "For heat seekers. Intense spice with complex flavor. Use sparingly.",
    price: 19.99,
    image: "/images/products/product-3.png",
    images: [
      "/images/products/product-3.png",
      "/images/products/product-3.png",
      "/images/products/product-3.png",
    ],
    heatLevel: 5,
    category: "original",
    inStock: true,
    flavorNotes: ["Fiery", "Intense", "Complex", "Bold"],
    ingredients: [
      "Premium vegetable oil",
      "Ghost peppers",
      "Dried red chilies",
      "Garlic",
      "Sichuan peppercorns",
      "Sea salt",
    ],
  },
  {
    id: "4",
    name: "Mild Chili Oil",
    slug: "mild-chili-oil",
    description:
      "Gentle heat, maximum flavor. Perfect for those who want flavor without the fire.",
    price: 18.99,
    image: "/images/products/product-4.png",
    images: [
      "/images/products/product-4.png",
      "/images/products/product-4.png",
      "/images/products/product-4.png",
    ],
    heatLevel: 1,
    category: "original",
    inStock: true,
    flavorNotes: ["Mild", "Aromatic", "Versatile", "Smooth"],
    ingredients: [
      "Premium vegetable oil",
      "Mild red chilies",
      "Garlic",
      "Sichuan peppercorns",
      "Sea salt",
      "Sesame seeds",
    ],
  },
  {
    id: "5",
    name: "Gift Set - Heat Lovers",
    slug: "gift-set-heat-lovers",
    description:
      "The perfect gift for spice enthusiasts. Includes Original, Beef, and Extra Hot varieties.",
    price: 59.99,
    originalPrice: 64.97,
    image: "/images/products/product-5.png",
    images: [
      "/images/products/product-5.png",
      "/images/products/product-5.png",
      "/images/products/product-5.png",
    ],
    heatLevel: 4,
    category: "gift-set",
    inStock: true,
    flavorNotes: ["Variety", "Premium", "Gift-Ready"],
    ingredients: ["Original Recipe Chili Oil", "Beef Chili Oil", "Extra Hot Chili Oil"],
  },
  {
    id: "6",
    name: "Gift Set - Starter Pack",
    slug: "gift-set-starter-pack",
    description:
      "A curated introduction to ChiliRig. Includes Original and Mild varieties with recipe cards.",
    price: 34.99,
    originalPrice: 37.98,
    image: "/images/products/product-6.png",
    images: [
      "/images/products/product-6.png",
      "/images/products/product-6.png",
      "/images/products/product-6.png",
    ],
    heatLevel: 2,
    category: "gift-set",
    inStock: true,
    flavorNotes: ["Beginner-Friendly", "Versatile", "Complete"],
    ingredients: ["Original Recipe Chili Oil", "Mild Chili Oil", "Recipe Cards"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}

export function getBestSellers(): Product[] {
  return [products[0], products[1], products[2], products[3]];
}

export function getNewProducts(): Product[] {
  return [products[2], products[3], products[4]];
}

export function getBundles(): Product[] {
  return products.filter((p) => p.category === "gift-set");
}
