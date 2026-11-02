import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import SignUp from "@/app/sign-up/page";
import userEvent from "@testing-library/user-event";

const { mockRouterPush, mockToastSuccess, mockToastError, mockFetchUser } =
  vi.hoisted(() => ({
    mockRouterPush: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
    mockFetchUser: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    fetchUser: mockFetchUser,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

describe("Login page", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("Render the signup form", async () => {
    render(<SignUp />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password:")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Do you already have an account?! Login here",
      }),
    ).toBeInTheDocument();
  });
});
