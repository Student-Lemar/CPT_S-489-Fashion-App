import { api } from './client';
import type { Board } from '../types';

export type CreateBoardPayload = Omit<Board, 'id' | 'ownerUsername' | 'createdAt' | 'updatedAt'>;
export type UpdateBoardPayload = Partial<Omit<Board, 'id' | 'ownerUsername'>>;

export const boardsApi = {
  list: () => api.get<Board[]>('/boards'),

  get: (id: string) => api.get<Board>(`/boards/${encodeURIComponent(id)}`),

  create: (payload: CreateBoardPayload) => api.post<Board>('/boards', payload),

  update: (id: string, payload: UpdateBoardPayload) =>
    api.put<Board>(`/boards/${encodeURIComponent(id)}`, payload),

  remove: (id: string) => api.del<void>(`/boards/${encodeURIComponent(id)}`),
};
