import { describe, it, expect, vi, beforeEach } from "vitest";
import { reminderWorkflow } from "../../controllers/workflow.controller.js";
import Subscription from "../../models/subscription.model.js";
import { sendReminderEmail } from "../../utils/send-email.js";

export const TEST_SUB_ID = "69c83b3ba247ab4be0b52e91";
export const TEST_USER_ID = "6a60510cc3b6a3d358ec44fd";

vi.mock("../../models/subscription.model.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock("../../utils/send-email.js", () => ({
  sendReminderEmail: vi.fn(),
}));

describe("Reminder workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should not send reminders for inactive subscriptions", async () => {
    const subscription = {
      _id: TEST_SUB_ID,
      name: "Netflix new subscription-family",
      status: "cancelled",
      startDate: new Date().toISOString(),
      price: 10,
      renewalDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      user: TEST_USER_ID,
    };

    vi.mocked(Subscription.findById).mockReturnValue({
      populate: vi.fn().mockResolvedValue(subscription),
    } as any);

    const context = {
      requestPayload: {
        subscriptionId: subscription._id,
      },
      run: vi.fn(async (_label, callback) => callback()),
      sleepUntil: vi.fn(),
    };

    await reminderWorkflow(context as any);

    expect(context.run).toHaveBeenCalledTimes(1);
    expect(context.sleepUntil).not.toHaveBeenCalled();
    expect(sendReminderEmail).not.toHaveBeenCalled();
  });

  it("Should not schedule/send reminders when renewal date passed", async () => {
    const subscription = {
      _id: TEST_SUB_ID,
      name: "Netflix new subscription-family",
      status: "expired",
      startDate: new Date().toISOString(),
      price: 10,
      renewalDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      user: TEST_USER_ID,
    };

    vi.mocked(Subscription.findById).mockReturnValue({
      populate: vi.fn().mockResolvedValue(subscription),
    } as any);

    const context = {
      requestPayload: {
        subscriptionId: subscription._id,
      },
      run: vi.fn(async (_label, callback) => callback()),
      sleepUntil: vi.fn(),
    };

    await reminderWorkflow(context as any);

    expect(context.run).toHaveBeenCalledTimes(1);
    expect(context.sleepUntil).not.toHaveBeenCalled();
    expect(sendReminderEmail).not.toHaveBeenCalled();
  });

  it("Should schedule reminders given days before renewals", async () => {
    vi.useFakeTimers(); // using fake timers

    try {
      vi.setSystemTime(new Date("2026-10-12T12:00:00Z"));

      const subscription = {
        _id: TEST_SUB_ID,
        name: "Netflix new subscription-family",
        status: "active",
        startDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        price: 10,
        renewalDate: new Date("2026-10-22T12:00:00Z").toISOString(),
        user: TEST_USER_ID,
      };

      vi.mocked(Subscription.findById).mockReturnValue({
        populate: vi.fn().mockResolvedValue(subscription),
      } as any);

      const context = {
        requestPayload: {
          subscriptionId: subscription._id,
        },
        run: vi.fn(async (_label, callback) => callback()),
        sleepUntil: vi.fn(),
      };

      await reminderWorkflow(context as any);

      expect(context.sleepUntil).toHaveBeenCalledTimes(4);

      // args(nth call, label, date)
      expect(context.sleepUntil).toHaveBeenNthCalledWith(
        1,
        "7 days before reminder",
        new Date("2026-10-15T12:00:00Z"),
      );
      expect(context.sleepUntil).toHaveBeenNthCalledWith(
        2,
        "5 days before reminder",
        new Date("2026-10-17T12:00:00Z"),
      );
      expect(context.sleepUntil).toHaveBeenNthCalledWith(
        3,
        "3 days before reminder",
        new Date("2026-10-19T12:00:00Z"),
      );
      expect(context.sleepUntil).toHaveBeenNthCalledWith(
        4,
        "1 days before reminder",
        new Date("2026-10-21T12:00:00Z"),
      );

      expect(sendReminderEmail).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers(); // back to real timers
    }
  });

  it("Should send an email when reminder date is due", async () => {
    vi.useFakeTimers(); // set fake timers to be able to use fixed date

    try {
      vi.setSystemTime(new Date("2026-10-12T12:00:00Z"));

      const subscription = {
        _id: TEST_SUB_ID,
        name: "Netflix new subscription-family",
        status: "active",
        startDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        price: 10,
        renewalDate: new Date("2026-10-19T12:00:00Z").toISOString(),
        user: { _id: TEST_USER_ID, email: "antonioiulianionica@gmail.com" },
      };

      vi.mocked(Subscription.findById).mockReturnValue({
        populate: vi.fn().mockResolvedValue(subscription),
      } as any);

      const context = {
        requestPayload: {
          subscriptionId: subscription._id,
        },
        run: vi.fn(async (_label, callback) => callback()),
        sleepUntil: vi.fn(),
      };

      await reminderWorkflow(context as any);

      expect(sendReminderEmail).toHaveBeenCalledTimes(1);

      expect(sendReminderEmail).toHaveBeenCalledWith({
        to: "antonioiulianionica@gmail.com",
        type: "7 days before reminder",
        subscription,
      });

      //   scheduling the remaning days
      expect(context.sleepUntil).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it("Should not send a reminder if the subscription is cancelled before reminder sending", async () => {
    vi.useFakeTimers();

    try {
      vi.setSystemTime(new Date("2026-10-12T12:00:00Z"));

      const subscription = {
        _id: TEST_SUB_ID,
        name: "Netflix new subscription-family",
        status: "active",
        startDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        price: 10,
        renewalDate: new Date("2026-10-19T12:00:00Z").toISOString(),
        user: { _id: TEST_USER_ID, email: "antonioiulianionica@gmail.com" },
      };

      const cancelledSubscription = {
        ...subscription,
        status: "cancelled",
      };

      //   resolving once with active sub and then with cancelled sub
      const populate = vi
        .fn()
        .mockResolvedValueOnce(subscription)
        .mockResolvedValueOnce(cancelledSubscription);

      vi.mocked(Subscription.findById).mockReturnValue({
        populate,
      } as any);

      const context = {
        requestPayload: {
          subscription: subscription._id,
        },
        run: vi.fn(async (_label, callback) => callback()),
        sleepUntil: vi.fn(),
      };

      await reminderWorkflow(context as any);

      //   2 times because 2 types of subscriptions
      expect(Subscription.findById).toHaveBeenCalledTimes(2);

      expect(sendReminderEmail).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
