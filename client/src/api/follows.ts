import { api } from "./client";
import type { FollowStatus } from "../types";

export const followsApi = {
  status: (username: string) =>
    api.get<FollowStatus>(`/follows/${encodeURIComponent(username)}`),

  follow: (username: string) =>
    api.post<FollowStatus>(`/follows/${encodeURIComponent(username)}`, {}),

  unfollow: (username: string) =>
    api.del<FollowStatus>(`/follows/${encodeURIComponent(username)}`),
};
