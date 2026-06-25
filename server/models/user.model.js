import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "The user name is required!"],
      trim: true,
      minLength: 3,
      maxLength: 50,
    },
    email: {
      type: String,
      required: [true, "The user email is required!"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address!"],
    },
    password: {
      type: String,
      required: [true, "The user password is required!"],
      minLength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    subscriptionStatus: {
      type: String,
      enum: ["active", "cancelled, expired"],
      default: null,
    },
    currentSubscriptionEnd: Date,
    freeTokens: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true },
);

// Starts with capital letter as to be used to instantiate a new document
// "User" as it will automatically create colletions by pluralizing and lowercase "users"
const User = mongoose.model("User", userSchema);

export default User;
