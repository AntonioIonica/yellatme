import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } from "../config/env.js";

// Create a new user
export const signUp = async (req, res, next) => {
  // Atomic operations constraints
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error(
        "There is already an user created with this email. Please try a different email!",
      );
      error.statusCode = 409;
      throw error;
    }

    // Hashing the password before storing it
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create new user (or multiple) and attach the session to abort it in case of failure (atomic)
    // Will return a list with n elements (1 in this case)
    const newUsers = await User.create(
      [{ name, email, password: hashPassword, role: "user" }],
      { session },
    );

    // Creating a token to be attached to the user using the coming id from creating the new user
    const token = jwt.sign(
      { userId: newUsers[0]._id, role: newUsers[0].role },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      },
    );

    // At the end commit all the above code and end the session
    await session.commitTransaction();
    session.endSession();

    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "development" ? false : true, // modifiy to false in case not working
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully!",
      data: {
        token,
        user: newUsers[0],
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Send the error to error middleware
    next(error);
  }
};

// Login the user
export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists in the DB
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    // Check if the password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error("Invalid password entered. Please try again!");
      error.statusCode = 401;
      throw error;
    }

    // if the password is valid generate a token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production" ? true : false,
      sameSite: "none", // worked with lax
      path: "/", 
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "The user signed in successfully!",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      message: "Successfully logged out!",
    });
  } catch (error) {
    next(error);
  }
};

export const getJwtUser = async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");

    res.status(200).json({ 
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
