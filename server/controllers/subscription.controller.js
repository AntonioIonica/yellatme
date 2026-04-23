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
    res
      .status(201)
      .json({ success: true, data: { subscription, workflowRunId } });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  const subscriptionId = req.params.id;

  const updates = {};
  const allowedUpdates = [
    "name",
    "description",
    "price",
    "currency",
    "frequency",
    "category",
    "paymentMethod",
    "status",
    "renewalDate",
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  try {
    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      {
        $set: updates,
      },
      { new: true, runValidators: true },
    );
    if (!subscription) {
      const error = new Error("There is no subscription with given ID");
      error.statusCode = 404;
      throw error;
    }

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

    res.status(201).json({
      success: true,
      message: "Successfully updated the subscription details!",
      data: { subscription, workflowRunId },
    });
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

// Get all user subscriptions
export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if user is trying to fetch his own subs (token: user id)
    // _id.toString() because here is an ObjectId
    const { search, category, status, from, to, sortDir = "asc" } = req.query;

    if (req.params.id !== req.user._id.toString()) {
      const error = new Error("Not authorized!");
      error.statusCode = 401;
      throw error;
    }

    const filterOptions = { user: req.params.id };

    let sortOptions = {};
    sortOptions = { renewalDate: sortDir == "asc" ? 1 : -1 };

    if (search) {
      filterOptions.name = { $regex: search, $options: "i" };
    }

    if (status) {
      filterOptions.status = status;
    }

    if (from && to) {
      filterOptions.renewalDate = { $lte: to, $gte: from };
    }

    if (category) {
      filterOptions.category = { $in: category.split(",") };
    }

    const subscriptions = await Subscription.find(filterOptions)
      .sort(sortOptions)
      .limit(12);

    res.status(200).json({
      success: true,
      data: subscriptions.map((sub) => ({
        ...sub.toObject(),
        id: sub._id.toString(),
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  const subscriptionId = req.params.id;
  try {
    if (!subscriptionId) {
      const error = new Error("Subscription ID not sent");
      error.statusCode = 404;
      throw error;
    }

    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      {
        $set: {
          status: "cancelled",
        },
      },
      { returnDocument: "after" },
    );
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: `Subscription ID - ${subscriptionId} cancelled!`,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};
