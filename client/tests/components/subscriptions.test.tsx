import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import Subscriptions from "@/app/dashboard/subscriptions/page";

const mockSubscriptions = [
  {
    _id: "sub-1",
    name: "Netflix",
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
    name: "Spotify",
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

// Here the store is mocked to contain the given test subscriptions
vi.mock("@/store/useSubscriptionsStore", () => ({
  useSubscriptionStore: () => ({
    subscriptions: mockSubscriptions,
    setSubscriptions: vi.fn(),
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

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("Subscriptions-frontend", () => {
  it("Should render given subscriptions cards with data", async () => {
    const mockFetch = vi.fn().mockReturnValue(new Promise(() => {}));

    vi.stubGlobal("fetch", mockFetch);

    render(<Subscriptions />);

    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("Spotify")).toBeInTheDocument();

    expect(screen.getByText("€12")).toBeInTheDocument();
    expect(screen.getByText("€8")).toBeInTheDocument();

    expect(
      screen.getByText("Total subscriptions").parentElement,
    ).toHaveTextContent("2");
  });
});
