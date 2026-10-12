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
});
