import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import { createCheckoutSession } from "../controllers/billing.controller.js";

const billingRouter = Router();

billingRouter.post("/checkout", authorize, createCheckoutSession);

export default billingRouter;
