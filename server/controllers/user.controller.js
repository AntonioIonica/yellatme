import User from "../models/user.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { stripe } from "../config/stripe.js";

// Admins only
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
// Admins only

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

    if (req.user.id !== req.params.id) {
      const error = new Error("Not authorized to update another user info!");
      error.statusCode = 401;
      throw error;
    }

    const { name, password } = req.body;
    if (name.length < 3) {
      const error = new Error("The name should have more than 3 characters!");
      error.statusCode = 401;
      throw error;
    }

    if (password.length < 6) {
      const error = new Error(
        "The password should have more than 6 characters!",
      );
      error.statusCode = 401;
      throw error;
    }

    let updatedUser;
    let options;
    let hashPassword;
    const salt = await bcrypt.genSalt(10);

    if (password && user) {
      hashPassword = await bcrypt.hash(password, salt);
      options = { name, password: hashPassword };
    }
    if (password && !user) {
      hashPassword = await bcrypt.hash(password, salt);
      options = { password: hashPassword };
    }
    if (!password && user) {
      options = { name };
    }

    updatedUser = await User.findByIdAndUpdate(req.params.id, options);

    res.status(201).json({
      success: true,
      message: "User updated successfully!",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (req.user.id !== req.params.id) {
      const error = new Error("Not authorized to delete other users account!");
      error.statusCode = 401;
      throw error;
    }

    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("token");

    res.status(302).json({
      success: true,
      message: "Account successfully deleted!",
      signOut: true,
      redirect: "/login",
    });
  } catch (error) {
    next(error);
  }
};

export const changePlan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    const subscriptionId = user?.stripeSubscriptionId;

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (!subscriptionId) {
      const error = new Error("Stripe subscription not found");
      error.statusCode = 404;
      throw error;
    }

    if (req.user.id !== req.params.id) {
      const error = new Error("Not authorized to update other users account!");
      error.statusCode = 401;
      throw error;
    }

    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.status(201).json({
      success: true,
      message: "Successfully cancelled the PRO plan!",
    });
  } catch (error) {
    next(error);
  }
};
