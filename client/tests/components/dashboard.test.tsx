import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

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

const { mockRouterPush, mockFetchUser, mockSetAllSubs } = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
  mockFetchUser: vi.fn(),
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

  it("Should display yearly projection correctly", async () => {
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

    const heading = screen.getByText("Yearly projection");
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

  it("Should display upcoming subscriptons correctly", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };

    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/v1/subscriptions/analytics")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: mockSubscriptions,
          }),
        });
      }

      if (url.includes("/api/v1/subscriptions/upcoming-renewals")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: mockUpcomingRenewals,
          }),
        });
      }
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<DashboardPage />);

    expect(await screen.findByText("Netflix test")).toBeInTheDocument();

    expect(screen.getByText(`"Movies and TV shows"`)).toBeInTheDocument();
  });
});
