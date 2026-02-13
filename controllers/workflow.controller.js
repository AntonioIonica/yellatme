// To be able to use require in modules ESM6
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");

import Subscription from "../models/subscription.model.js";
import dayjs from "dayjs";

const REMINDERS = [7, 5, 3, 1];

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;

  //   Helper function to get the subscription by id
  const subscription = await fetchSubscription(context, subscriptionId);

  //   Kill the workflow when there is no subscription || not active
  if (!subscription || subscription.status !== "active") return;

  // format the date to be computed easier
  const renewalDate = dayjs(subscription.renewalDate);

  // Kills the workflow when the renewal date has passed the current date
  // dayjs() returns current date
  if (renewalDate.isBefore(dayjs())) {
    console.log(
      `The renewal date has passed for the subscription: ${subscriptionId}`,
    );
    return;
  }

  //   set reminders for each day
  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, "day");

    // Check for reminder date to be in the future
    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(
        context,
        `Reminder ${daysBefore} days before`,
        reminderDate,
      );
    }

    // run the workflow when the reminder date is today
    await triggerReminder(context, `Reminder ${daysBefore} days before`);
  }
});

// HELPER FUNCTIONS

// fetching the Subscription by id when the context "get subscription" is called
const fetchSubscription = async (context, subscriptionId) => {
  // "get subscription" name
  return await context.run("get subscription", async () => {
    return await Subscription.findById(subscriptionId).populate(
      "user",
      "name email",
    );
  });
};

// Pause the context for the specific label, until reminder date and then let the content run
const sleepUntilReminder = async (context, label, date) => {
  console.log(`Sleeping until ${label} reminder at ${date}`);

  await context.sleepUntil(label, date.toDate());
};

// Trigger the reminder for the given label
const triggerReminder = async (context, label) => {
  return await context.run(label, () => {
    console.log(`Triggering ${label} reminder.`);

    // email notification for the reminders
  });
};
