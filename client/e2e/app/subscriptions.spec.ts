import { test, expect } from "@playwright/test";

test("Should display the subscriptions page correctly", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await expect(
    page.getByRole("heading", { name: "Subscriptions" }),
  ).toBeVisible();
});
