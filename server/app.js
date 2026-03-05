import express from "express";
import { PORT } from "./config/env.js";
import cors from "cors";

import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import userRouter from "./routes/user.routes.js";
import connectMongoDB from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import workflowRouter from "./routes/workflow.routes.js";
import "./cron/subscriptions.cron.js";

const app = express();

// tells the server to understand json
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

// Process the form data into a simple format
app.use(express.urlencoded({ extended: false }));

// Reads cookies from requests
app.use(cookieParser());

// Arcjet middleware - rate limiter
app.use(arcjetMiddleware);

// Append the routes to the specific general route
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/workflows", workflowRouter);

// Error middleware
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.status(200).send("Hello to the subscriptions reminder");
});

app.listen(PORT, async () => {
  console.log(`The server started at http://localhost:${PORT}`);

  // Before starting the server
  await connectMongoDB();
});

export default app;
