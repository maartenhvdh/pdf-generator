import edgeChromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

const LOCAL_CHROME_EXECUTABLE = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url; 
  //  Open chrome
  const executablePath = await edgeChromium.executablePath || LOCAL_CHROME_EXECUTABLE

  const browser = await puppeteer.launch()
  const page = await browser.newPage();
  console.log(page)
  // await page.goto(url, {
  //   waitUntil: 'networkidle0'
  // });

  const navigationPromise = page.waitForNavigation({waitUntil: "domcontentloaded"});
  console.log('did I get this far?1');
  await page.goto(url);
  console.log('did I get this far?2');
  await navigationPromise;
  console.log('did I get this far?3');
  await page.waitForSelector('#contentidloaded');

  console.log('did I get this far?4');
  
  await page.waitForSelector('#contentidloaded', {
    visible: true,
  });
  const result = await page.pdf({
    format: 'a4',
  });
  await browser.close();

  return result;
})


