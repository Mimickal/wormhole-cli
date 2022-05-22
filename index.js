const puppeteer = require('puppeteer');

const file = process.argv[2];

(async () => {
	console.log('starting');
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	console.log('going to page');
	await page.goto('https://wormhole.app/');

	console.log('clicking file upload');
	// menu-button has a random number at the end, so we need this selector BS
	await page.click('button[id^=menu-button]');
	const [filechooser] = await Promise.all([
		page.waitForFileChooser(),
		page.click('button[id^=menu-list][id*=menuitem]'),
	]);
	await filechooser.accept([file]);
	await page.waitForNavigation();

	console.log(page.url());

	await page.screenshot({ path: 'test.png' });

	//<div style="width: 100%;" aria-valuemax="100" aria-valuemin="0" role="progressbar" class="css-177at4r" aria-valuenow="100"></div>
	await new Promise(resolve => {
		async function doit() {
			const val = await page.$eval('[role=progressbar]',
				element => element.getAttribute('aria-valuenow')
			);

			console.log(val);
			if (val == 100) {
				resolve();
			} else {
				setTimeout(doit, 1000);
			}
		};

		doit();
	});
	await page.screenshot({ path: 'test.png' });
	console.log('upload');
	await page.waitForXPath('//h2[contains(., "Uploaded")]');
	console.log('done');

	await browser.close();
})();
