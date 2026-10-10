import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env.js";

const userId = "6a60510cc3b6a3d358ec44fd";

describe("GET /api/v1/auth/jwt", () => {
  it("Should reject a login without an auth token", async () => {
    const res = await request(app).get("/api/v1/auth/jwt");

    expect(res.status).toBe(401);
  });

  it("Should reject an invalid auth token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/jwt")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
  });

  it("Should reject an expired auth token", async () => {
    // Without it the JWT_SECRET will be null
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured!");
    }

    if (!userId) {
      throw new Error("No user id present!");
    }

    const expiredToken = jwt.sign(
      { userId: "6a60510cc3b6a3d358ec44fd", role: "user" },
      JWT_SECRET,
      { expiresIn: -1 },
    );

    const res = await request(app)
      .get("/api/v1/auth/jwt")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });
});
