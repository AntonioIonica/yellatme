import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription name is required!"],
      trim: true,
      minLength: 3,
      maxLength: 100,
    },
    description: {
      type: String,
      required: false,
      minLength: 3,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: [true, "Please set a subscription price!"],
      min: [0, "Price must be greater than 0!"],
    },
    currency: {
      type: String,
      enum: ["EUR", "USD", "GBP", "LEI"],
      default: "EUR",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
    },
    category: {
      type: String,
      enum: [
        "technology",
        "auto",
        "lifestyle",
        "entertainment",
        "finance",
        "house",
        "work",
        "garden",
        "tools",
        "other",
      ],
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        // Checks the condition to return true, otherwise throw the belowe message
        validator: function (value) {
          // previous of today
          return value <= new Date();
        },
        // If validator returns false, append the below message
        message: "Start date must be in the past!",
      },
    },
    renewalDate: {
      type: Date,
      validate: {
        // Check the condition to return true, otherwise throw the below message
        validator: function (value) {
          // further than the starting date
          return value > this.startDate;
        },
        // If validator returns false, append the below message
        message: "Renewal date must be in the future!",
      },
    },
    user: {
      // Accepts the id which will refer to User (model) and access the whole user document
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Autocalculate renewal date if not specified
// Running before creating the document (acts as a middleware)
subscriptionSchema.pre("save", function () {
  if (!this.renewalDate) {
    const renewalPeriods = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };

    // "this" of this actual document (eg. renewalDate, startDate, frequency)
    // creates date based on startDate to calculate based on it
    this.renewalDate = new Date(this.startDate);
    // based on startDate, add the days determined by frequency
    this.renewalDate.setDate(
      this.renewalDate.getDate() + renewalPeriods[this.frequency],
    );
  }

  // Auto-updates the status if the renewal date is in the past (today)
  if (this.renewalDay < new Date()) {
    this.status = "expired";
  }

  // next() has been deprecated in newer versions of mongoDB
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
