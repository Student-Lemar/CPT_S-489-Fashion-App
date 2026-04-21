const jwt = require("jsonwebtoken");
const { authenticate, requireAdmin } = require("../../middleware/auth");

const SECRET = "dev-secret-change-in-production";

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function makeReq(overrides = {}) {
  return { cookies: {}, ...overrides };
}

describe("authenticate", () => {
  test("returns 401 when no cookie is present", () => {
    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 when token is invalid", () => {
    const req = makeReq({ cookies: { fashion_token: "bad.token.here" } });
    const res = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 when token is expired", () => {
    const token = jwt.sign(
      { id: "1", username: "user", role: "creator" },
      SECRET,
      { expiresIn: -1 }
    );
    const req = makeReq({ cookies: { fashion_token: token } });
    const res = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("sets req.user and calls next on valid token", () => {
    const payload = { id: "1", username: "aden", role: "creator", displayName: "Aden", status: "active" };
    const token = jwt.sign(payload, SECRET, { expiresIn: "1h" });
    const req = makeReq({ cookies: { fashion_token: token } });
    const res = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.username).toBe("aden");
    expect(req.user.role).toBe("creator");
  });
});

describe("requireAdmin", () => {
  test("returns 403 when user is a creator", () => {
    const req = { user: { role: "creator" } };
    const res = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 when req.user is missing", () => {
    const req = {};
    const res = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next when user is admin", () => {
    const req = { user: { role: "admin" } };
    const res = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
