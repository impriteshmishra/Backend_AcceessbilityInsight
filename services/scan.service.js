import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { launchBrowser } from "../utils/puppeteer.utils.js";
import axe from "axe-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const scanPage = async (url) => {
  let browser, page;
  try {
    const result = await launchBrowser();
    browser = result.browser;
    page = result.page;

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // inject axe core from local file
    await page.evaluate(axe.source); // inject axe core source code

    //Run axe inside the browser context
    const results = await page.evaluate(async () => {
      return await window.axe.run();
    });

    return results;
  } catch (error) {
    console.error("Scan Error:", error.message);
    throw new Error("scan failed.");
  } finally {
    if (browser) await browser.close();
  }
};
