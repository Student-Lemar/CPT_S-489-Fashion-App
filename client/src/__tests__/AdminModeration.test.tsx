import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import AdminModeration from "../pages/AdminModeration";
import { adminApi } from "../api/admin";
import type { Report } from "../types";

vi.mock("../api/admin");

const mockReports: Report[] = [
  {
    id: "r1",
    type: "post",
    status: "pending",
    contentId: "o1",
    contentLabel: "Post #1082",
    posterUsername: "aden",
    reason: "Spam",
    caption: "Buy now!",
    createdAt: "2026-03-04T10:42:00Z",
  },
  {
    id: "r2",
    type: "board",
    status: "pending",
    contentId: "b1",
    contentLabel: "Board #304",
    posterUsername: "ghost",
    reason: "Inappropriate content",
    caption: "Check this",
    createdAt: "2026-03-03T09:15:00Z",
  },
  {
    id: "r3",
    type: "post",
    status: "resolved",
    contentId: "o2",
    contentLabel: "Post #999",
    posterUsername: "styleking",
    reason: "Copyright",
    caption: "",
    createdAt: "2026-03-02T11:00:00Z",
  },
];

function renderModeration() {
  return render(
    <MemoryRouter>
      <AdminModeration />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.mocked(adminApi.listReports).mockResolvedValue(mockReports);
});

afterEach(() => {
  vi.clearAllMocks();
});

test("shows loading state initially", () => {
  renderModeration();
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test("renders all reports after load", async () => {
  renderModeration();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  expect(screen.getByText("Post #1082")).toBeInTheDocument();
  expect(screen.getByText("Board #304")).toBeInTheDocument();
  expect(screen.getByText("Post #999")).toBeInTheDocument();
});

test("filters reports by type", async () => {
  renderModeration();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  const selects = screen.getAllByRole("combobox");
  const typeFilter = selects.find((s) =>
    Array.from(s.querySelectorAll("option")).some((o) => o.value === "post")
  )!;

  await userEvent.selectOptions(typeFilter, "post");

  expect(screen.getByText("Post #1082")).toBeInTheDocument();
  expect(screen.queryByText("Board #304")).not.toBeInTheDocument();
});

test("filters reports by status", async () => {
  renderModeration();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  const selects = screen.getAllByRole("combobox");
  const statusFilter = selects.find((s) =>
    Array.from(s.querySelectorAll("option")).some((o) => o.value === "resolved")
  )!;

  await userEvent.selectOptions(statusFilter, "resolved");

  expect(screen.getByText("Post #999")).toBeInTheDocument();
  expect(screen.queryByText("Post #1082")).not.toBeInTheDocument();
  expect(screen.queryByText("Board #304")).not.toBeInTheDocument();
});

test("calls updateReport with 'removed' when Remove action is taken", async () => {
  const updatedReport: Report = { ...mockReports[0], status: "removed" };
  vi.mocked(adminApi.updateReport).mockResolvedValue(updatedReport);

  renderModeration();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  const removeButtons = screen.getAllByRole("button", { name: /remove/i });
  await userEvent.click(removeButtons[0]);

  expect(adminApi.updateReport).toHaveBeenCalledWith("r1", "removed");
});

test("calls updateReport with 'hidden' when Hide action is taken", async () => {
  const updatedReport: Report = { ...mockReports[0], status: "hidden" };
  vi.mocked(adminApi.updateReport).mockResolvedValue(updatedReport);

  renderModeration();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  const hideButtons = screen.getAllByRole("button", { name: /hide/i });
  await userEvent.click(hideButtons[0]);

  expect(adminApi.updateReport).toHaveBeenCalledWith("r1", "hidden");
});

test("calls warnUser and updateReport when Warn User action is taken", async () => {
  const updatedReport: Report = { ...mockReports[0], status: "resolved" };
  vi.mocked(adminApi.updateReport).mockResolvedValue(updatedReport);
  vi.mocked(adminApi.warnUser).mockResolvedValue({ ok: true } as any);

  renderModeration();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

  const warnButtons = screen.getAllByRole("button", { name: /warn user/i });
  await userEvent.click(warnButtons[0]);

  expect(adminApi.updateReport).toHaveBeenCalledWith("r1", "resolved");
  expect(adminApi.warnUser).toHaveBeenCalledWith("aden");
});

test("calls listReports on mount", async () => {
  renderModeration();
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  expect(adminApi.listReports).toHaveBeenCalledTimes(1);
});
