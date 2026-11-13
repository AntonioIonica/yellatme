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
    mockLoading = false;

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
    mockLoading = false;

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
    mockLoading = false;

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
});
