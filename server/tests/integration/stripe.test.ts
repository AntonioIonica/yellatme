import { beforeEach, describe, expect, it, vi } from "vitest";
import { stripe } from "../../config/stripe.js";
import { CLIENT_URL, EMAIL_NAME, STRIPE_PRICE_ID } from "../../config/env.js";
import { loginTest, TEST_USER_ID } from "../unit/subscription.test.js";

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
});
