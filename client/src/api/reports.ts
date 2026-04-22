import { api } from "./client";
import type { Report } from "../types";

export const reportsApi = {
  submit: (payload: {
    type: "post" | "board";
    contentId: string;
    contentLabel: string;
    reason: string;
  }) => api.post<Report>("/reports", payload),
};
