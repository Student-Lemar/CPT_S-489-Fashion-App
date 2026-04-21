import { api } from './client';
import type { Item } from '../types';

export type CreateItemPayload = Omit<Item, 'id' | 'ownerUsername'>;
export type UpdateItemPayload = Partial<Omit<Item, 'id' | 'ownerUsername'>>;

export const itemsApi = {
  list: () => api.get<Item[]>('/items'),

  get: (id: string) => api.get<Item>(`/items/${encodeURIComponent(id)}`),

  create: (payload: CreateItemPayload) => api.post<Item>('/items', payload),

  update: (id: string, payload: UpdateItemPayload) =>
    api.put<Item>(`/items/${encodeURIComponent(id)}`, payload),

  remove: (id: string) => api.del<void>(`/items/${encodeURIComponent(id)}`),
};
