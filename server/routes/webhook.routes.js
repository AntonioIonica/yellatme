import express from "express";
import authorize from "../middlewares/auth.middleware.js";
import { stripeWebhookController } from "../controllers/stripe.controller.js";

const webhookRouter = express.Router();

webhookRouter.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  authorize,
  stripeWebhookController,
);

export default webhookRouter;
