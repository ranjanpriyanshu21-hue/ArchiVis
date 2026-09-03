import { findDesigns } from "../models/designModel.js";

// Rule-based matcher — the same keyword logic the frontend used, now resolved against the database.
const STYLE_RULES = [
  { keywords: ["minimalist", "minimal"], style: "Minimalist" },
  { keywords: ["biophilic", "green", "nature"], style: "Biophilic" },
  { keywords: ["industrial", "loft"], style: "Industrial" },
  { keywords: ["contemporary", "modern"], style: "Contemporary" },
  { keywords: ["brutalist", "concrete"], style: "Brutalist" },
  { keywords: ["art deco", "deco"], style: "Art Deco" },
  { keywords: ["futuristic", "parametric", "smart"], style: "Futuristic" },
  { keywords: ["colonial", "heritage"], style: "Colonial" },
];

const LOCATION_RULES = [
  { keywords: ["goa", "coastal"], location: "Goa" },
  { keywords: ["mumbai"], location: "Mumbai" },
  { keywords: ["bangalore", "bengaluru"], location: "Bangalore" },
  { keywords: ["delhi"], location: "Delhi" },
  { keywords: ["pune"], location: "Pune" },
  { keywords: ["hyderabad"], location: "Hyderabad" },
  { keywords: ["chennai"], location: "Chennai" },
  { keywords: ["kolkata"], location: "Kolkata" },
];

// "₹70 lakh", "70 lakhs", "1.2 crore", "1 cr"
function parseBudget(prompt) {
  const lakh = prompt.match(/([\d.]+)\s*(?:lakh|lac|l\b)/);
  if (lakh) return Math.round(Number(lakh[1]) * 100000);
  const crore = prompt.match(/([\d.]+)\s*(?:crore|cr\b)/);
  if (crore) return Math.round(Number(crore[1]) * 10000000);
  return null;
}

function parseBedrooms(prompt) {
  const match = prompt.match(/(\d+)\s*(?:bhk|bedroom)/);
  return match ? Number(match[1]) : null;
}

export async function matchDesigns(prompt, limit = 3) {
  const text = prompt.toLowerCase();

  const style = STYLE_RULES.find((rule) => rule.keywords.some((k) => text.includes(k)))?.style ?? "";
  const location = LOCATION_RULES.find((rule) => rule.keywords.some((k) => text.includes(k)))?.location ?? "";
  const maxBudget = parseBudget(text);
  const bedrooms = parseBedrooms(text);

  let results = await findDesigns({ style, maxBudget, sort: "rating" });

  if (location) {
    const inLocation = results.filter((d) => d.location.toLowerCase().includes(location.toLowerCase()));
    if (inLocation.length > 0) results = inLocation;
  }
  if (bedrooms) {
    const withBedrooms = results.filter((d) => d.bedrooms >= bedrooms);
    if (withBedrooms.length > 0) results = withBedrooms;
  }

  // Never leave the user empty-handed — fall back to the top rated designs.
  if (results.length === 0) results = await findDesigns({ sort: "rating", limit });

  results = results.slice(0, limit);

  return {
    reply: `Based on your requirements, here are my top ${results.length} recommendation${
      results.length !== 1 ? "s" : ""
    }:`,
    matched: { style: style || null, location: location || null, maxBudget, bedrooms },
    results,
  };
}
