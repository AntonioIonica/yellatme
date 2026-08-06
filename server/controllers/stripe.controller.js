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

    await User.findByIdAndUpdate(session.client_reference_id, {
      stripeCustomerId: session.customer,
      stripeSubscriptionId: subscriptionId,
    });
  } else if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    const subscriptionId = invoice?.parent?.subscription_details?.subscription;

    if (!subscriptionId) {
      return res.json({ received: true });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const periodEnd = subscription.items?.data?.[0]?.current_period_end; // newer Stripe API

    const endDate = new Date(periodEnd * 1000);
    
    await User.findOneAndUpdate(
      {
        stripeSubscriptionId: subscription.id,
      },
      {
        plan: "pro",
        subscriptionStatus: subscription.status,
        currentSubscriptionEnd: endDate,
        stripeSubscriptionId: subscription.id,
      },
    );
  } else if (event.type === "customer.subscription.updated") {
    // the event data object now will be updated subscription
    const sub = event.data.object;

    const periodEnd = sub.items?.data?.[0]?.current_period_end; // newer Stripe API

    const endDate = periodEnd ? new Date(periodEnd * 1000) : null;
    console.log(endDate);

    // Find by Stripe subscription
    await User.findOneAndUpdate(
      { stripeSubscriptionId: sub?.id },
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
  } else if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;

    await User.findOneAndUpdate(
      { stripeCustomerId: invoice.customer },
      {
        plan: "free",
        subscriptionStatus: "expired",
      },
    );
  }

  return res.json({ received: true });
};
