import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  createSubscription,
  getUserSubscriptions,
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/", authorize, (req, res) => {
  res.send({ title: "GET all subscriptions" });
});

subscriptionRouter.get("/upcoming-renewals", authorize, (req, res) => {
  res.send({ title: "GET upcoming renewals" });
});

subscriptionRouter.get("/:id", authorize, (req, res) => {
  res.send({ title: "GET subscription details" });
});

subscriptionRouter.post("/", authorize, createSubscription);

subscriptionRouter.put("/:id", authorize, (req, res) => {
  res.send({ title: "UPDATE subscription" });
});

subscriptionRouter.delete("/:id", authorize, (req, res) => {
  res.send({ title: "DELETE subscription" });
});

subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);

subscriptionRouter.put("/:id/cancel", authorize, (req, res) => {
  res.send({ title: "CANCEL subscription" });
});

export default subscriptionRouter;
