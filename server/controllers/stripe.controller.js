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
    // will store subscription details (user, subscription details)
    const session = event.data.object;

    const customerEmail = session.customer_email;
    //   stored on the id, not the subscription itself
    const subscriptionId = session.subscription;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    await User.findOneAndUpdate(
      { email: customerEmail },
      {
        plan: "pro",
        stripeCustomerId: session.customer,
        stripeSubscriptionId: subscriptionId,
        currentSubscriptionEnd: new Date(
          subscription.current_period_end * 1000,
        ),
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

  res.json({ received: true });
};
