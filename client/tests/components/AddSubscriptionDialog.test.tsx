import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
