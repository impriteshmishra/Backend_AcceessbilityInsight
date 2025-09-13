import puppeteer, { Browser, Page } from "puppeteer";
import { execSync } from "child_process";
import fs from "fs";

let chromeInstalled = false;

const ensureChromeInstalled = async () => {
  if (chromeInstalled) return;

  const chromePath = "/opt/render/.cache/puppeteer/chrome/linux-138.0.7204.168/chrome-linux64/chrome";

  if (!fs.existsSync(chromePath)) {
    console.log("Chrome not found, installing...");
    try {
      execSync("npx puppeteer browsers install chrome", {
        stdio: "inherit",
        timeout: 120000, // 2 minutes timeout
      });
      console.log("Chrome installed successfully");
    } catch (error) {
      console.error("Failed to install Chrome:", error);
      throw new Error("Chrome installation failed");
    }
  }

  chromeInstalled = true;
};

export const launchBrowser = async ()  => {
  // Ensure Chrome is installed before launching
  await ensureChromeInstalled();

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--disable-extensions",
      "--disable-default-apps",
    ],
  });

  console.log("Browser launched successfully");

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  return { browser, page };
};
