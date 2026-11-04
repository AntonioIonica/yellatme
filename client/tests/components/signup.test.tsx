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

  it("Should successfully signup and redirect to login page", async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: "User created successfully!",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<SignUp />);

    await user.type(screen.getByLabelText(/name/i), "test-user");
    await user.type(screen.getByLabelText(/email/i), "test@gmail.com");
    await user.type(screen.getByLabelText("Password:"), "abcd1234");
    await user.type(screen.getByLabelText("Confirm password:"), "abcd1234");

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/auth/sign-up"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: "test-user",
            email: "test@gmail.com",
            password: "abcd1234",
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        expect.stringContaining("User created successfully!"),
        expect.any(Object),
      );
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.stringContaining("/login"),
      );
    });
  });

  it("Confirm password mismatch", async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({});

    vi.stubGlobal("fetch", mockFetch);

    render(<SignUp />);

    await user.type(screen.getByLabelText(/name/i), "test-user");
    await user.type(screen.getByLabelText(/email/i), "test@gmail.com");
    await user.type(screen.getByLabelText("Password:"), "abcd1234");
    await user.type(screen.getByLabelText("Confirm password:"), "abcd123455");

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringContaining("The passwords are not the same!"),
        expect.any(Object),
      );
    });

    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  it("Should receive an error when email already registered", async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 409,
      json: async () => ({
        success: false,
        error:
          "There is already an user created with this email. Please try a different email!",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<SignUp />);

    await user.type(screen.getByLabelText(/name/i), "test-user");
    await user.type(screen.getByLabelText(/email/i), "test@gmail.com");
    await user.type(screen.getByLabelText("Password:"), "abcd1234");
    await user.type(screen.getByLabelText("Confirm password:"), "abcd1234");

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringContaining(
          "There is already an user created with this email. Please try a different email!",
        ),
        expect.any(Object),
      );
    });

    await waitFor(() => {
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });
});
