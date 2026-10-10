import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app.js";

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
});
