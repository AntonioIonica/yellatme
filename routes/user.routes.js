import { Router } from "express";

import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/", getUsers);

userRouter.get("/:id", authorize, getUser);

userRouter.post("/", authorize, createUser);

userRouter.put("/:id", authorize, updateUser);

userRouter.delete("/:id", authorize, deleteUser);

export default userRouter;
