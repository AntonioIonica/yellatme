import cron from "node-cron";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";

const now = new Date();

export const expireSubscriptionJob = cron.schedule("0 */12 * * *", async () => {
  console.log("Running cron job for expired subscriptions.");

  // Set subscriptions with passed renewalDate and not updated status to status: "expired"
  await Subscription.updateMany(
    {
      renewalDate: { $lt: now },
      // Status not equal
      status: { $ne: "expired" },
    },
    // Set is used so only the status parameter is updated, and not the whole document overwritten
    {
      $set: {
        status: "expired",
      },
    },
  );
});

export const expirePaidUser = cron.schedule("0 0 * * *", async () => {
  console.log("Running paid user check for past date Stripe subscription.");

  await User.updateMany(
    {
      plan: "pro",
      currentSubscriptionEnd: { $lt: now },
      
    },
    {
      $set: {
        plan: "free",
        subscriptionStatus: "expired",
      },
    },
  );
});
