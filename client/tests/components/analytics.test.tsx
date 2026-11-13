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

const { mockRouterPush, mockFetchUser, mockSetAllSubs, mockToastError } =
  vi.hoisted(() => ({
    mockRouterPush: vi.fn(),
    mockFetchUser: vi.fn(),
    mockToastError: vi.fn(),
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

vi.mock("sonner", () => ({
  toast: {
    error: mockToastError,
  },
}));

vi.mock("recharts", () => ({
  BarChart: ({ children, data }: any) => (
    <div data-testid="bar-chart" data-chart={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
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

  it("Should fetch all subscriptions", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };
    mockLoading = false;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSubscriptions,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Analytics />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/subscriptions/analytics"),
        expect.objectContaining({ credentials: "include" }),
      );
    });

    await waitFor(() => {
      expect(mockSetAllSubs).toHaveBeenCalledWith(mockSubscriptions);
    });
  });

  it("Should display spending by categories", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };
    mockLoading = false;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSubscriptions,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Analytics />);

    const entertainmentCategory = screen
      .getByText("entertainment")
      .closest(".space-y-1") as HTMLElement | null;

    expect(
      within(entertainmentCategory!).getByText(
        `$${mockSubscriptions[0].price.toFixed(1)}`,
      ),
    ).toBeInTheDocument();

    const technologyCategory = screen
      .getByText("technology")
      .closest(".space-y-1") as HTMLElement | null;

    expect(
      within(technologyCategory!).getByText(
        `$${mockSubscriptions[1].price.toFixed(1)}`,
      ),
    ).toBeInTheDocument();

    const financeCategory = screen
      .getByText("finance")
      .closest(".space-y-1") as HTMLElement | null;
    expect(within(financeCategory!).getByText("$0.0")).toBeInTheDocument();
  });

  it("Should display correct data in the spending trend chart (by months)", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };
    mockLoading = false;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSubscriptions,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Analytics />);

    // Tied to mocked recharts into bar charts
    const chart = await screen.findByTestId("bar-chart");

    const chartData = JSON.parse(chart.getAttribute("data-chart")!);

    expect(chartData).toHaveLength(6);

    const expectedTotal = mockSubscriptions.reduce(
      (sum, sub) => sum + +sub.price,
      0,
    );

    const subscriptionMonth = new Date(
      mockSubscriptions[0].renewalDate,
    ).toLocaleString("en-US", { month: "short", timeZone: "UTC" });

    const matchingMonth = chartData.find(
      (month: any) => month.month === subscriptionMonth,
    );

    expect(matchingMonth).toBeDefined();
    expect(matchingMonth.total).toBe(expectedTotal);
  });

  it("Should display correct 'Year over year' spending data", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };
    mockLoading = false;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSubscriptions,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Analytics />);

    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const yearOverYear = screen
      .getByText("Year Over Year")
      .closest('[data-slot="card"]') as HTMLElement;

    expect(
      within(yearOverYear).getByText(`${previousYear} Total`),
    ).toBeInTheDocument();

    expect(
      within(yearOverYear).getByText(`${currentYear} YTD`),
    ).toBeInTheDocument();

    expect(
      within(yearOverYear).getByText("Projected " + currentYear),
    ).toBeInTheDocument();

    expect(within(yearOverYear).getByText("$20.00")).toBeInTheDocument();

    expect(within(yearOverYear).getAllByText("$0.00")).toHaveLength(2);
  });

  it("Should not update the analytics data when the response fails", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };
    mockLoading = false;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        data: [],
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Analytics />);

    await waitFor(() => {
      expect(mockSetAllSubs).not.toHaveBeenCalled();
    });
  });

  it("Should handle server errors while fetching the subscriptions", async () => {
    mockUser = { _id: "test-user-id", name: "testUser" };
    mockLoading = false;

    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));

    vi.stubGlobal("fetch", mockFetch);

    render(<Analytics />);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
        expect.any(Object),
      );
    });
  });
});
