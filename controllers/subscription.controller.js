import { workflowClient } from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";
import { SERVER_URL } from "../config/env.js";

export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find();

    if (!subscriptions) {
      const error = new Error("No subscriptions available!");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Subscriptions successfully retrieved!",
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingRenewals = async (req, res, next) => {
  try {
    // req.user._id because mongo need an ObjectId, not a plain id
    const upcomingSubscriptions = await Subscription.find({
      user: req.user._id,
      renewalDate: { $gte: new Date() },
    }).sort({ renewalDate: 1 });

    if (!upcomingSubscriptions) {
      const error = new Error("There are no upcoming renewals!");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Successfully retrieved upcoming subscription renewals!",
      data: upcomingSubscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscription = async (req, res, next) => {
  const subscriptionId = req.params.id;

  try {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      const error = new Error("Subscription not found!");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: `Subscription ID: ${subscriptionId} successfully retrieved!`,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      // When login will save the user from mongoDB (user._id)
      // Authorization before creating the document
      // mongoDB model expects and ObjectId, that's why ._id and not .id
      user: req.user._id,
    });

    // run in the CLI 'npx @upstash/qstash-cli dev' to get the dev token, signing keys
    // here the workflow is created
    const { workflowRunId } = await workflowClient.trigger({
      // Will hit the endpoint when a new subscription is created
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    // Attach the subscription created and the tied workflow id to it
    res.status(201).json({ success: true, data: subscription, workflowRunId });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  const subscriptionId = req.params.id;

  try {
    await Subscription.findByIdAndDelete(subscriptionId);

    res.status(204).json({
      success: true,
      message: `Successfully deleted subscription ID - ${subscriptionId}`,
    });
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

export const cancelSubscription = async (req, res, next) => {
  const subscriptionId = req.params.id;
  try {
    const subscription = await Subscription.findByIdAndUpdate(subscriptionId, {
      status: "cancelled",
    });
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json({
        success: true,
        message: `Subscription ID - ${subscriptionId} cancelled!`,
        data: subscription,
      });
  } catch (error) {
    next(error);
  }
};
