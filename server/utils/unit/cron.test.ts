import { describe, it, expect, vi, beforeEach } from "vitest";
import Subscription from "../../models/subscription.model.js";
import {
  expireSubscriptions,
  checkUserSubscriptions,
} from "../../cron/subscriptions.cron.js";
import User from "../../models/user.model.js";

vi.mock("../../models/subscription.model.js", () => ({
  default: {
    updateMany: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  },
}));

vi.mock("../../models/user.model.js", () => ({
  default: {
    updateMany: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  },
}));

describe("Expired subscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should set expired subs past renewalDate", async () => {
    const beforeExecution = new Date();

    await expireSubscriptions();

    const afterExecution = new Date();

    expect(Subscription.updateMany).toHaveBeenCalledTimes(1);

    // first parameter of updateMany is filter, the second one is update
    const [filter, update] = vi.mocked(Subscription.updateMany).mock
      .calls[0] as any;

    expect(filter.renewalDate.$lt.getTime()).toBeGreaterThanOrEqual(
      beforeExecution.getTime(),
    );

    expect(filter.renewalDate.$lt.getTime()).toBeLessThanOrEqual(
      afterExecution.getTime(),
    );

    expect(filter.status).toEqual({
      $nin: ["expired", "cancelled"],
    });

    expect(update).toEqual({
      $set: {
        status: "expired",
      },
    });
  });
});

describe("Expired paid users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should downgrade expire pro plan to free plan", async () => {
    const beforeExecution = new Date();

    await checkUserSubscriptions();

    const afterExecution = new Date();

    expect(User.updateMany).toHaveBeenCalledTimes(1);

    const [filter, update] = vi.mocked(User.updateMany).mock.calls[0] as any;

    expect(filter.plan).toBe("pro");
    expect(filter.currentSubscriptionEnd.$lt.getTime()).toBeGreaterThanOrEqual(
      beforeExecution.getTime(),
    );
    // To be put in the past
    expect(filter.currentSubscriptionEnd.$lt.getTime()).toBeLessThanOrEqual(
      afterExecution.getTime(),
    );

    expect(update).toEqual({
      $set: {
        plan: "free",
        subscriptionStatus: "expired",
      },
    });
  });
});
