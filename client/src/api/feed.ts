import { api } from "./client";
import type { FeedPost } from "../types";

export const feedApi = {
  list: (search?: string) => {
    const qs = search ? `?q=${encodeURIComponent(search)}` : "";
    return api.get<FeedPost[]>(`/feed${qs}`);
  },
};
