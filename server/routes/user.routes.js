import { Router } from "express";

import {
  changePlan,
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";
import admin from "../middlewares/admin.middleware.js";

const userRouter = Router();

userRouter.get("/", authorize, admin, getUsers);

userRouter.get("/:id", authorize, getUser);

userRouter.post("/", authorize, admin, createUser);

userRouter.put("/:id", authorize, updateUser);

userRouter.delete("/:id", authorize, deleteUser);

userRouter.get("/:id/change-plan", authorize, changePlan)

export default userRouter;
