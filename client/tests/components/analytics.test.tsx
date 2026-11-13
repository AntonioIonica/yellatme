import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import Analytics from "@/app/dashboard/analytics/page";

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

  it("Should redirect unauthenticated users to login page", async () => {
    render(<Analytics />);

    expect(mockRouterPush).toHaveBeenCalledWith("/login");
  });

  it("Should render analytics page correctly", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };
    mockLoading = false;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Analytics />);

    expect(screen.getByText("This week")).toBeInTheDocument();
    expect(screen.getByText("This month")).toBeInTheDocument();
    expect(screen.getByText("Last 6 months")).toBeInTheDocument();
    expect(screen.getByText("Average monthly")).toBeInTheDocument();
    expect(screen.getByText("Spending Trend")).toBeInTheDocument();
    expect(screen.getByText("By Category")).toBeInTheDocument();
    expect(screen.getByText("Year Over Year")).toBeInTheDocument();
  });
});
