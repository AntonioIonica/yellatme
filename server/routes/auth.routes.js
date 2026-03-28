import { Router } from "express";

import {
  getJwtUser,
  signIn,
  signOut,
  signUp,
} from "../controllers/auth.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const authRouter = Router();

// path: /api/v1/auth/<sign-up sign-in sign-out>
authRouter.post("/sign-up", signUp);

authRouter.post("/sign-in", signIn);

authRouter.get("/sign-out", signOut);

authRouter.get("/jwt", authorize, getJwtUser);

export default authRouter;
