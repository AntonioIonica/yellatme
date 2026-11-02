import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import Login from "@/app/login/page";
import userEvent from "@testing-library/user-event";

const {
  mockRouterPush,
  mockToastSuccess,
  mockRouterRefresh,
  mockToastError,
  mockFetchUser,
} = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
  mockRouterRefresh: vi.fn(),
  mockFetchUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    refresh: mockRouterRefresh,
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

  it("Should render the login form", async () => {
    render(<Login />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Need an account?! Register here" }),
    ).toBeInTheDocument();
  });

  it("Should submit the typed credentials", async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: "Login successful",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), "test@gmail.com");

    await user.type(screen.getByLabelText(/password/i), "pass123");

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/auth/sign-in"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: "test@gmail.com",
            password: "pass123",
          }),
        }),
      );
    });
  });

  it("Should handle successful login", async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: "Login successful",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Login />);

    await user.type(
      screen.getByLabelText(/email/i),
      "antonioiulianionica@gmail.com",
    );
    await user.type(screen.getByLabelText(/password/i), "qweasdzxc");

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.stringContaining("/dashboard"),
      );

      expect(mockRouterRefresh).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        expect.stringContaining("Login successful"),
        expect.any(Object),
      );
    });
  });

  it("Should handle failed login", async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        error: "User not found!",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), "test@gmail.com");

    await user.type(screen.getByLabelText(/password/i), "pass123");

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringContaining("User not found!"),
        expect.any(Object),
      );
    });

    await waitFor(() => {
      expect(mockFetchUser).not.toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockRouterPush).not.toHaveBeenCalled();
      expect(mockRouterRefresh).not.toHaveBeenCalled();
    });
  });
});
