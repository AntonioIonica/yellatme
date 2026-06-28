import { stripe } from "../config/stripe.js";
import User from "../models/user.model.js";

export const stripeWebhookController = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    next(error);
  }

  if (event.type === "checkout.session.completed") {
    console.log("🔥 ENTERED CHECKOUT SESSION COMPLETED");
    // will store subscription details (user, subscription details)
    const session = event.data.object;

    console.log("SESSION:", session);
    if (!session.subscription) return;

    //   stored on the id, not the subscription itself
    const subscriptionId = session.subscription;
    if (!subscriptionId) return;

    const end = session.current_period_end;
    if (!end || isNaN(end)) {
      console.log("❌ Invalid current_period_end:", end);
      return;
    }

    const endDate =
      session.current_period_end && !isNaN(session.current_period_end)
        ? new Date(session.current_period_end * 1000)
        : null;

    await User.findOneAndUpdate(
      { email: session.customer_email },
      {
        plan: session.status === "active" ? "pro" : "free",
        stripeCustomerId: session.customer,
        stripeSubscriptionId: subscriptionId,
        currentSubscriptionEnd: endDate,
      },
    );
    console.log("User has just been updated", session);
  }

  if (event.type === "customer.subscription.updated") {
    // the event data object now will be updated subscription
    const sub = event.data.object;

    await User.findOneAndUpdate(
      {
        stripeSubscriptionId: sub.id,
      },
      {
        currentSubscriptionEnd: new Date(sub.current_period_end * 1000),
        subscriptionStatus: sub.status,
        plan: sub.status === "active" ? "pro" : "free",
      },
    );
  }

  if (event.type === "customer.subscription.deleted") {
    // the event data object now will be deleting the sub
    const sub = event.data.object;

    await User.findOneAndUpdate(
      {
        stripeSubscriptionId: sub.id,
      },
      {
        currentSubscriptionEnd: null,
        subscriptionStatus: sub.status || "cancelled",
        plan: "free",
      },
    );
  }

  res.json({ received: true });
};
