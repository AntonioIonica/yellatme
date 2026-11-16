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

  await expect(page).toHaveURL(/\/login/);
});
