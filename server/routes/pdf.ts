import edgeChromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

const LOCAL_CHROME_EXECUTABLE = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

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

  await page.goto(url);
  await timeout(2000);

  const result = await page.pdf({
    format: 'a4',
  });
  await browser.close();

  return result;
})


