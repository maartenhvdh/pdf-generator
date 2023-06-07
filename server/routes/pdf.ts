import edgeChromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

const LOCAL_CHROME_EXECUTABLE = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while (checkCounts++ <= maxChecks) {
    let html = await page.content();
    let currentHTMLSize = html.length;

    let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

    console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

    if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
      countStableSizeIterations++;
    else
      countStableSizeIterations = 0; //reset the counter

    if (countStableSizeIterations >= minStableSizeIterations) {
      console.log("Page rendered fully..");
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitForTimeout(checkDurationMsecs);
  }
};

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

  await page.goto(url, { 'timeout': 10000, 'waitUntil': 'load' });
  await waitTillHTMLRendered(page)


  const result = await page.pdf({
    format: 'a4',
  });
  await browser.close();

  return result;
})


