import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  cancelSubscription,
  createSubscription,
  deleteSubscription,
  getAllSubscriptions,
  getSubscription,
  getUpcomingRenewals,
  getUserSubscriptions,
  updateSubscription,
} from "../controllers/subscription.controller.js";
import admin from "../middlewares/admin.middleware.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/", authorize, admin, getAllSubscriptions);

subscriptionRouter.get("/upcoming-renewals", authorize, getUpcomingRenewals);

subscriptionRouter.get("/:id", authorize, getSubscription);

subscriptionRouter.post("/", authorize, createSubscription);

subscriptionRouter.patch("/:id", authorize, updateSubscription);

subscriptionRouter.delete("/:id", authorize, deleteSubscription);

subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);

subscriptionRouter.patch("/:id/cancel", authorize, cancelSubscription);

export default subscriptionRouter;
