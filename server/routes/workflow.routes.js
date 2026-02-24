import { Router } from "express";
import { sendReminders } from "../controllers/workflow.controller.js";

const workflowRouter = Router();

// The endpoint will be hit when creating a new subscription
workflowRouter.post("/subscription/reminder", sendReminders);

export default workflowRouter;
