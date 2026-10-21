import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import Subscriptions from "@/app/dashboard/subscriptions/page";
import userEvent from "@testing-library/user-event";
import { Url } from "next/dist/shared/lib/router/router";

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
const {
  mockSetSubscriptions,
  mockEditSubscription,
  mockDeleteSubscription,
  mockToastError,
  mockToastSuccess,
} = vi.hoisted(() => ({
  mockSetSubscriptions: vi.fn(),
  mockEditSubscription: vi.fn(),
  mockDeleteSubscription: vi.fn(),
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
}));

// Here the store is mocked to contain the given test subscriptions
vi.mock("@/store/useSubscriptionsStore", () => ({
  useSubscriptionStore: () => ({
    subscriptions: mockSubscriptions,
    setSubscriptions: mockSetSubscriptions,
    addSubscription: vi.fn(),
    editSubscription: mockEditSubscription,
    deleteSubscription: mockDeleteSubscription,
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

vi.mock("sonner", () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
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

  it("should fetch the server matching the status filter", async () => {
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
        name: /status/i,
      }),
    );

    await user.click(await screen.findByRole("menuitem", { name: "Expired" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("status=expired"),
        expect.objectContaining({ credentials: "include" }),
      );
    });
  });

  it("Should fetch the server subscriptions using the sorting filter order", async () => {
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

    await user.click(screen.getByRole("button", { name: /sort/i }));

    await user.click(await screen.findByRole("menuitem", { name: "Asc" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("sortDir=asc"),
        expect.objectContaining({ credentials: "include" }),
      );
    });

    // Clearing the fetch calls
    mockFetch.mockClear();

    await user.click(screen.getByRole("button", { name: /sort/i }));

    await user.click(await screen.findByRole("menuitem", { name: "Desc" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("sortDir=desc"),
        expect.objectContaining({
          credentials: "include",
        }),
      );
    });
  });

  it("Should delete a subscription while updating zustand store", async () => {
    const user = userEvent.setup();

    // building the fake call (delete)
    // mockImplementation is used to not interfere with getting the initial mocked subscriptions
    const mockFetch = vi.fn().mockImplementation((_url: Url, options: any) => {
      if (options?.method === "DELETE") {
        // returned option
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            message: "Successfully deleted subscription.",
          }),
        });
      }

      // Empty object - do nothing
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: mockSubscriptions,
        }),
      });
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Subscriptions />);

    const netflixCard = screen
      .getByText("Netflix test")
      .closest("[data-slot='card']");

    expect(netflixCard).not.toBeNull();

    const menuButton = within(netflixCard as HTMLElement).getByRole("button");

    await user.click(menuButton);

    // findByRole awaits for the delete button to appears if not present instantly
    await user.click(await screen.findByRole("menuitem", { name: /delete/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/subscriptions/sub-1"),
        expect.objectContaining({
          method: "DELETE",
          credentials: "include",
        }),
      );
    });

    // zustand update
    await waitFor(() => {
      expect(mockDeleteSubscription).toHaveBeenCalledWith("sub-1");
    });

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Successfully deleted subscription.",
      expect.any(Object),
    );
  });

  it("Should cancel an active subscription and update zustand store", async () => {
    const user = userEvent.setup();

    const cancelledSubscription = {
      ...mockSubscriptions[0],
      status: "cancelled",
    };

    const mockFetch = vi.fn().mockImplementation((_url: Url, options: any) => {
      if (options?.method === "PATCH") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            message: "Subscription cancelled successfully.",
            data: cancelledSubscription,
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: mockSubscriptions,
        }),
      });
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Subscriptions />);

    const netflixCard = screen
      .getByText("Netflix test")
      .closest("[data-slot='card']");

    expect(netflixCard).not.toBeNull();

    await user.click(within(netflixCard as HTMLElement).getByRole("button"));

    await user.click(
      await screen.findByRole("menuitem", {
        name: /^cancel$/i,
      }),
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/subscriptions/sub-1/cancel"),
        expect.objectContaining({
          method: "PATCH",
          credentials: "include",
        }),
      );
    });

    await waitFor(() => {
      expect(mockEditSubscription).toHaveBeenCalledWith(cancelledSubscription);
    });

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Subscription cancelled successfully.",
      expect.any(Object),
    );
  });

  it("should edit a subscription and update Zustand", async () => {
    const user = userEvent.setup();

    const updatedSubscription = {
      ...mockSubscriptions[0],
      name: "Netflix Premium",
    };

    const mockFetch = vi.fn().mockImplementation((_url, options) => {
      if (options?.method === "PATCH") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            message: "Subscription updated successfully",
            data: {
              subscription: updatedSubscription,
            },
          }),
        });
      }

      // Initial GET request
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: mockSubscriptions,
        }),
      });
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Subscriptions />);

    // Find Netflix's card
    const netflixCard = screen
      .getByText("Netflix test")
      .closest("[data-slot='card']");

    expect(netflixCard).not.toBeNull();

    // Open the three-dot menu
    await user.click(within(netflixCard as HTMLElement).getByRole("button"));

    // Select Edit
    await user.click(
      await screen.findByRole("menuitem", {
        name: /^edit$/i,
      }),
    );

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="dialog-content"]'),
      ).not.toBeNull();
    });

    console.log(
      "Dialog count:",
      document.querySelectorAll('[data-slot="dialog-content"]').length,
    );

    console.log(
      "Dialog aria-hidden values:",
      Array.from(document.querySelectorAll('[data-slot="dialog-content"]')).map(
        (el) => el.getAttribute("aria-hidden"),
      ),
    );

    const dialog = document.querySelector('[data-slot="dialog-content"]');

    screen.debug(dialog ?? document.body);

    expect(dialog).not.toBeNull();

    if (!(dialog instanceof HTMLElement)) {
      throw new Error("Dialog content was not found or is not an HTMLElement");
    }

    expect(
      within(dialog).getByRole("heading", {
        name: "Edit subscription",
        hidden: true,
      }),
    ).toBeInTheDocument();

    // Find the name input
    const nameInput = within(dialog).getByRole("textbox", {
      name: /subscription name/i,
      hidden: true,
    });

    // Verify the existing value
    expect(nameInput).toHaveValue("Netflix test");

    // Change the name
    await user.clear(nameInput);
    await user.type(nameInput, "Netflix Premium");

    expect(nameInput).toHaveValue("Netflix Premium");

    // Submit the edit form
    await user.click(
      within(dialog).getByRole("button", {
        name: "Edit subscription",
      }),
    );

    // Verify the PATCH request contains the updated name
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/subscriptions/sub-1"),
        expect.objectContaining({
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.any(String),
        }),
      );
    });

    // Inspect the submitted JSON
    const patchCall = mockFetch.mock.calls.find(
      ([, options]) => options?.method === "PATCH",
    );

    expect(patchCall).toBeDefined();

    const requestBody = JSON.parse(patchCall![1].body);

    expect(requestBody.name).toBe("Netflix Premium");

    // Verify Zustand received the updated subscription
    await waitFor(() => {
      expect(mockEditSubscription).toHaveBeenCalledWith(updatedSubscription);
    });

    // Verify the success toast
    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Subscription updated successfully",
      expect.any(Object),
    );

    // Verify the dialog closes
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
