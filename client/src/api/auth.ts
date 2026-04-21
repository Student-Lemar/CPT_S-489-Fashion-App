import { api } from "./client";
import type { Session } from "../types";

export interface LoginPayload {
  username: string;
  password: string;
}
export interface RegisterPayload {
  username: string;
  password: string;
  displayName: string;
}

export const authApi = {
  login: (payload: LoginPayload) => api.post<Session>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    api.post<Session>("/auth/register", payload),

  logout: () => api.post<void>("/auth/logout", {}),

  me: () => api.get<Session>("/auth/me"),
};
