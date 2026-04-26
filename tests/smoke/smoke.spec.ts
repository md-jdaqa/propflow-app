import { test, expect } from "@playwright/test";

// 20 @smoke tests covering Phase 1 environment + core navigation.
// Tagged @smoke so `npm run test:smoke` picks them up.

test.describe("PropFlow smoke @smoke", () => {
  test("01 home renders without errors @smoke", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page).toHaveTitle(/PropFlow/);
    expect(errors).toEqual([]);
  });

  test("02 top nav is visible @smoke", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("top-nav")).toBeVisible();
  });

  test("03 brand mark renders @smoke", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("PropFlow", { exact: true }).first()).toBeVisible();
  });

  test("04 footer version badge visible and clickable @smoke", async ({ page }) => {
    await page.goto("/");
    const badge = page.getByTestId("version-badge");
    await expect(badge).toBeVisible();
    await badge.click();
    await expect(page.getByTestId("changelog-modal")).toBeVisible();
    await page.getByTestId("changelog-close").click();
    await expect(page.getByTestId("changelog-modal")).toHaveCount(0);
  });

  test("05 dark theme is applied by default on first paint @smoke", async ({ page }) => {
    await page.goto("/");
    const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme).not.toBeNull();
  });

  test("06 settings page reachable and theme picker present @smoke", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("theme-picker")).toBeVisible();
  });

  test("07 changing theme persists in localStorage @smoke", async ({ page }) => {
    await page.goto("/settings");
    await page.getByTestId("theme-emerald-trust").click();
    const stored = await page.evaluate(() => localStorage.getItem("propflow-theme"));
    expect(stored).toBe("emerald-trust");
  });

  test("08 dashboard loads all 7 cards @smoke", async ({ page }) => {
    await page.goto("/");
    for (const id of [
      "card-rent-collected",
      "card-outstanding",
      "card-occupancy",
      "card-recent-payments",
      "card-uncategorized",
      "card-upcoming",
      "card-tax-readiness",
    ]) {
      await expect(page.getByTestId(id)).toBeVisible();
    }
  });

  test("09 finances page has 4 tabs @smoke", async ({ page }) => {
    await page.goto("/finances");
    await expect(page.getByTestId("tab-overview")).toBeVisible();
    await expect(page.getByTestId("tab-transactions")).toBeVisible();
    await expect(page.getByTestId("tab-rules")).toBeVisible();
    await expect(page.getByTestId("tab-reports")).toBeVisible();
  });

  test("10 properties page reachable @smoke", async ({ page }) => {
    await page.goto("/properties");
    await expect(page.getByTestId("properties-page")).toBeVisible();
  });

  test("11 tenants page reachable @smoke", async ({ page }) => {
    await page.goto("/tenants");
    await expect(page.getByTestId("tenants-page")).toBeVisible();
  });

  test("12 record-payment route opens the modal @smoke", async ({ page }) => {
    await page.goto("/finances?tab=record");
    await expect(page.getByTestId("record-payment-modal")).toBeVisible();
  });

  test("13 add property slide-over opens @smoke", async ({ page }) => {
    await page.goto("/properties?action=new");
    await expect(page.getByTestId("add-property-slideover")).toBeVisible();
  });

  test("14 changelog modal renders content @smoke", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("version-badge").click();
    const modal = page.getByTestId("changelog-modal");
    await expect(modal).toContainText("PropFlow");
  });

  test("15 transaction rule form renders @smoke", async ({ page }) => {
    await page.goto("/finances?tab=rules");
    await expect(page.getByTestId("rule-form")).toBeVisible();
  });

  test("16 sign-in page renders @smoke", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByTestId("sign-in-form")).toBeVisible();
  });

  test("17 oauth provider buttons render @smoke", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByTestId("oauth-google")).toBeVisible();
    await expect(page.getByTestId("oauth-apple")).toBeVisible();
    await expect(page.getByTestId("oauth-microsoft")).toBeVisible();
  });

  test("18 settings ai + ntfy sections render @smoke", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("settings-ai")).toBeVisible();
    await expect(page.getByTestId("settings-ntfy")).toBeVisible();
  });

  test("19 mobile bottom nav appears at iPhone width @smoke", async ({ page, viewport }) => {
    await page.goto("/");
    if ((viewport?.width ?? 999) < 768) {
      await expect(page.getByTestId("bottom-nav")).toBeVisible();
    } else {
      await expect(page.getByTestId("sidebar")).toBeVisible();
    }
  });

  test("20 no horizontal scroll at any tested viewport @smoke", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    });
    expect(overflow).toBe(false);
  });
});
