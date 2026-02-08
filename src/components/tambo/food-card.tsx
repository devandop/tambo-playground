"use client";

import { z } from "zod";

const GRADIENTS = [
  "from-orange-500 to-red-500",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-yellow-500 to-amber-600",
  "from-lime-500 to-green-600",
  "from-red-500 to-rose-600",
  "from-teal-500 to-cyan-600",
];

function getGradient(name: string) {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}

export const foodCardSchema = z.object({
  foods: z.array(
    z.object({
      name: z.string().describe("Name of the street food"),
      origin: z.string().describe("Country or region of origin"),
      description: z.string().describe("Brief description of the dish"),
      price: z.string().describe("Typical price range"),
      popularIn: z
        .array(z.string())
        .describe("Cities/regions where it's popular"),
      bestTime: z
        .string()
        .describe("Best time to eat (e.g., breakfast, late night)"),
      spiceLevel: z
        .enum(["mild", "medium", "hot", "very hot"])
        .describe("Spice level"),
      imageUrl: z
        .string()
        .optional()
        .describe("URL to a photo of this dish"),
    })
  ),
});

export type FoodCardProps = z.infer<typeof foodCardSchema>;

function FoodThumbnail({
  imageUrl,
  name,
}: {
  imageUrl?: string;
  name: string;
}) {
  if (imageUrl) {
    return (
      <>
        <img
          src={imageUrl}
          alt={name}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        <div
          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getGradient(name)} items-center justify-center flex-shrink-0 hidden`}
        >
          <span className="text-white font-bold text-xl">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      </>
    );
  }

  return (
    <div
      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getGradient(name)} flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-white font-bold text-xl">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export function FoodCard({ foods }: FoodCardProps) {
  const getSpiceColor = (level: "mild" | "medium" | "hot" | "very hot") => {
    switch (level) {
      case "mild":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "hot":
        return "bg-orange-100 text-orange-700";
      case "very hot":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getSpiceLabel = (level: "mild" | "medium" | "hot" | "very hot") => {
    switch (level) {
      case "mild":
        return "Mild";
      case "medium":
        return "Medium";
      case "hot":
        return "Hot";
      case "very hot":
        return "Very Hot";
      default:
        return level;
    }
  };

  // Handle streaming - props may be undefined while loading
  if (!foods || !Array.isArray(foods) || foods.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {foods.map((food, index) => {
        // Skip incomplete items during streaming
        if (!food?.name) return null;

        return (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-3 mb-3">
              <FoodThumbnail imageUrl={food.imageUrl} name={food.name} />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{food.name}</h3>
                <p className="text-sm text-gray-600 font-medium">
                  {food.origin ?? ""}
                </p>
              </div>
            </div>

            {food.description && (
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                {food.description}
              </p>
            )}

            <div className="space-y-2 mb-4">
              {food.price && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-20">Price:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {food.price}
                  </span>
                </div>
              )}
              {food.bestTime && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-20">Best Time:</span>
                  <span className="text-sm text-gray-700">{food.bestTime}</span>
                </div>
              )}
              {food.spiceLevel && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-20">Spice:</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getSpiceColor(
                      food.spiceLevel
                    )}`}
                  >
                    {getSpiceLabel(food.spiceLevel)}
                  </span>
                </div>
              )}
            </div>

            {food.popularIn && food.popularIn.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-1">Popular in:</p>
                <div className="flex flex-wrap gap-1">
                  {food.popularIn.map((place, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                    >
                      {place}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
