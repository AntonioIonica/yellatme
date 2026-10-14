import { describe, expect, test } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { EMAIL_NAME, EMAIL_PASSWORD } from "../../config/env.js";
import { expireSubscriptions } from "../../cron/subscriptions.cron.js";

export const TEST_SUB_ID = "69c83b3ba247ab4be0b52e91";
export const TEST_USER_ID = "6a60510cc3b6a3d358ec44fd";

export type subscription = {
  name: string;
  description: string;
  price: number;
  currency: string;
  frequency: string;
  category: string;
  paymentMethod: string;
  status: string;
  startDate: Date;
  renewalDate: Date;
  user: string;
};

export const dummySubscription = (frequency = "daily") => {
  return {
    name: "Netflix new subscriptions",
    price: 12,
    frequency,
    category: "house",
    paymentMethod: "credit card",
    status: "active",
    startDate: new Date().toISOString(),
    user: "6a60510cc3b6a3d358ec44fd",
  };
};

export async function loginTest() {
  const agent = request.agent(app);

  await agent.post("/api/v1/auth/sign-in").send({
    email: EMAIL_NAME,
    password: EMAIL_PASSWORD,
  });

  return agent;
}

describe("POST /api/v1/subscriptions", () => {
  test("Create new subscription", async () => {
    const agent = await loginTest();

    const res = await agent
      .post("/api/v1/subscriptions")
      .send(dummySubscription());

    expect(res.status).toBe(201);
    expect(res.body.data.subscription.name).toBe("Netflix new subscriptions");
  });

  test("Get test subscription", async () => {
    const agent = await loginTest();

    const res = await agent.get(`/api/v1/subscriptions/${TEST_SUB_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(TEST_SUB_ID);
  });

  test("Get upcoming renewals", async () => {
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/sign-in").send({
      email: EMAIL_NAME,
      password: EMAIL_PASSWORD,
    });

    const res = await agent.get("/api/v1/subscriptions/upcoming-renewals");

    expect(res.status).toBe(200);
  });

  test("Daily renewal date", async () => {
    const agent = await loginTest();

    const res = await agent
      .post("/api/v1/subscriptions")
      .send(dummySubscription());

    const start = new Date(res.body.data.subscription.startDate);
    const renewalDate = new Date(res.body.data.subscription.renewalDate);

    const dateDifference =
      (renewalDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    expect(res.status).toBe(201);
    expect(dateDifference).toBe(1);
  });

  test("Weekly renewal date", async () => {
    const agent = await loginTest();

    const res = await agent
      .post("/api/v1/subscriptions")
      .send(dummySubscription("weekly"));

    const start = new Date(res.body.data.subscription.startDate);
    const renewalDate = new Date(res.body.data.subscription.renewalDate);

    const dateDifference =
      (renewalDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    expect(res.status).toBe(201);
    expect(dateDifference).toBe(7);
  });

  test("Monthly renewal date", async () => {
    const agent = await loginTest();

    const res = await agent
      .post("/api/v1/subscriptions")
      .send(dummySubscription("monthly"));

    const start = new Date(res.body.data.subscription.startDate);
    const renewalDate = new Date(res.body.data.subscription.renewalDate);

    const dateDifference =
      (renewalDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    expect(res.status).toBe(201);
    expect(Math.floor(dateDifference)).toBe(30);
  });

  test("Should not fetch subs when unauthenticated", async () => {
    const res = await request(app).get("/api/v1/subscriptions");

    expect(res.status).toBe(403);
  });

  test("Should not see others subscriptions", async () => {
    const agent = await loginTest();

    const res = await agent.get(`/api/v1/subscriptions/user/${TEST_USER_ID}`);

    expect(res.body.data.map((sub: subscription) => sub.name)).not.toContain(
      "Silo",
    );
  });

  test("Should update a subscription", async () => {
    const agent = await loginTest();

    const res = await agent
      .patch("/api/v1/subscriptions/698edb5d0487e7e2f4e26dad")
      .send({
        name: "Netflix extra VIP",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.subscription.name).toBe("Netflix extra VIP");
    expect(res.body.data.workflowRunId).toBeNull;
  });

  test("Should return 404 when updating a subscription which doesn't exists", async () => {
    const agent = await loginTest();

    const res = await agent
      .patch("/api/v1/subscriptions/000edb5d0000e7e2f4e26dad")
      .send({
        name: "Netflix extra VIP",
      });

    expect(res.status).toBe(404);
  });

  test("Should cancel an active subscription", async () => {
    const agent = await loginTest();

    const res1 = await agent
      .post("/api/v1/subscriptions")
      .send(dummySubscription());

    const res2 = await agent.patch(
      `/api/v1/subscriptions/${res1.body.data.subscription._id}/cancel`,
    );

    expect(res2.status).toBe(200);

    expect(res2.body.data.status).toBe("cancelled");
  });

  test("Should delete a subscription", async () => {
    const agent = await loginTest();

    const createSubscriptionRes = await agent
      .post("/api/v1/subscriptions")
      .send(dummySubscription());

    if (!createSubscriptionRes.body.success) return;

    const res = await agent.delete(
      `/api/v1/subscriptions/${createSubscriptionRes.body.data.subscription._id}`,
    );

    expect(res.status).toBe(204);

    const confirmDeleteRes = await agent.get(
      `/api/v1/subscriptions/${createSubscriptionRes.body.data.subscription._id}`,
    );

    expect(confirmDeleteRes.status).toBe(404);
  });

  test("Pro plan users can create more than 5 subscriptions", async () => {
    const agent = await loginTest();

    const createSubscriptionRes1 = await agent
      .post("/api/v1/subscriptions")
      .send(dummySubscription());

    expect(createSubscriptionRes1.status).toBe(201);

    const createSubscriptionRes2 = await agent
      .post("/api/v1/subscriptions")
      .send(dummySubscription());

    expect(createSubscriptionRes2.status).toBe(201);

    const createSubscriptionRes3 = await agent
      .post("/api/v1/subscriptions")
      .send(dummySubscription());

    expect(createSubscriptionRes3.status).toBe(201);

    const createSubscriptionRes4 = await agent
      .post("/api/v1/subscriptions")
      .send(dummySubscription());

    expect(createSubscriptionRes4.status).toBe(201);

    const createSubscriptionRes5 = await agent
      .post("/api/v1/subscriptions")
      .send(dummySubscription());

    expect(createSubscriptionRes5.status).toBe(201);

    const createSubscriptionRes6 = await agent
      .post("/api/v1/subscriptions")
      .send(dummySubscription());

    expect(createSubscriptionRes6.status).toBe(201);
  });

  test("Should not set expired for cancelled subscriptions", async () => {
    const agent = await loginTest();

    const date = new Date();
    date.setDate(date.getDate() - 1);

    const res = await agent.post(`/api/v1/subscriptions`).send({
      name: "Netflix new subscriptions",
      price: 12,
      frequency: "weekly",
      category: "house",
      status: "cancelled",
      paymentMethod: "credit card",
      startDate: new Date().toISOString(),
      user: "6a60510cc3b6a3d358ec44fd",
    });

    // Running cron jobs immediately to check for expired subs
    await expireSubscriptions();

    expect(res.body.data.subscription.status).toBe("cancelled");
  });
});
