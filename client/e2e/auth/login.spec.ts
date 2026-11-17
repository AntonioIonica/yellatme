import { test, expect } from "@playwright/test";

test("Should successfully log in a user", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email:").fill("e2e-test@example.com");
  await page.getByLabel("Password:").fill("test-password");

  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
});

test("Should fail login when incorrect password", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email:").fill("e2e-test@example.com");
  await page.getByLabel("Password:").fill("wrongpassword");

  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(/\/login/);
});

test("Should fail login when fields are empty", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByLabel("Email:")).toBeFocused();

  await expect(page).toHaveURL(/\/login/);
});

test("Should log out a user successfully", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email:").fill("e2e-test@example.com");
  await page.getByLabel("Password:").fill("test-password");

  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/dashboard/settings");

  await page.getByRole("button", { name: "Logout" }).click();

  await expect(page.getByText("Successfully logged out!")).toBeVisible();

  await expect(page).toHaveURL("/login");
});

test("Should redirect unauthenticated users to login", async ({ page }) => {
  await page.goto("/login");

  await expect(page).toHaveURL(/\/login/);
});
