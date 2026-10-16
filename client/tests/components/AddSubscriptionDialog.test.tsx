import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddSubscriptionDialog from "@/components/AddSubscriptionDialog";

const { mockAddSubscription } = vi.hoisted(() => ({
  mockAddSubscription: vi.fn(),
}));

// mock addSubscription
vi.mock("@/store/useSubscriptionsStore", () => ({
  useSubscriptionStore: (selector: any) =>
    selector({ addSubscription: mockAddSubscription }), // selector function -> will return only addSubscription function
}));

// mock test user and fetching the user
vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    user: {
      _id: "test-user-id",
    },
    fetchUser: vi.fn(),
  }),
}));

describe("AddSubscriptionDialog", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("Should open the add new subscription dialog when clicking button 'Add subscription'", async () => {
    // setup to imitate user actions
    const user = userEvent.setup();

    // mounts the required component in simulated env
    render(<AddSubscriptionDialog />);

    // get the button to initiate the action
    const openButton = screen.getByRole("button", {
      name: /add subscription/i,
    });

    // clicking the button to initiate the action
    await user.click(openButton);

    // dialog should be open
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // heading title should be add new subscription
    expect(
      screen.getByRole("heading", {
        name: /add new subscription/i,
      }),
    ).toBeInTheDocument();

    // label subscription name should be displayed
    expect(screen.getByLabelText(/subscription name:*/i)).toBeInTheDocument();

    // price label should be displayed
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
  });

  it("Should close the dialog when clicking", async () => {
    const user = userEvent.setup();

    render(<AddSubscriptionDialog />);

    const openButton = screen.getByRole("button", {
      name: /add subscription/i,
    });

    await user.click(openButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const closeButton = screen.getByRole("button", {
      name: /cancel/i,
    });

    await user.click(closeButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Should send the correct subscription data to the backend", async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          subscription: {
            _id: "sub-123",
            name: "Netflix test sub",
          },
        },
      }),
    });

    // will mock the fetch with the respective subscription
    vi.stubGlobal("fetch", mockFetch);

    render(<AddSubscriptionDialog />);

    await user.click(
      screen.getByRole("button", {
        name: /add subscription/i,
      }),
    );

    await user.clear(screen.getByLabelText(/subscription name/i));
    await user.type(
      screen.getByLabelText(/subscription name/i),
      "Netflix test sub",
    );

    await user.type(screen.getByLabelText(/price/i), "12");

    const subscriptionDialog = screen.getByRole("dialog");
    await user.click(
      within(subscriptionDialog).getByRole("button", {
        name: /create subscription/i,
      }),
    );

    // wait until the mocked fetch is done
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // destructurate the url and the options from the mocked call (first)
    const [url, options] = mockFetch.mock.calls[0];

    expect(url).toBe(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/subscriptions`,
    );
    expect(options.method).toBe("POST");
    expect(options.credentials).toBe("include");
    expect(options.headers).toStrictEqual({
      "Content-Type": "application/json",
    });

    const body = JSON.parse(options.body);
    expect(body).toMatchObject({
      name: "Netflix test sub",
      price: "12",
      status: "active",
      paymentMethod: "Credit card",
      currency: "EUR",
      frequency: "weekly",
    });
  });
});
