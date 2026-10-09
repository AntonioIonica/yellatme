import { beforeEach, describe, expect, it, vi } from "vitest";
import { stripe } from "../../config/stripe.js";
import request from "supertest";
import app from "../../app.js";
import { EMAIL_NAME, EMAIL_PASSWORD } from "../../config/env.js";

export async function loginTest() {
  const agent = request.agent(app);

  await agent.post("/api/v1/auth/sign-in").send({
    email: EMAIL_NAME,
    password: EMAIL_PASSWORD,
  });

  return agent;
}

// simulating a session
vi.mock("../../config/stripe.js", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));
const mockedCreateSession = vi.mocked(stripe.checkout.sessions.create);

describe("POST /api/billing/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should create a checkout session and return its URL", async () => {
    const checkoutUrl = "https://checkout.stripe.com/test-session";

    mockedCreateSession.mockResolvedValue({
      url: checkoutUrl,
    } as Awaited<ReturnType<typeof stripe.checkout.sessions.create>>);

    const agent = await loginTest();

    const stripeRes = await agent.post("/api/billing/checkout");

    expect(stripeRes.status).toBe(200);

    expect(stripeRes.body.url).toBe(checkoutUrl);
  });

  it("Should give an error when Stripe fails", async () => {
    const agent = await loginTest();

    mockedCreateSession.mockRejectedValue(new Error("Stripe checkout failed"));

    const stripeRes = await agent.post("/api/billing/checkout");

    expect(stripeRes.status).toBe(500);
  });
});
