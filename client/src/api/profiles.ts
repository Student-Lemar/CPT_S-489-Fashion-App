import { api } from './client';
import type { Profile } from '../types';

export type UpdateProfilePayload = Partial<Omit<Profile, 'username'>>;

export const profilesApi = {
  get: (username: string) =>
    api.get<Profile>(`/profiles/${encodeURIComponent(username)}`),

  update: (username: string, payload: UpdateProfilePayload) =>
    api.put<Profile>(`/profiles/${encodeURIComponent(username)}`, payload),
};
