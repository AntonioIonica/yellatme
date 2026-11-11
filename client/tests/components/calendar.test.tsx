import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import Calendar from "@/app/dashboard/calendar/page";
import userEvent from "@testing-library/user-event";

let mockSubscriptions = [
  {
    _id: "sub-1",
    user: "test-user-id",
    name: "Netflix test",
    description: "Movies and TV shows",
    price: 12,
    currency: "EUR",
    frequency: "weekly",
    category: "entertainment",
    paymentMethod: "Credit card",
    status: "active",
    startDate: "2026-11-19",
    renewalDate: "2026-11-26",
  },
  {
    _id: "sub-2",
    user: "test-user-id",
    name: "Spotify test",
    description: "Music streaming",
    price: 8,
    currency: "EUR",
    frequency: "weekly",
    category: "technology",
    paymentMethod: "Credit card",
    status: "active",
    startDate: "2026-11-19",
    renewalDate: "2026-11-26",
  },
];

const mockUpcomingRenewals = [
  {
    ...mockSubscriptions[0],
    renewalDate: "2026-11-16",
    status: "active",
  },
  {
    ...mockSubscriptions[1],
    renewalDate: "2026-12-08",
    status: "active",
  },
];

let mockUser = null as any;
let mockLoading = false;

const {
  mockRouterPush,
  mockFetchUser,
  mockSetSubscriptions,
  mockEditSubscription,
  mockDeleteSubscription,
  mockSetAllSubs,
} = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
  mockFetchUser: vi.fn(),
  mockSetSubscriptions: vi.fn(),
  mockEditSubscription: vi.fn(),
  mockDeleteSubscription: vi.fn(),
  mockSetAllSubs: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    fetchUser: mockFetchUser,
    user: mockUser,
    loading: mockLoading,
  }),
}));

vi.mock("@/store/useSubscriptionsStore", () => ({
  useSubscriptionStore: () => ({
    subscriptions: mockSubscriptions,
    setSubscriptions: mockSetSubscriptions,
    editSubscription: mockEditSubscription,
    deleteSubscription: mockDeleteSubscription,
    allSubs: mockSubscriptions,
    setAllSubs: mockSetAllSubs,
  }),
}));

describe("Dashboard page", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("Should render the calendar correctly", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };
    mockLoading = false;

    render(<Calendar />);

    const now = new Date();

    // needing only month out of it - string wise
    const monthName = now.toLocaleString("default", { month: "long" });

    expect(
      screen.getByText(`${monthName} - ${now.getFullYear()}`),
    ).toBeInTheDocument();

    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });

    // Navigation button
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("Should display active subscriptions on their renewal dates", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };
    mockLoading = false;

    // 15 of current month and year
    const renewalDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      15,
    );

    const mockDateSubscriptions = [
      {
        ...mockSubscriptions[0],
        status: "active",
        renewalDate: renewalDate.toISOString(),
      },
      {
        ...mockSubscriptions[1],
        name: "inactive subscription",
        status: "cancelled",
        renewalDate: renewalDate.toDateString(),
      },
    ];

    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/v1/subscriptions/analytics")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: [],
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: mockDateSubscriptions,
        }),
      });
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Calendar />);

    // Active subscription should be present
    expect(await screen.findByText("Netflix test")).toBeInTheDocument();

    // Cancelled subscription should not be present
    expect(screen.queryByText("Inactive subscription")).not.toBeInTheDocument();
  });

  it("Should navigate between months", async () => {
    const user = userEvent.setup();

    mockUser = { _id: "test-user-id", name: "TestUser" };
    mockLoading = false;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    render(<Calendar />);

    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1);

    const buttons = screen.getAllByRole("button");

    // Next month should be the second button
    await user.click(buttons[1]);
    expect(
      screen.getByText(
        `${nextMonth.toLocaleString("default", { month: "long" })} - ${nextMonth.getFullYear()}`,
      ),
    ).toBeInTheDocument();

    await user.click(buttons[0]);
    expect(
      screen.getByText(
        `${now.toLocaleString("default", { month: "long" })} - ${now.getFullYear()}`,
      ),
    ).toBeInTheDocument();

    await user.click(buttons[0]);
    expect(
      screen.getByText(
        `${prevMonth.toLocaleString("default", { month: "long" })} - ${prevMonth.getFullYear()}`,
      ),
    ).toBeInTheDocument();
  });
});
