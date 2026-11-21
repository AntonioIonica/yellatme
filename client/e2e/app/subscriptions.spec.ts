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

  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("category=technology"),
  );
  await page.getByRole("menuitem", { name: "Technology" }).click();

  await responsePromise;
});

test("Should filter subscriptions by status", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Status" }).click();

  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("status=expired"),
  );
  await page.getByRole("menuitem", { name: "Expired" }).click();

  await responsePromise;
});

test("Should filter subscriptions by sort", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Sort" }).click();

  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("sortDir=desc"),
  );
  await page.getByRole("menuitem", { name: "Desc" }).click();

  await responsePromise;
});

test("Should add a subscriptions successfully", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Add subscription" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Add new subscription" }),
  ).toBeVisible();

  await page.getByLabel("Subscription name:*").fill("Spotify add test");
  await page.getByLabel("Subscription description:").fill("Music streaming");
  await page.getByLabel("Price:*").fill("10");
  await page.getByLabel("Payment method:*").fill("Credit card");

  await page.getByRole("button", { name: "Create subscription" }).click();

  await expect(
    page.getByText(
      `Subscription Spotify add test was added to your collection!`,
    ),
  ).toBeVisible();

  await expect(page.getByRole("dialog")).not.toBeVisible();

  await expect(page.getByText("Spotify add test").first()).toBeVisible();

  const subscriptionCard = page
    .locator(".bg-card")
    .filter({ hasText: "Spotify add test" })
    .first();

  await subscriptionCard.getByRole("button").click();

  await page.getByRole("menuitem", { name: "Delete" }).click();
});

test("Should open the edit subscription dialog", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Add subscription" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Add new subscription" }),
  ).toBeVisible();

  await page.getByLabel("Subscription name:*").fill("Spotify edit test");
  await page.getByLabel("Subscription description:").fill("Music streaming");
  await page.getByLabel("Price:*").fill("10");
  await page.getByLabel("Payment method:*").fill("Credit card");

  await page.getByRole("button", { name: "Create subscription" }).click();

  await expect(
    page.getByText(
      "Subscription Spotify edit test was added to your collection!",
    ),
  ).toBeVisible();

  const subscriptionCard = page
    .locator(".bg-card")
    .filter({ hasText: "Spotify edit test" })
    .first();

  await subscriptionCard.getByRole("button").click();

  await page.getByRole("menuitem", { name: "Edit" }).click();

  await expect(
    page.getByRole("heading", { name: "Edit subscription" }),
  ).toBeVisible();

  await expect(page.getByLabel("Subscription name:*")).toHaveValue(
    "Spotify edit test",
  );

  await page.getByRole("button", { name: "Cancel" }).click();

  await subscriptionCard.getByRole("button").click();

  await page.getByRole("menuitem", { name: "Delete" }).click();
});

test("Should edit a subscription successfully", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Add subscription" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Add new subscription" }),
  ).toBeVisible();

  await page.getByLabel("Subscription name:*").fill("Spotify edit test");
  await page.getByLabel("Subscription description:").fill("Music streaming");
  await page.getByLabel("Price:*").fill("10");
  await page.getByLabel("Payment method:*").fill("Credit card");

  await page.getByRole("button", { name: "Create subscription" }).click();

  const subscriptionCard = page
    .locator(".bg-card")
    .filter({ hasText: "Spotify edit test" })
    .first();

  await subscriptionCard.getByRole("button").click();

  await page.getByRole("menuitem", { name: "Edit" }).click();

  await page.getByLabel("Subscription name:*").clear();

  await page.getByLabel("Subscription name:*").fill("Spotify Premium");

  await page.getByRole("button", { name: "Edit subscription" }).click();

  await expect(
    page.getByText("Successfully updated the subscription details!"),
  ).toBeVisible();

  await expect(
    page.locator(".bg-card").filter({ hasText: "Spotify Premium" }).first(),
  ).toBeVisible();

  const newSubscriptionCard = page
    .locator(".bg-card")
    .filter({ hasText: "Spotify Premium" });

  await newSubscriptionCard.getByRole("button").click();

  await page.getByRole("menuitem", { name: "Delete" }).click();
});

test("Should successfully delete a subscription", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Add subscription" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Add new subscription" }),
  ).toBeVisible();

  await page.getByLabel("Subscription name:*").fill("Spotify delete test");
  await page.getByLabel("Subscription description:").fill("Music streaming");
  await page.getByLabel("Price:*").fill("10");
  await page.getByLabel("Payment method:*").fill("Credit card");

  await page.getByRole("button", { name: "Create subscription" }).click();

  const subscriptionCard = page
    .locator(".bg-card")
    .filter({ hasText: "Spotify delete test" })
    .first();

  await subscriptionCard.getByRole("button").click();

  await page.getByRole("menuitem", { name: "Delete" }).click();

  await expect(page.getByText("Successfully deleted")).toBeVisible();
});

test("Should search subscriptions successfully", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Add subscription" }).click();

  await page.getByLabel("Subscription name:*").fill("Netflix search test");
  await page.getByLabel("Subscription description:").fill("Search test");
  await page.getByLabel("Price:*").fill("15");
  await page.getByLabel("Payment method:*").fill("Credit card");

  await page.getByRole("button", { name: "Create subscription" }).click();

  await expect(
    page.getByText(
      "Subscription Netflix search test was added to your collection",
    ),
  ).toBeVisible();

  await page
    .getByPlaceholder("Search subscriptions...")
    .fill("Netflix search test");

  await expect(
    page.getByText("Netflix search test", { exact: true }),
  ).toBeVisible();

  const subscriptionCard = page
    .locator(".bg-card")
    .filter({ hasText: "Netflix search test" })
    .first();

  await subscriptionCard.getByRole("button").click();

  await page.getByRole("menuitem", { name: "Delete" }).click();

  await expect(page.getByText("Successfully deleted")).toBeVisible();

  await expect(page.getByText("Netflix search test")).not.toBeVisible();

  await expect(page.getByText("Netflix premium")).not.toBeVisible();
});
