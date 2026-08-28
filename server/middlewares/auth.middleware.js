import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config/env.js";
import User from "../models/user.model.js";

const authorize = async (req, res, next) => {
  try {
    // Running tests
    // if(NODE_ENV == "test") {
    //   req.user = {
    //     _id: "6a60510cc3b6a3d358ec44fd",
    //   };
    //   return next();
    // }

    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) return res.status(401).json({ message: "Unauthorized!" });
    console.log("No token line");


    // 2. Verified by the server using the secret and get the userId from the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Getting the user by the id from the decoded token
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(401).json({ message: "Unauthorized!" });
    console.log("No user line");
  
    // 4. If the user is valid, attach the user to the request being made
    req.user = user;

    // 5. Authorize the user to continue and passing
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized!", error: error.message });
  }
};

export default authorize;
