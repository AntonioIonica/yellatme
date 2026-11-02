import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import Login from "@/app/login/page";
import userEvent from "@testing-library/user-event";

const { mockRouterPush, mockToastSuccess, mockRouterRefresh } = vi.hoisted(
  () => ({
    mockRouterPush: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockRouterRefresh: vi.fn(),
  }),
);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    refresh: mockRouterRefresh,
  }),
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    fetchUser: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: mockToastSuccess,
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
        message: "Login successfull",
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

    user.type(screen.getByLabelText(/email/i), "antonioiulianionica@gmail.com");
    user.type(screen.getByLabelText(/password/i), "qweasdzxc");

    user.click(screen.getByRole("button", { name: /submit/i }));

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
});
