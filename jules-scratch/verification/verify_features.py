from playwright.sync_api import sync_playwright, expect
import pathlib

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Get the absolute path to the index.html file
    file_path = pathlib.Path("index.html").resolve()
    page.goto(f"file://{file_path}")

    # Wait for the page to load and properties to be rendered
    expect(page.locator("#properties .property-grid .property-card")).to_have_count(15)

    # 1. Verify the "Recommended for You" section
    expect(page.locator("h2:has-text('Recommended for You')")).to_be_visible()
    expect(page.locator("#recommended-property-grid .property-card")).to_have_count(4)

    # 2. Verify the comparison feature
    page.locator(".compare-btn").nth(0).click(force=True)
    page.locator(".compare-btn").nth(1).click(force=True)
    expect(page.locator(".comparison-toolbar")).to_be_visible()
    expect(page.locator(".comparison-item")).to_have_count(2)
    page.locator(".comparison-actions .button-primary").click()
    expect(page.locator(".modal h3:has-text('Compare Properties')")).to_be_visible()
    page.locator(".modal .cart-close").click()
    page.locator(".comparison-actions .button-secondary").click() # Clear comparison
    expect(page.locator(".comparison-toolbar")).not_to_be_visible()


    # 3. Verify the "View Details", "Mortgage Calculator", and "Virtual Tour" buttons
    page.locator(".property-card .button-secondary:has-text('View Details')").nth(0).click()
    expect(page.locator(".modal h3:has-text('Property Details')")).to_be_visible()

    # Mortgage Calculator
    page.locator(".modal .button-secondary:has-text('Mortgage Calculator')").click()
    expect(page.locator("#mortgage-calculator-container")).to_be_visible()
    page.locator("#mc-down-payment").fill("25")
    page.locator("#mc-interest-rate").fill("10")
    page.locator("#mc-loan-term").fill("30")
    page.locator(".modal button:has-text('Calculate')").click()
    expect(page.locator("#mc-result")).to_contain_text("Ksh")

    # Virtual Tour
    page.locator(".modal .button-secondary:has-text('Virtual Tour')").click()
    # The virtual tour replaces the current modal, so we need to wait for the old one to be gone
    expect(page.locator(".modal h3:has-text('Property Details')")).not_to_be_visible()
    # The virtual tour creates a new modal, so we need to wait for it.
    expect(page.locator(".virtual-tour-modal")).to_be_visible()

    # Take a screenshot of the virtual tour
    page.screenshot(path="jules-scratch/verification/verification.png", full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
