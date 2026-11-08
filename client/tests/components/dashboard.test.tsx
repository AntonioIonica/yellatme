import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  getByText,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
    mockUser = null;
    mockLoading = false;

    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/login");
    });
  });

  it("Should return all subscriptions when logged in", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSubscriptions,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/subscriptions/analytics"),
        expect.objectContaining({ credentials: "include" }),
      );
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/subscriptions/upcoming-renewals"),
        expect.objectContaining({ credentials: "include" }),
      );
    });

    await waitFor(() => {
      expect(mockSetAllSubs).toHaveBeenCalledWith(mockSubscriptions);
    });

    await waitFor(() => {
      expect(screen.getByText("Netflix test")).toBeInTheDocument();
    });
  });

  it("Should display monthly spend correctly", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSubscriptions,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<DashboardPage />);

    const heading = screen.getByText("Monthly spend");
    const card = heading.parentElement?.parentElement;

    expect(card).not.toBeNull();

    expect(within(card!).getByText("$20.00")).toBeInTheDocument();
  });

  it("Should display active subscriptions numbers correctly", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSubscriptions,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<DashboardPage />);

    const heading = screen.getByText("Active subscriptions");
    const card = heading.parentElement?.parentElement;

    expect(card).not.toBeNull();

    expect(within(card!).getByText("2")).toBeInTheDocument();
  });
});
