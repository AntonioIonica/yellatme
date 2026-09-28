import { describe, expect, test } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { TEST_PASSWORD } from "../../config/env.js";

const TEST_SUB_ID = "69c83b3ba247ab4be0b52e91";

describe("POST /api/v1/subscriptions", () => {
  test("Create new subscription", async () => {
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/sign-in").send({
      email: "antonioiulianionica@gmail.com",
      password: TEST_PASSWORD,
    });

    const res = await agent.post("/api/v1/subscriptions").send({
      name: "Netflix new subscriptions",
      price: 12,
      frequency: "daily",
      category: "house",
      paymentMethod: "credit card",
      startDate: new Date().toISOString(),
      user: "6a60510cc3b6a3d358ec44fd",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.subscription.name).toBe("Netflix new subscriptions");
  });

  test("Get test subscription", async () => {
    const agent = request.agent(app);

    await agent.get("/api/v1/auth/sign-in").send({
      email: "antonioiulianionica@gmail.com",
      password: TEST_PASSWORD,
    });

    const res = await agent.get(`/api/v1/subscriptions/${TEST_SUB_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(TEST_SUB_ID);
  });

  test("Get upcoming renewals", async () => {
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/sign-in").send({
      email: "antonioiulianionica@gmail.com",
      password: TEST_PASSWORD,
    });

    const res = await agent.get("/api/v1/subscriptions/upcoming-renewals");

    expect(res.status).toBe(200);
  });

  test("Daily renewal date", async () => {
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/sign-in").send({
      email: "antonioiulianionica@gmail.com",
      password: TEST_PASSWORD,
    });

    const res = await agent.post("/api/v1/subscriptions").send({
      name: "Daily renewal test",
      price: 10,
      frequency: "daily",
      category: "house",
      paymentMethod: "credit card",
      startDate: new Date().toISOString(),
      user: "6a60510cc3b6a3d358ec44fd",
    });

    const start = new Date(res.body.data.subscription.startDate);
    const renewalDate = new Date(res.body.data.subscription.renewalDate);

    const dateDifference =
      (renewalDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    expect(res.status).toBe(201);
    expect(dateDifference).toBe(1);
  });

  test("Weekly renewal date", async () => {
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/sign-in").send({
      email: "antonioiulianionica@gmail.com",
      password: TEST_PASSWORD,
    });

    const res = await agent.post("/api/v1/subscriptions").send({
      name: "Weekly renewal test",
      price: 10,
      frequency: "weekly",
      category: "house",
      paymentMethod: "credit card",
      startDate: new Date().toISOString(),
      user: "6a60510cc3b6a3d358ec44fd",
    });

    const start = new Date(res.body.data.subscription.startDate);
    const renewalDate = new Date(res.body.data.subscription.renewalDate);

    const dateDifference =
      (renewalDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    expect(res.status).toBe(201);
    expect(dateDifference).toBe(7);
  });

  test("Monthly renewal date", async () => {
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/sign-in").send({
      email: "antonioiulianionica@gmail.com",
      password: TEST_PASSWORD,
    });

    const res = await agent.post("/api/v1/subscriptions").send({
      name: "Monthly renewal test",
      price: 10,
      frequency: "monthly",
      category: "house",
      paymentMethod: "credit card",
      startDate: new Date().toISOString(),
      user: "6a60510cc3b6a3d358ec44fd",
    });

    const start = new Date(res.body.data.subscription.startDate);
    const renewalDate = new Date(res.body.data.subscription.renewalDate);

    const dateDifference =
      (renewalDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    expect(res.status).toBe(201);
    expect(Math.floor(dateDifference)).toBe(30);
  });
});
