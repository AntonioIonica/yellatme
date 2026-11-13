import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import SettingsPage from "@/app/dashboard/settings/page";

const { mockRouterPush, mockFetchUser } = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
  mockFetchUser: vi.fn(),
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
});
