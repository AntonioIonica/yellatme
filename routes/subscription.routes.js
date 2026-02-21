import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  createSubscription,
  getAllSubscriptions,
  getUserSubscriptions,
} from "../controllers/subscription.controller.js";
import admin from "../middlewares/admin.middleware.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/", authorize, admin, getAllSubscriptions);

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
