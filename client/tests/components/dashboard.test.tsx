import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";
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
    startDate: "2026-10-01",
    renewalDate: "2026-11-08",
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
    startDate: "2026-10-01",
    renewalDate: "2026-11-08",
  },
];

const {
  mockRouterPush,
  mockFetchUser,
  mockSetSubscriptions,
  mockEditSubscription,
  mockDeleteSubscription,
  mockSetAllSubs,
  mockUser,
  mockLoading,
} = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
  mockFetchUser: vi.fn(),
  mockSetSubscriptions: vi.fn(),
  mockEditSubscription: vi.fn(),
  mockDeleteSubscription: vi.fn(),
  mockSetAllSubs: vi.fn(),
  mockUser: null as any,
  mockLoading: false,
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
    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/login");
    });
  });
});
