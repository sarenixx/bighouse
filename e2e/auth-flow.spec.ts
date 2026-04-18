import "dotenv/config";
import { expect, test } from "@playwright/test";

const demoEmail = process.env.DEMO_USER_EMAIL ?? "";
const demoPassword = process.env.DEMO_USER_PASSWORD ?? "";

async function login(page: Parameters<typeof test>[0]["page"], password = demoPassword) {
  await page.goto("/login");
  await page.getByTestId("login-email").fill(demoEmail);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/$/);
}

test.describe.serial("auth flow", () => {
  test("logs in and lands on the portfolio overview", async ({ page }) => {
    await login(page);

    await expect(page.getByRole("heading", { name: "Portfolio Overview" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hot Sheet" })).toBeVisible();
  });

  test("updates a task through the authenticated dashboard flow", async ({ page }) => {
    await login(page);
    await page.goto("/tasks");
    await expect(page.getByRole("heading", { name: "Tasks & Reviews" })).toBeVisible();

    const taskCard = page.getByTestId("task-card-task-12");
    const nextDecision = `Clear report for trustee distribution. QA ${Date.now()}`;

    await taskCard.getByTestId("task-decision-task-12").fill(nextDecision);
    await taskCard.getByTestId("task-save-task-12").click();

    await expect(taskCard.getByTestId("task-decision-task-12")).toHaveValue(nextDecision);
  });

  test("logs out and returns to the login screen", async ({ page }) => {
    await login(page);

    await page.getByTestId("logout-button").click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Enter the oversight portal" })).toBeVisible();
  });

  test("shows the account lockout message after repeated invalid sign-in attempts", async ({ page }) => {
    await page.goto("/login");

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await page.getByTestId("login-email").fill(demoEmail);
      await page.getByTestId("login-password").fill("definitely-wrong-password");
      await page.getByTestId("login-submit").click();
    }

    await expect(
      page.getByText("Account temporarily locked after repeated sign-in failures. Please wait 15 minutes and try again.")
    ).toBeVisible();
  });
});
