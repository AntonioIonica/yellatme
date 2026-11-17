import { test, expect } from "@playwright/test";

test("Should display the subscriptions page correctly", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await expect(
    page.getByRole("heading", { name: "Subscriptions" }),
  ).toBeVisible();
});

test("Should open the Add subscription dialog", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Add subscription" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
});

test("Should close the Add subscription dialog", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Add subscription" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();

  await page.getByRole("button", { name: "Close" }).click();

  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("Should allow users to search subscriptions", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  const searchInput = page.getByPlaceholder("Search subscriptions...");

  await searchInput.fill("Netflix");

  await expect(searchInput).toHaveValue("Netflix");
});

test("Should display an empty state when no subscriptions match the search", async ({
  page,
}) => {
  await page.goto("/dashboard/subscriptions");

  await page
    .getByPlaceholder("Search subscriptions...")
    .fill("Non existing subscriptions");

  await expect(page.getByText("No subscriptions found!")).toBeVisible();
});

test("Should filter subscriptions by category", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Category" }).click();

  await page.getByRole("menuitem", { name: "Technology" }).click();

  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("category=technology"),
  );

  await expect(page.getByText("No subscriptions found!")).toBeVisible();

  await responsePromise;
});

test("Should filter subscriptions by status", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Status" }).click();

  await page.getByRole("menuitem", { name: "Expired" }).click();

  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("status=expired"),
  );

  await expect(page.getByText("No subscriptions found!")).toBeVisible();

  await responsePromise;
});

test("Should filter subscriptions by sort", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Sort" }).click();

  await page.getByRole("menuitem", { name: "Desc" }).click();

  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("sort=desc"),
  );

  await expect(page.getByText("No subscriptions found!")).toBeVisible();

  await responsePromise;
});
