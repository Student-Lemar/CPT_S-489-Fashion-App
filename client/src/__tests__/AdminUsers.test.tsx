import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import AdminUsers from "../pages/AdminUsers";
import { adminApi } from "../api/admin";
import type { User } from "../types";

vi.mock("../api/admin");

const mockUsers: User[] = [
  { id: "u1", username: "aden", role: "creator", displayName: "Aden", status: "active", reports: 0, createdAt: "2026-03-01T00:00:00Z" },
  { id: "u2", username: "ghost", role: "creator", displayName: "Ghost", status: "suspended", reports: 5, createdAt: "2026-03-01T00:00:00Z" },
  { id: "u3", username: "styleking", role: "creator", displayName: "Style King", status: "active", reports: 2, createdAt: "2026-03-01T00:00:00Z" },
];

function renderUsers() {
  return render(
    <MemoryRouter>
      <AdminUsers />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.mocked(adminApi.listUsers).mockResolvedValue(mockUsers);
});

afterEach(() => {
  vi.clearAllMocks();
});

test("shows loading state initially", () => {
  renderUsers();
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test("renders all users after load", async () => {
  renderUsers();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  // Usernames are displayed with @ prefix
  expect(screen.getByText("@aden")).toBeInTheDocument();
  expect(screen.getByText("@ghost")).toBeInTheDocument();
  expect(screen.getByText("@styleking")).toBeInTheDocument();
});

test("filters users by search query", async () => {
  renderUsers();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  const searchInput = screen.getByRole("searchbox");
  await userEvent.type(searchInput, "aden");

  expect(screen.getByText("@aden")).toBeInTheDocument();
  expect(screen.queryByText("@ghost")).not.toBeInTheDocument();
});

test("filters users by suspended status", async () => {
  renderUsers();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  const selects = screen.getAllByRole("combobox");
  const statusFilter = selects.find((s) =>
    Array.from(s.querySelectorAll("option")).some((o) => o.value === "suspended")
  )!;

  await userEvent.selectOptions(statusFilter, "suspended");

  expect(screen.getByText("@ghost")).toBeInTheDocument();
  expect(screen.queryByText("@aden")).not.toBeInTheDocument();
});

test("toggles user status when toggle button clicked", async () => {
  const updatedUser: User = { ...mockUsers[0], status: "suspended" };
  vi.mocked(adminApi.toggleUserStatus).mockResolvedValue(updatedUser);

  renderUsers();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  // Find a suspend/toggle button for 'aden'
  const toggleButtons = screen.getAllByRole("button");
  const suspendBtn = toggleButtons.find((b) =>
    b.textContent?.toLowerCase().includes("suspend")
  );
  expect(suspendBtn).toBeDefined();

  await userEvent.click(suspendBtn!);
  expect(adminApi.toggleUserStatus).toHaveBeenCalledWith("aden");
});

test("calls listUsers on mount", async () => {
  renderUsers();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  expect(adminApi.listUsers).toHaveBeenCalledTimes(1);
});
