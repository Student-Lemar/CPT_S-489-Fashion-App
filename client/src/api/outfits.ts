import { api } from "./client";
import type { Outfit } from "../types";

export type CreateOutfitPayload = Omit<
  Outfit,
  "id" | "ownerUsername" | "createdAt" | "updatedAt"
>;
export type UpdateOutfitPayload = Partial<Omit<Outfit, "id" | "ownerUsername">>;

export const outfitsApi = {
  list: () => api.get<Outfit[]>("/outfits"),

  get: (id: string) => api.get<Outfit>(`/outfits/${encodeURIComponent(id)}`),

  create: (payload: CreateOutfitPayload) =>
    api.post<Outfit>("/outfits", payload),

  update: (id: string, payload: UpdateOutfitPayload) =>
    api.put<Outfit>(`/outfits/${encodeURIComponent(id)}`, payload),

  remove: (id: string) => api.del<void>(`/outfits/${encodeURIComponent(id)}`),
};
