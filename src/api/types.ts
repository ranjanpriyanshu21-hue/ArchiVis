export interface Design {
  id: number;
  title: string;
  slug: string;
  style: string;
  budget: string;
  budgetNum: number;
  location: string;
  rating: number;
  reviews: number;
  architectId: number;
  featured: boolean;
  image: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  timeline: string;
  gallery: string[];
  tags: string[];
  materials: string[];
}

export interface Architect {
  id: number;
  name: string;
  title: string;
  firm: string;
  location: string;
  experience: number;
  rating: number;
  reviews: number;
  projects: number;
  image: string;
  bio: string;
  startingBudget: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  specialties: string[];
  awards: string[];
  portfolioIds: number[];
}

export interface Style {
  id: number;
  name: string;
  slug: string;
  isFilter: boolean;
  designCount: number;
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  project: string;
  text: string;
  image: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AiMatchResponse {
  reply: string;
  matched: { style: string | null; location: string | null; maxBudget: number | null; bedrooms: number | null };
  results: Design[];
}

export interface DesignQuery {
  q?: string;
  style?: string;
  maxBudget?: number;
  sort?: string;
  featured?: boolean;
  architectId?: number;
  limit?: number;
}
