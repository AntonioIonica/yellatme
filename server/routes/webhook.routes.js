import express from "express";
import { stripeWebhookController } from "../controllers/stripe.controller.js";

const webhookRouter = express.Router();

webhookRouter.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookController,
);

export default webhookRouter;
