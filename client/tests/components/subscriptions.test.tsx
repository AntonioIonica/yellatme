import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

import Subscriptions from "@/app/dashboard/subscriptions/page";
import userEvent from "@testing-library/user-event";

const mockSubscriptions = [
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

// Hoisted setSubscriptions
const { mockSetSubscriptions } = vi.hoisted(() => ({
  mockSetSubscriptions: vi.fn(),
}));

// Here the store is mocked to contain the given test subscriptions
vi.mock("@/store/useSubscriptionsStore", () => ({
  useSubscriptionStore: () => ({
    subscriptions: mockSubscriptions,
    setSubscriptions: mockSetSubscriptions,
    addSubscriptions: vi.fn(),
    editSubscriptions: vi.fn(),
    deleteSubscriptions: vi.fn(),
  }),
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    user: { _id: "test-user-id", email: "test@example.com" },
    loading: false,
    fetchUser: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("Subscriptions-frontend", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("Should render given subscriptions cards with data", async () => {
    // To not fetching actual subscriptions
    const mockFetch = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal("fetch", mockFetch);

    render(<Subscriptions />);

    expect(screen.getByText("Netflix test")).toBeInTheDocument();
    expect(screen.getByText("Spotify test")).toBeInTheDocument();

    expect(screen.getByText("€12")).toBeInTheDocument();
    expect(screen.getByText("€8")).toBeInTheDocument();

    // parentElement marks the element as a parent of the expected text
    expect(
      screen.getByText("Total subscriptions").parentElement,
    ).toHaveTextContent("2");
  });

  it("Should fetch user subscriptions and update the zustand sub store", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSubscriptions[0],
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Subscriptions />);

    // Checks if the fetch object calls the right URL and settings
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `/api/v1/subscriptions/user/${mockSubscriptions[0].user}`,
        ),
        expect.objectContaining({
          credentials: "include",
        }),
      );
    });

    // Checks if the zustand store is updated with the subscriptions
    await waitFor(() => {
      expect(mockSetSubscriptions).toHaveBeenCalledWith(mockSubscriptions[0]);
    });
  });

  it("Should fetch the server matching the search feature query", async () => {
    const subscriptionName = "Netflix";
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Subscriptions />);

    const searchInput = screen.getByPlaceholderText("Search subscriptions...");

    await user.type(searchInput, subscriptionName);

    await waitFor(
      () => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`search=${subscriptionName}`),
          expect.objectContaining({
            credentials: "include",
          }),
        );
      },
      { timeout: 2000 },
    );
  });

  it("Should fetch the server matching the choosed filter", async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Subscriptions />);

    await user.click(
      screen.getByRole("button", {
        name: /category/i,
      }),
    );

    await user.click(
      await screen.findByRole("menuitem", {
        name: "Technology",
      }),
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("category=technology"),
        expect.objectContaining({
          credentials: "include",
        }),
      );
    });
  });
});
