import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import Subscriptions from "@/app/dashboard/subscriptions/page";

const mockSubscriptions = [
  {
    _id: "11c83b3batestb4be0b11e91",
    user: "6a60510cc3b6a3d358ec44fd",
    name: "Netflix test 1",
    price: 12,
    currency: "EUR",
    frequency: "monthly",
    category: "entertainment",
    paymentMethod: "Credit card",
    status: "active",
    startDate: "",
  },
];
