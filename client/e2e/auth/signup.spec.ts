import { expect, test } from "@playwright/test";

test("Should successfully register a new user", async ({ page }) => {
  await page.goto("/sign-up");

  await page.getByLabel("Name:").fill("E2E new user");
  await page.getByLabel("Email:").fill(`e2e-${Date.now()}@example.com`);
  await page
    .getByLabel("Password:", {
      exact: true,
    })
    .fill("password123");
  await page
    .getByLabel("Confirm password:", { exact: true })
    .fill("password123");

  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(/\/login/);
});
