import cron from "node-cron";
import Subscription from "../models/subscription.model.js";

export const expireSubscriptionJob = cron.schedule("0 */12 * * *", async () => {
  console.log("Running cron job for expired subscriptions.");

  // Set subscriptions with passed renewalDate and not updated status to status: "expired"
  await Subscription.updateMany(
    {
      renewalDate: { $lt: new Date() },
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
