import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
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

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockDateSubscriptions,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Calendar />);

    // Active subscription should be present
    const dayCell = screen
      .getByText("15", { selector: ".text-muted-foreground" })
      .closest(".min-h-24") as HTMLElement | null;

    expect(dayCell).not.toBeNull();

    expect(
      await within(dayCell!).findByText(mockSubscriptions[0].name),
    ).toBeInTheDocument();

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

    vi.stubGlobal("fetch", mockFetch);

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

  it("Should calculate the total cost of current month subscriptions", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };
    mockLoading = false;

    const renewalDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDay() + 6,
    );

    const mockDateSubscriptions = [
      {
        ...mockSubscriptions[0],
        renewalDate: renewalDate.toISOString(),
        status: "active",
      },
      {
        ...mockSubscriptions[1],
        renewalDate: renewalDate.toDateString(),
        status: "active",
      },
    ];

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockDateSubscriptions,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Calendar />);

    expect(
      await screen.findByText(
        `$${mockDateSubscriptions.reduce((sum, curr) => sum + curr.price, 0).toFixed(2)} in payments`,
      ),
    ).toBeInTheDocument();
  });

  it("Should display subscriptions due this week", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };
    mockLoading = false;

    const mockUpcomingSubscriptions = [
      {
        ...mockSubscriptions[0],
        renewalDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate() + 2,
        ).toISOString(),
      },
    ];

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockUpcomingSubscriptions,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Calendar />);

    const weekCard = screen
      .getByText("This week")
      .closest(".border-border") as HTMLElement | null;

    expect(weekCard).not.toBeNull();

    expect(
      await within(weekCard!).findByText("Netflix test"),
    ).toBeInTheDocument();
  });

  it("Should display subscriptions due this week", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };
    mockLoading = false;

    const mockUpcomingSubscriptions = [
      {
        ...mockSubscriptions[0],
        renewalDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate() + 12, // might fail if it passed half the month
        ).toISOString(),
      },
    ];

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockUpcomingSubscriptions,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Calendar />);

    const monthlyCard = screen
      .getByText("Later this month")
      .closest(".border-border") as HTMLElement | null;

    expect(monthlyCard).not.toBeNull();

    expect(
      await within(monthlyCard!).findByText("Netflix test"),
    ).toBeInTheDocument();
  });
});
