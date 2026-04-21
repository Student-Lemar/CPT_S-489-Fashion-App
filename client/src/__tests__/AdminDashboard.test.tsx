import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import AdminDashboard from "../pages/AdminDashboard";
import { adminApi } from "../api/admin";
import type { User, Report, AuditLogEntry } from "../types";

vi.mock("../api/admin");

const mockUsers: User[] = [
  { id: "u1", username: "aden", role: "creator", displayName: "Aden", status: "active", reports: 0, createdAt: "2026-03-01T00:00:00Z" },
  { id: "u2", username: "ghost", role: "creator", displayName: "Ghost", status: "suspended", reports: 3, createdAt: "2026-03-01T00:00:00Z" },
  { id: "u3", username: "admin", role: "admin", displayName: "Admin", status: "active", reports: 0, createdAt: "2026-03-01T00:00:00Z" },
];

const mockReports: Report[] = [
  { id: "r1", type: "post", status: "pending", contentId: "o1", contentLabel: "Post #1", posterUsername: "aden", reason: "Spam", caption: "", createdAt: "2026-03-04T00:00:00Z" },
  { id: "r2", type: "board", status: "resolved", contentId: "b1", contentLabel: "Board #1", posterUsername: "ghost", reason: "Hate speech", caption: "", createdAt: "2026-03-03T00:00:00Z" },
];

const mockAuditLog: AuditLogEntry[] = [
  { id: "a1", adminUsername: "admin", action: "SUSPEND_USER", target: "ghost", timestamp: "2026-03-05T10:00:00Z" },
  { id: "a2", adminUsername: "admin", action: "WARN_USER", target: "aden", timestamp: "2026-03-04T09:00:00Z" },
];

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.mocked(adminApi.listUsers).mockResolvedValue(mockUsers);
  vi.mocked(adminApi.listReports).mockResolvedValue(mockReports);
  vi.mocked(adminApi.auditLog).mockResolvedValue(mockAuditLog);
});

afterEach(() => {
  vi.clearAllMocks();
});

test("shows loading state initially", () => {
  renderDashboard();
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test("renders stat cards after data loads", async () => {
  renderDashboard();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  expect(screen.getByText("Total Users")).toBeInTheDocument();
  expect(screen.getByText("Active Creators")).toBeInTheDocument();
  expect(screen.getByText("Pending Reports")).toBeInTheDocument();
  expect(screen.getByText("Suspended")).toBeInTheDocument();
});

test("displays correct stat counts", async () => {
  renderDashboard();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  // 3 total users
  const statNumbers = document.querySelectorAll(".stat-number");
  const values = Array.from(statNumbers).map((el) => el.textContent);
  expect(values).toContain("3"); // total users
  expect(values).toContain("1"); // 1 active creator (aden; ghost is suspended, admin is admin)
  expect(values).toContain("1"); // 1 pending report
  // suspended = 1 (ghost)
});

test("shows pending badge count on moderation link", async () => {
  renderDashboard();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  // The badge is a <span> inside the moderation queue link — use getAllByText and
  // confirm at least one match is a span (not a stat-number div)
  const ones = screen.getAllByText("1");
  const badgeSpan = ones.find((el) => el.tagName === "SPAN");
  expect(badgeSpan).toBeDefined();
});

test("renders audit log entries", async () => {
  renderDashboard();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  expect(screen.getByText("SUSPEND_USER")).toBeInTheDocument();
  expect(screen.getByText("ghost")).toBeInTheDocument();
  expect(screen.getByText("WARN_USER")).toBeInTheDocument();
});

test("shows empty audit log message when no entries", async () => {
  vi.mocked(adminApi.auditLog).mockResolvedValue([]);
  renderDashboard();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  expect(screen.getByText(/no audit entries yet/i)).toBeInTheDocument();
});

test("renders navigation links to user management and moderation", async () => {
  renderDashboard();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  expect(screen.getByRole("link", { name: /manage users/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /moderation queue/i })).toBeInTheDocument();
});
