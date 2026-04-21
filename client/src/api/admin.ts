import { api } from "./client";
import type { User, Report, AuditLogEntry, ReportStatus } from "../types";

export const adminApi = {
  listUsers: (params?: { q?: string; role?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.role) qs.set("role", params.role);
    if (params?.status) qs.set("status", params.status);
    const query = qs.toString();
    return api.get<User[]>(`/admin/users${query ? `?${query}` : ""}`);
  },

  toggleUserStatus: (username: string) =>
    api.post<User>(
      `/admin/users/${encodeURIComponent(username)}/toggle-status`,
      {},
    ),

  listReports: (params?: { type?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set("type", params.type);
    if (params?.status) qs.set("status", params.status);
    const query = qs.toString();
    return api.get<Report[]>(`/admin/reports${query ? `?${query}` : ""}`);
  },

  updateReport: (id: string, status: ReportStatus) =>
    api.put<Report>(`/admin/reports/${encodeURIComponent(id)}`, { status }),

  warnUser: (username: string) =>
    api.post<User>(`/admin/users/${encodeURIComponent(username)}/warn`, {}),

  auditLog: () => api.get<AuditLogEntry[]>("/admin/audit-log"),
};
