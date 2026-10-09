import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../app.js";
import User from "../../models/user.model.js";
import { stripe } from "../../config/stripe.js";

vi.mock("../../config/stripe.js", () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    subscriptions: {
      retrieve: vi.fn(),
    },
  },
}));

vi.mock("../../models/user.model.js", () => ({
  default: {
    findByIdAndUpdate: vi.fn().mockResolvedValue(null),
    findOneAndUpdate: vi.fn().mockResolvedValue(null),
  },
}));

const mockedConstructEvent = vi.mocked(stripe.webhooks.constructEvent);

describe("POST /api/webhook/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should reject requests with invalid Stripe signature", async () => {
    mockedConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const res = await request(app)
      .post("/api/webhook/stripe")
      .set("stripe-signature", "invalid-signature")
      .set("Content-Type", "aplication/json")
      .send({
        test: true,
      });

    expect(res.status).toBe(400);
    expect(res.text).toBe("Webhook failure!");
  });

  it("Should save Stripe customer and sub ID after checkout completes", async () => {
    const userId = "6a60510cc3b6a3d358ec44fd";
    const customerId = "cus_test123";
    const subscriptionId = "11c83b3ba111ab4be0b11e91";

    mockedConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          client_reference_id: userId,
          customer: customerId,
          subscription: subscriptionId,
        },
      },
    } as Awaited<ReturnType<typeof stripe.webhooks.constructEvent>>);

    const response = await request(app)
      .post("/api/webhook/stripe")
      .set("stripe-signature", "valid-test-signature")
      .set("Content-Type", "application/json")
      .send({ test: true });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    });
  });
});
