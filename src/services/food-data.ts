/**
 * Street food data service
 * Provides mock data for global street food recommendations
 */

interface StreetFoodData {
  name: string;
  origin: string;
  description: string;
  price: string;
  popularIn: string[];
  bestTime: string;
  spiceLevel: "mild" | "medium" | "hot" | "very hot";
  imageUrl?: string;
}

const streetFoodDatabase: StreetFoodData[] = [
  {
    name: "Pad Thai",
    origin: "Thailand",
    description: "Stir-fried rice noodles with eggs, fish sauce, tamarind, chili, and your choice of chicken, shrimp, or tofu. Topped with peanuts and lime.",
    price: "$3-5",
    popularIn: ["Bangkok", "Chiang Mai", "Phuket"],
    bestTime: "Lunch & Dinner",
    spiceLevel: "medium",
  },
  {
    name: "Tacos al Pastor",
    origin: "Mexico",
    description: "Marinated pork cooked on a vertical spit, served on small corn tortillas with pineapple, cilantro, onions, and salsa.",
    price: "$1-2 per taco",
    popularIn: ["Mexico City", "Guadalajara", "Tijuana"],
    bestTime: "Late night",
    spiceLevel: "hot",
  },
  {
    name: "Banh Mi",
    origin: "Vietnam",
    description: "French baguette filled with pâté, pickled vegetables, cilantro, jalapeños, and choice of grilled pork, chicken, or tofu.",
    price: "$2-4",
    popularIn: ["Ho Chi Minh City", "Hanoi", "Da Nang"],
    bestTime: "Breakfast & Lunch",
    spiceLevel: "medium",
  },
  {
    name: "Vada Pav",
    origin: "India",
    description: "Mumbai's iconic burger - spiced potato fritter sandwiched in a soft bun with chutneys and fried green chilies.",
    price: "$0.50-1",
    popularIn: ["Mumbai", "Pune", "Ahmedabad"],
    bestTime: "Anytime",
    spiceLevel: "hot",
  },
  {
    name: "Currywurst",
    origin: "Germany",
    description: "Steamed then fried pork sausage cut into slices, seasoned with curry ketchup and sprinkled with curry powder.",
    price: "$4-6",
    popularIn: ["Berlin", "Hamburg", "Cologne"],
    bestTime: "Lunch & Late night",
    spiceLevel: "mild",
  },
  {
    name: "Takoyaki",
    origin: "Japan",
    description: "Ball-shaped dough filled with octopus pieces, tempura scraps, pickled ginger, and green onion. Topped with takoyaki sauce and bonito flakes.",
    price: "$4-6",
    popularIn: ["Osaka", "Tokyo", "Kyoto"],
    bestTime: "Dinner & Snack",
    spiceLevel: "mild",
  },
  {
    name: "Arepas",
    origin: "Venezuela/Colombia",
    description: "Grilled cornmeal pockets stuffed with cheese, shredded beef, chicken, or black beans with avocado.",
    price: "$3-5",
    popularIn: ["Caracas", "Bogotá", "Medellín"],
    bestTime: "Breakfast & Dinner",
    spiceLevel: "mild",
  },
  {
    name: "Jianbing",
    origin: "China",
    description: "Chinese crepe filled with egg, crispy crackers, scallions, cilantro, and your choice of savory or spicy sauce.",
    price: "$2-3",
    popularIn: ["Beijing", "Tianjin", "Shanghai"],
    bestTime: "Breakfast",
    spiceLevel: "medium",
  },
  {
    name: "Churros",
    origin: "Spain",
    description: "Deep-fried dough pastry coated in cinnamon sugar, often served with thick hot chocolate for dipping.",
    price: "$2-4",
    popularIn: ["Madrid", "Barcelona", "Valencia"],
    bestTime: "Breakfast & Dessert",
    spiceLevel: "mild",
  },
];

export interface GetStreetFoodParams {
  region?: string;
  spiceLevel?: "mild" | "medium" | "hot" | "very hot";
  priceRange?: "budget" | "moderate";
  limit?: number;
}

export async function getStreetFoodRecommendations(
  params?: GetStreetFoodParams
): Promise<StreetFoodData[]> {
  let filtered = [...streetFoodDatabase];

  if (params?.spiceLevel) {
    filtered = filtered.filter((food) => food.spiceLevel === params.spiceLevel);
  }

  if (params?.limit) {
    filtered = filtered.slice(0, params.limit);
  }

  return filtered;
}
