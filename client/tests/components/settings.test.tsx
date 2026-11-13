import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import SettingsPage from "@/app/dashboard/settings/page";
import userEvent from "@testing-library/user-event";

const { mockRouterPush, mockFetchUser, mockToastError, mockToastSuccess } =
  vi.hoisted(() => ({
    mockRouterPush: vi.fn(),
    mockFetchUser: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

let mockUser = null as any;
let mockLoading = false;

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    fetchUser: mockFetchUser,
    loading: mockLoading,
    user: mockUser,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}));

describe("Settings page", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("Should render settings page correctly", async () => {
    mockUser = {
      _id: "test-user-id",
      name: "testUser",
      plan: "pro",
      subscriptionStatus: "active",
      freeTokens: 3,
      currentSubscriptionEnd: "2026-12-31",
    };

    render(<SettingsPage />);

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByLabelText("Name:")).toHaveValue(mockUser.name);
    expect(screen.getByLabelText("Password:")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("PRO plan")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getByText("$3/month, billed monthly")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /manage plan/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Danger zone")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete account/i }),
    ).toBeInTheDocument();
  });

  it("Should update user profile", async () => {
    mockUser = {
      _id: "test-user-id",
      name: "testUser",
      plan: "pro",
      subscriptionStatus: "active",
      currentSubscriptionEnd: "2026-12-31",
    };

    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: "User updated successfully",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<SettingsPage />);

    const nameInput = screen.getByLabelText("Name:");
    const passwordInput = screen.getByLabelText("Password:");

    await user.clear(nameInput);
    await user.clear(passwordInput);

    await user.type(nameInput, "newUserName");
    await user.type(passwordInput, "newPassword123");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/users/test-user-id"),
        expect.objectContaining({
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "newUserName",
            password: "newPassword123",
          }),
        }),
      );
    });

    expect(mockFetchUser).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith(
      "User updated successfully",
      expect.any(Object),
    );
  });

  it("Should display a toast error when updating profile fails", async () => {
    mockUser = {
      _id: "test-user-id",
      name: "testUser",
      plan: "pro",
      subscriptionStatus: "active",
      currentSubscriptionEnd: "2026-12-31",
    };

    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        error: "Failed to update user",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<SettingsPage />);

    const nameInput = screen.getByLabelText("Name:");
    await user.clear(nameInput);
    await user.type(nameInput, "newUserName");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Failed to update user",
        expect.any(Object),
      );
    });

    expect(mockFetchUser).toHaveBeenCalledTimes(1);
  });

  it("Should open the delete account confirmation dialog", async () => {
    mockUser = {
      _id: "test-user-id",
      name: "testUser",
      plan: "pro",
      subscriptionStatus: "active",
      currentSubscriptionEnd: "2026-12-31",
    };

    const user = userEvent.setup();

    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /delete account/i }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Are you sure you want to delete your account?"),
    ).toBeInTheDocument();

    expect(
      within(dialog).getByRole("button", { name: /delete account/i }),
    ).toBeInTheDocument();

    expect(
      within(dialog).getByRole("button", { name: /cancel/i }),
    ).toBeInTheDocument();
  });

  it("Should delete account successfully", async () => {
    mockUser = {
      _id: "test-user-id",
      name: "testUser",
      plan: "pro",
      subscriptionStatus: "active",
      currentSubscriptionEnd: "2026-12-31",
    };

    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: "Account deleted successfully",
        redirect: "/login",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: "Delete account" }));

    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Delete account" }),
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/users/test-user-id"),
        expect.objectContaining({
          method: "DELETE",
          credentials: "include",
        }),
      );
    });

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Account deleted successfully",
      expect.any(Object),
    );

    expect(mockRouterPush).toHaveBeenCalledWith("/login");
  });

  it("Should display an error when account deletion fails", async () => {
    mockUser = {
      _id: "test-user-id",
      name: "testUser",
      plan: "pro",
      subscriptionStatus: "active",
      currentSubscriptionEnd: "2026-12-31",
    };

    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        error: "Failed to delete account",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: "Delete account" }));

    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Delete account" }),
    );

    expect(mockToastError).toHaveBeenCalledWith(
      "Failed to delete account",
      expect.any(Object),
    );

    expect(mockRouterPush).not.toHaveBeenCalledWith();
  });

  it("Should display an error when account deletion fails due to network failure", async () => {
    mockUser = {
      _id: "test-user-id",
      name: "testUser",
      plan: "pro",
      subscriptionStatus: "active",
      currentSubscriptionEnd: "2026-12-31",
    };

    const user = userEvent.setup();

    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));

    vi.stubGlobal("fetch", mockFetch);

    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: "Delete account" }));

    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Delete account" }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
        expect.any(Object),
      );
    });

    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("Should open the manage plan dialog when pro plan user", async () => {
    mockUser = {
      _id: "test-user-id",
      name: "testUser",
      plan: "pro",
      subscriptionStatus: "active",
      currentSubscriptionEnd: "2026-12-31",
    };

    const user = userEvent.setup();

    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /manage plan/i }));
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("Switch to free plan")).toBeInTheDocument();

    expect(
      within(dialog).getByRole("button", { name: /confirm change/i }),
    ).toBeInTheDocument();

    expect(
      within(dialog).getByRole("button", { name: /cancel/i }),
    ).toBeInTheDocument();
  });

  it("Should redirect to Stripe pay when user is free and click manage plan", async () => {
    mockUser = {
      _id: "test-user-id",
      name: "testUser",
      plan: "free",
      subscriptionStatus: "expired",
      freeTokens: 0,
      currentSubscriptionEnd: null,
    };

    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        url: "https://checkout.stripe.com/test-session",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /manage plan/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/billing/checkout"),
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        }),
      );
    });

    await waitFor(
      () => {
        expect(mockRouterPush).toHaveBeenCalledWith(
          "https://checkout.stripe.com/test-session",
        );
      },
      { timeout: 1000 },
    );
  });

  it("Should change user from pro plan to free plan successfully", async () => {
    mockUser = {
      _id: "test-user-id",
      name: "testUser",
      plan: "pro",
      subscriptionStatus: "active",
      currentSubscriptionEnd: "2026-12-31",
    };

    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: "Plan changed successfully",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /manage plan/i }));

    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: /confirm change/i }),
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/users/test-user-id/change-plan"),
        expect.objectContaining({
          credentials: "include",
        }),
      );
    });

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Plan changed successfully",
      expect.any(Object),
    );

    expect(mockRouterPush).toHaveBeenCalledWith("/dashboard");
  });

  it("Should display an error when changing from pro to free plan fails", async () => {
    mockUser = {
      _id: "test-user-id",
      name: "testUser",
      plan: "pro",
      subscriptionStatus: "active",
      currentSubscriptionEnd: "2026-12-31",
    };

    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        error: "Failed to change plan",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /manage plan/i }));

    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: /confirm change/i }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Failed to change plan",
        expect.any(Object),
      );
    });

    expect(mockRouterPush).not.toHaveBeenCalledWith("/dashboard");
  });

  it("Should display an error when changing plans fails due to network failure", async () => {
    mockUser = {
      _id: "test-user-id",
      name: "testUser",
      plan: "pro",
      subscriptionStatus: "active",
      currentSubscriptionEnd: "2026-12-31",
    };

    const user = userEvent.setup();

    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));

    vi.stubGlobal("fetch", mockFetch);

    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /manage plan/i }));

    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: /confirm change/i }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
        expect.any(Object),
      );
    });

    expect(mockRouterPush).not.toHaveBeenCalledWith("/dashboard");
  });
});
