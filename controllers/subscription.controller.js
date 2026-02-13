import Subscription from "../models/subscription.model.js";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      // When login will save the user from mongoDB (user._id)
      // Authorization before creating the document
      // mongoDB model expects and ObjectId, that's why ._id and not .id
      user: req.user._id,
    });

    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if user is trying to fetch his own subs (token: user id)
    // _id.toString() because here is an ObjectId
    if (req.params.id !== req.user._id.toString()) {
      const error = new Error("Not authorized!");
      error.statusCode = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};
