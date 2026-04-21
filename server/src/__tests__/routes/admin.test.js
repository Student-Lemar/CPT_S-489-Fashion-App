const express = require("express");
const cookieParser = require("cookie-parser");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const SECRET = "dev-secret-change-in-production";

// Mock DB models before requiring the route
jest.mock("../../models", () => ({
  User: {
    findAll: jest.fn(),
    findOne: jest.fn(),
  },
  Report: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  AuditLogEntry: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
}));

const { User, Report, AuditLogEntry } = require("../../models");
const adminRouter = require("../../routes/admin");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/admin", adminRouter);
  return app;
}

function adminToken() {
  return jwt.sign(
    { id: "u_admin", username: "admin", role: "admin", displayName: "Admin", status: "active" },
    SECRET,
    { expiresIn: "1h" }
  );
}

function creatorToken() {
  return jwt.sign(
    { id: "u1", username: "aden", role: "creator", displayName: "Aden", status: "active" },
    SECRET,
    { expiresIn: "1h" }
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Auth guard tests ───────────────────────────────────────────────────────────

describe("Admin route auth guards", () => {
  test("GET /users returns 401 with no token", async () => {
    const res = await request(buildApp()).get("/api/admin/users");
    expect(res.status).toBe(401);
  });

  test("GET /users returns 403 for creator role", async () => {
    const res = await request(buildApp())
      .get("/api/admin/users")
      .set("Cookie", `fashion_token=${creatorToken()}`);
    expect(res.status).toBe(403);
  });
});

// ── GET /api/admin/users ───────────────────────────────────────────────────────

describe("GET /api/admin/users", () => {
  test("returns user list for admin", async () => {
    const mockUsers = [
      { id: "u1", username: "aden", role: "creator", status: "active", reports: 0 },
      { id: "u2", username: "ghost", role: "creator", status: "suspended", reports: 3 },
    ];
    User.findAll.mockResolvedValue(mockUsers);

    const res = await request(buildApp())
      .get("/api/admin/users")
      .set("Cookie", `fashion_token=${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].username).toBe("aden");
  });

  test("returns 500 on DB error", async () => {
    User.findAll.mockRejectedValue(new Error("DB down"));

    const res = await request(buildApp())
      .get("/api/admin/users")
      .set("Cookie", `fashion_token=${adminToken()}`);

    expect(res.status).toBe(500);
  });
});

// ── POST /api/admin/users/:username/toggle-status ─────────────────────────────

describe("POST /api/admin/users/:username/toggle-status", () => {
  test("404 when user not found", async () => {
    User.findOne.mockResolvedValue(null);
    AuditLogEntry.create.mockResolvedValue({});

    const res = await request(buildApp())
      .post("/api/admin/users/nobody/toggle-status")
      .set("Cookie", `fashion_token=${adminToken()}`);

    expect(res.status).toBe(404);
  });

  test("suspends an active user and logs the action", async () => {
    const mockUser = {
      username: "aden",
      status: "active",
      save: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(mockUser);
    AuditLogEntry.create.mockResolvedValue({});

    const res = await request(buildApp())
      .post("/api/admin/users/aden/toggle-status")
      .set("Cookie", `fashion_token=${adminToken()}`);

    expect(res.status).toBe(200);
    expect(mockUser.status).toBe("suspended");
    expect(AuditLogEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: "SUSPEND_USER", target: "aden" })
    );
  });

  test("reactivates a suspended user and logs the action", async () => {
    const mockUser = {
      username: "ghost",
      status: "suspended",
      save: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(mockUser);
    AuditLogEntry.create.mockResolvedValue({});

    const res = await request(buildApp())
      .post("/api/admin/users/ghost/toggle-status")
      .set("Cookie", `fashion_token=${adminToken()}`);

    expect(res.status).toBe(200);
    expect(mockUser.status).toBe("active");
    expect(AuditLogEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: "REACTIVATE_USER" })
    );
  });
});

// ── POST /api/admin/users/:username/warn ──────────────────────────────────────

describe("POST /api/admin/users/:username/warn", () => {
  test("404 when user not found", async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(buildApp())
      .post("/api/admin/users/nobody/warn")
      .set("Cookie", `fashion_token=${adminToken()}`);

    expect(res.status).toBe(404);
  });

  test("increments report count and logs WARN_USER", async () => {
    const mockUser = {
      username: "aden",
      reports: 1,
      save: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(mockUser);
    AuditLogEntry.create.mockResolvedValue({});

    const res = await request(buildApp())
      .post("/api/admin/users/aden/warn")
      .set("Cookie", `fashion_token=${adminToken()}`);

    expect(res.status).toBe(200);
    expect(mockUser.reports).toBe(2);
    expect(AuditLogEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: "WARN_USER", target: "aden" })
    );
  });
});

// ── GET /api/admin/reports ────────────────────────────────────────────────────

describe("GET /api/admin/reports", () => {
  test("returns report list for admin", async () => {
    const mockReports = [
      { id: "r1", type: "post", status: "pending", poster: "aden" },
      { id: "r2", type: "board", status: "resolved", poster: "ghost" },
    ];
    Report.findAll.mockResolvedValue(mockReports);

    const res = await request(buildApp())
      .get("/api/admin/reports")
      .set("Cookie", `fashion_token=${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

// ── PUT /api/admin/reports/:id ────────────────────────────────────────────────

describe("PUT /api/admin/reports/:id", () => {
  test("404 when report not found", async () => {
    Report.findByPk.mockResolvedValue(null);

    const res = await request(buildApp())
      .put("/api/admin/reports/r999")
      .set("Cookie", `fashion_token=${adminToken()}`)
      .send({ status: "resolved" });

    expect(res.status).toBe(404);
  });

  test("updates report status and logs action", async () => {
    const mockReport = {
      id: "r1",
      status: "pending",
      save: jest.fn().mockResolvedValue(true),
    };
    Report.findByPk.mockResolvedValue(mockReport);
    AuditLogEntry.create.mockResolvedValue({});

    const res = await request(buildApp())
      .put("/api/admin/reports/r1")
      .set("Cookie", `fashion_token=${adminToken()}`)
      .send({ status: "resolved" });

    expect(res.status).toBe(200);
    expect(mockReport.status).toBe("resolved");
    expect(AuditLogEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: "UPDATE_REPORT_RESOLVED" })
    );
  });
});

// ── GET /api/admin/audit-log ──────────────────────────────────────────────────

describe("GET /api/admin/audit-log", () => {
  test("returns audit log entries for admin", async () => {
    const mockLog = [
      { id: "a1", adminUsername: "admin", action: "SUSPEND_USER", target: "aden", timestamp: new Date().toISOString() },
    ];
    AuditLogEntry.findAll.mockResolvedValue(mockLog);

    const res = await request(buildApp())
      .get("/api/admin/audit-log")
      .set("Cookie", `fashion_token=${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].action).toBe("SUSPEND_USER");
  });
});
