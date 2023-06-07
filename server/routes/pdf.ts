import edgeChromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

const LOCAL_CHROME_EXECUTABLE = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const waitForDOMToSettle = (page, timeoutMs = 30000, debounceMs = 1000) =>
  page.evaluate(
    (timeoutMs, debounceMs) => {
      let debounce = (func, ms = 1000) => {
        let timeout;
        return (...args) => {
          console.log("in debounce, clearing timeout again");
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            func.apply(this, args);
          }, ms);
        };
      };
      return new Promise((resolve, reject) => {
        let mainTimeout = setTimeout(() => {
          observer.disconnect();
          reject(new Error("Timed out whilst waiting for DOM to settle"));
        }, timeoutMs);
 
        let debouncedResolve = debounce(async () => {
          observer.disconnect();
          clearTimeout(mainTimeout);
          resolve();
        }, debounceMs);
 
        const observer = new MutationObserver(() => {
          debouncedResolve();
        });
        const config = {
          attributes: true,
          childList: true,
          subtree: true,
        };
        observer.observe(document.body, config);
      });
    },
    timeoutMs,
    debounceMs
  );

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url;
  //  Open chrome
  const executablePath = await edgeChromium.executablePath || LOCAL_CHROME_EXECUTABLE

  const browser = await puppeteer.launch({
    executablePath,
    args: edgeChromium.args,
    headless: true,
  });
  const page = await browser.newPage();

  // await page.goto(url, {
  //   waitUntil: 'networkidle0'
  // });

  await page.goto(url, { 'timeout': 10000, 'waitUntil': 'domcontentloaded' });
  await waitForDOMToSettle(page);


  const result = await page.pdf({
    format: 'a4',
  });
  await browser.close();

  return result;
})


