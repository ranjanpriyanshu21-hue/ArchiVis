import type {
  AiMatchResponse,
  Architect,
  AuthResponse,
  Design,
  DesignQuery,
  Style,
  Testimonial,
  User,
} from "./types";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const TOKEN_KEY = "archivis.token";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable (private mode) — the session simply stays in memory */
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, "Cannot reach the ArchVision API. Is the backend running?");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, payload?.error || `Request failed (${response.status})`);
  }
  return payload as T;
}

function toQueryString(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const api = {
  listDesigns: (query: DesignQuery = {}) =>
    request<{ count: number; designs: Design[] }>(`/designs${toQueryString({ ...query })}`),

  getDesign: (id: number) =>
    request<{ design: Design; architect: Architect | null; similar: Design[] }>(`/designs/${id}`),

  listArchitects: (query: { q?: string; style?: string } = {}) =>
    request<{ count: number; architects: Architect[] }>(`/architects${toQueryString({ ...query })}`),

  getArchitect: (id: number) =>
    request<{ architect: Architect; portfolio: Design[] }>(`/architects/${id}`),

  listStyles: () => request<{ styles: Style[] }>("/styles"),

  listTestimonials: () => request<{ testimonials: Testimonial[] }>("/testimonials"),

  aiMatch: (prompt: string) =>
    request<AiMatchResponse>("/ai/match", { method: "POST", body: JSON.stringify({ prompt }) }),

  createInquiry: (body: { name: string; email: string; subject: string; message: string; architectId?: number }) =>
    request<{ id: number }>("/inquiries", { method: "POST", body: JSON.stringify(body) }),

  subscribeNewsletter: (email: string) =>
    request<{ email: string }>("/newsletter", { method: "POST", body: JSON.stringify({ email }) }),

  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  me: () => request<{ user: User }>("/auth/me"),

  listFavorites: () => request<{ designIds: number[]; designs: Design[] }>("/favorites"),

  addFavorite: (designId: number) =>
    request<{ designIds: number[] }>("/favorites", { method: "POST", body: JSON.stringify({ designId }) }),

  removeFavorite: (designId: number) =>
    request<{ designIds: number[] }>(`/favorites/${designId}`, { method: "DELETE" }),

  syncFavorites: (designIds: number[]) =>
    request<{ designIds: number[] }>("/favorites/sync", { method: "POST", body: JSON.stringify({ designIds }) }),
};
