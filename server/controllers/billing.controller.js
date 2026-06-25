import { stripe } from "../config/stripe.js";

export const createCheckoutSession = async (req, res, next) => {
  try {
    const user = req.user;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard/settings`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard/settings`,
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
};
