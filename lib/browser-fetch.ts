import { chromium as playwrightChromium, Browser, Page } from 'playwright-core';
import chromium from '@sparticuz/chromium';

let browser: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;

/**
 * Get or create a browser instance (reused across requests for efficiency)
 * Uses @sparticuz/chromium for serverless environments (Vercel, AWS Lambda, etc.)
 */
async function getBrowser(): Promise<Browser> {
  if (browser) {
    return browser;
  }

  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }

  browserLaunchPromise = (async () => {
    try {
      // Get Chromium executable path for serverless environments
      const executablePath = await chromium.executablePath();

      const browserInstance = await playwrightChromium.launch({
        args: [
          ...chromium.args,
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--single-process',
        ],
        executablePath,
        headless: true,
      });

      // Clean up browser on process exit
      process.on('beforeExit', async () => {
        if (browserInstance) {
          await browserInstance.close();
        }
      });

      return browserInstance;
    } catch (error: any) {
      console.error('Error launching browser:', error);
      throw new Error(
        `Failed to launch browser: ${error.message}\n` +
        'Ensure @sparticuz/chromium is properly installed for serverless environments.'
      );
    }
  })();

  browser = await browserLaunchPromise;
  return browser;
}

/**
 * Fetch using a real browser - this bypasses Cloudflare bot protection
 * by using actual browser TLS fingerprints and behavior
 */
export async function browserFetch(
  url: string,
  options: {
    headers?: Record<string, string>;
    method?: string;
  } = {}
): Promise<Response> {
  const browserInstance = await getBrowser();
  const context = await browserInstance.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });

  let page: Page | null = null;

  try {
    page = await context.newPage();

    // Set extra headers
    if (options.headers) {
      await page.setExtraHTTPHeaders(options.headers);
    }

    // Navigate to the URL
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    if (!response) {
      throw new Error('No response received');
    }

    // Get response body
    const body = await response.text();
    const status = response.status();
    const statusText = response.statusText();
    const headers = response.headers();

    // Create a Response-like object compatible with standard Response API
    // Filter out invalid header values (Cloudflare sometimes sends headers with invalid characters)
    const responseHeaders = new Headers();
    Object.entries(headers).forEach(([key, value]) => {
      try {
        // Check if header value is valid (HTTP headers can't contain certain characters)
        // Cloudflare headers like "cf-ray" with values containing semicolons/commas are invalid
        if (typeof value === 'string' && value.length > 0) {
          // Basic validation: header values shouldn't contain newlines or control characters
          // But we'll be more lenient and just try to set it, catching errors
          responseHeaders.set(key, value);
        }
      } catch (error) {
        // Skip invalid headers (like Cloudflare's cf-ray headers with complex values)
        // These headers aren't needed for the API response anyway
        console.warn(`Skipping invalid header: ${key} = ${value?.substring(0, 50)}...`);
      }
    });

    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: statusText || 'OK',
      headers: responseHeaders,
      json: async () => {
        try {
          return JSON.parse(body);
        } catch (e) {
          throw new Error(`Failed to parse JSON: ${e}`);
        }
      },
      text: async () => body,
      arrayBuffer: async () => {
        const encoder = new TextEncoder();
        return encoder.encode(body).buffer;
      },
      blob: async () => {
        return new Blob([body], { type: headers['content-type'] || 'application/json' });
      },
    } as Response;
  } finally {
    if (page) {
      await page.close();
    }
    await context.close();
  }
}

