import cron from "node-cron";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";

export const expireSubscriptions = async () => {
  console.log("Running cron job for expired subscriptions.");

  // inside the function to be checked every running
  // if outside, will take the date of the server start, which can be outdated
  const now = new Date();

  // Set subscriptions with passed renewalDate and not updated status to status: "expired"
  await Subscription.updateMany(
    {
      renewalDate: { $lt: now },
      // mongo excluding both status
      status: { $nin: ["expired", "cancelled"] },
    },
    // Set is used so only the status parameter is updated, and not the whole document overwritten
    {
      $set: {
        status: "expired",
      },
    },
  );
};

export const expireSubscriptionJob = cron.schedule(
  "*/10 * * * *",
  expireSubscriptions,
);

export const expirePaidUser = cron.schedule("0 0 * * *", async () => {
  console.log("Running paid user check for past date Stripe subscription.");

  const now = new Date();

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
