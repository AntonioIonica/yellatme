import express from "express";
import { PORT } from "./config/env.js";
import cors from "cors";
import dns from "node:dns/promises";

import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import userRouter from "./routes/user.routes.js";
import connectMongoDB from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import workflowRouter from "./routes/workflow.routes.js";
import "./cron/subscriptions.cron.js";
import billingRouter from "./routes/billing.routes.js";
import webhookRouter from "./routes/webhook.routes.js";

const port = process.env.PORT || PORT;

dns.setServers(["8.8.8.8", "1.1.1.1"]); // Google + Cloudflare
const app = express();

// Before parsing as json because needs to be raw body for stripe
app.use("/api/webhook", webhookRouter);

// tells the server to understand json
app.use(express.json());

// Reads cookies from requests
app.use(cookieParser());


app.use(
  cors({
    origin: ["http://localhost:3000", "https://yellatme-gold.vercel.app"],
    credentials: true,
  }),
);

// Process the form data into a simple format
app.use(express.urlencoded({ extended: false }));

// Arcjet middleware - rate limiter
app.use(arcjetMiddleware);

// Append the routes to the specific general route
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/workflows", workflowRouter);
app.use("/api/billing", billingRouter);

// Error middleware
app.use(errorMiddleware);

app.listen(port || 5500, async () => {
  console.log(`The server started at http://localhost:${PORT}`);

  // Before starting the server
  await connectMongoDB();
});

export default app;
