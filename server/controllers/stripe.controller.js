import { STRIPE_WEBHOOK_SECRET } from "../config/env.js";
import { stripe } from "../config/stripe.js";
import User from "../models/user.model.js";

export const stripeWebhookController = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.log("Webhook signature failed: ", error);
    return res.status(400).send("Webhook failure!");
  }

  if (event.type === "checkout.session.completed") {
    // will store subscription details (user, subscription details)
    const session = event.data.object;

    if (!session.subscription) return;

    //   stored on the id, not the subscription itself
    const subscriptionId = session.subscription;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const endDate =
      subscription.current_period_end && !isNaN(subscription.current_period_end)
        ? new Date(subscription.current_period_end * 1000)
        : null;

    await User.findByIdAndUpdate(session.client_reference_id, {
      plan: subscription.status === "active" ? "pro" : "free",
      stripeCustomerId: session.customer,
      stripeSubscriptionId: subscriptionId,
      currentSubscriptionEnd: endDate,
      subscriptionStatus: subscription.status,
    });
    console.log("User has been upgraded to PRO", session);
  } else if (event.type === "customer.subscription.updated") {
    // the event data object now will be updated subscription
    const sub = event.data.object;

    const endDate =
      sub.current_period_end && !isNaN(sub.current_period_end)
        ? new Date(sub.current_period_end * 1000)
        : null;

    // Find by Stripe subscription
    await User.findOneAndUpdate(
      { stripeSubscriptionId: sub.id },
      {
        currentSubscriptionEnd: endDate,
        subscriptionStatus: sub.status,
        plan: sub.status === "active" ? "pro" : "free",
      },
    );
  } else if (event.type === "customer.subscription.deleted") {
    // the event data object now will be deleting the sub
    const sub = event.data.object;

    await User.findOneAndUpdate(
      {
        stripeSubscriptionId: sub.id,
      },
      {
        currentSubscriptionEnd: null,
        subscriptionStatus: "cancelled",
        plan: "free",
      },
    );
  }

  return res.json({ received: true });
};
