const express = require("express");
const cookieParser = require("cookie-parser");
const request = require("supertest");

// Mock DB models before requiring the route
jest.mock("../../models", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Profile: {
    create: jest.fn(),
  },
}));

const { User, Profile } = require("../../models");
const authRouter = require("../../routes/auth");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRouter);
  return app;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ── POST /api/auth/register ────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  test("400 when username is missing", async () => {
    const res = await request(buildApp())
      .post("/api/auth/register")
      .send({ password: "secret123" });
    expect(res.status).toBe(400);
  });

  test("400 when password is missing", async () => {
    const res = await request(buildApp())
      .post("/api/auth/register")
      .send({ username: "aden" });
    expect(res.status).toBe(400);
  });

  test("400 when username is too short (< 3 chars)", async () => {
    const res = await request(buildApp())
      .post("/api/auth/register")
      .send({ username: "ab", password: "secret123" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/3 characters/i);
  });

  test("400 when password is too short (< 6 chars)", async () => {
    const res = await request(buildApp())
      .post("/api/auth/register")
      .send({ username: "aden", password: "abc" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/6 characters/i);
  });

  test("409 when username is already taken", async () => {
    User.findOne.mockResolvedValue({ username: "aden" });

    const res = await request(buildApp())
      .post("/api/auth/register")
      .send({ username: "aden", password: "secret123" });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already taken/i);
  });

  test("201 on successful registration", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ username: "aden", displayName: "Aden" });
    Profile.create.mockResolvedValue({});

    const res = await request(buildApp())
      .post("/api/auth/register")
      .send({ username: "aden", password: "secret123", displayName: "Aden" });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
  });

  test("uses username as displayName if not provided", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ username: "aden", displayName: "aden" });
    Profile.create.mockResolvedValue({});

    await request(buildApp())
      .post("/api/auth/register")
      .send({ username: "aden", password: "secret123" });

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: "aden" })
    );
  });
});

// ── POST /api/auth/login ───────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  test("400 when credentials are missing", async () => {
    const res = await request(buildApp()).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });

  test("401 when user does not exist", async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(buildApp())
      .post("/api/auth/login")
      .send({ username: "ghost", password: "secret123" });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  test("403 when account is suspended", async () => {
    User.findOne.mockResolvedValue({ username: "aden", status: "suspended" });

    const res = await request(buildApp())
      .post("/api/auth/login")
      .send({ username: "aden", password: "secret123" });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/suspended/i);
  });

  test("401 when password is wrong", async () => {
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash("correctpass", 12);
    User.findOne.mockResolvedValue({
      username: "aden",
      status: "active",
      role: "creator",
      displayName: "Aden",
      passwordHash: hash,
    });

    const res = await request(buildApp())
      .post("/api/auth/login")
      .send({ username: "aden", password: "wrongpass" });
    expect(res.status).toBe(401);
  });

  test("200 and sets cookie on correct credentials", async () => {
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash("secret123", 12);
    User.findOne.mockResolvedValue({
      id: "u1",
      username: "aden",
      status: "active",
      role: "creator",
      displayName: "Aden",
      passwordHash: hash,
    });

    const res = await request(buildApp())
      .post("/api/auth/login")
      .send({ username: "aden", password: "secret123" });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe("aden");
    expect(res.body.role).toBe("creator");
    expect(res.headers["set-cookie"]).toBeDefined();
  });
});

// ── POST /api/auth/logout ──────────────────────────────────────────────────────

describe("POST /api/auth/logout", () => {
  test("200 and clears cookie", async () => {
    const res = await request(buildApp()).post("/api/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────────

describe("GET /api/auth/me", () => {
  test("401 when no token provided", async () => {
    const res = await request(buildApp()).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
