import express from "express";
import { PORT } from "./config/env.js";

import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import userRouter from "./routes/user.routes.js";
import connectMongoDB from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const app = express();

// tells the server to understand json
app.use(express.json());

// Process the form data into a simple format
app.use(express.urlencoded({ extended: false }));

// Reads cookies from requests
app.use(cookieParser());

// Append the routes to the specific general route
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

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
