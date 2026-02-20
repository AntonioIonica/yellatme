import User from "../models/user.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

export const getUsers = async (req, res, next) => {
  // Available only to admin roles
  try {
    // Fetch all users
    const users = await User.find();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    // Get the user id by query params and getting all the fields excepting the password
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  // Available only to admin roles

  // Atomic operations constraint
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

    // Will create a list (and return a list) of users
    // Session is attached so can be intrerrupted in case of any issues (atomic operation)
    const newUsers = await User.create(
      [{ name, email, password: hashPassword, role: "user" }],
      { session },
    );

    // Commit everything and then close the connection
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "User created successfully!",
      data: newUsers[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (req.user._id !== user._id) {
      const error = new Error("Not authorized to update another user info!");
      error.statusCode = 401;
      throw error;
    }

    const { name, password } = req.body;
    if (name.length() < 4) {
      const error = new Error("The name you introduced is too small!");
      error.statusCode = 401;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
      name,
      password: hashPassword,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "User updated successfully!",
        data: updatedUser,
      });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {};
