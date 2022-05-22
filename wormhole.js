import puppeteer from 'puppeteer';

const WORMHOLE_HOME = 'https://wormhole.app';

/** Uploads a file to wormhole.app using a headless browser. */
export async function uploadFiles(files, options={}) {
	function vlog(text) {
		if (options.verbose) {
			console.log(text);
		}
	}

	vlog('Starting headless browser');
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	vlog(`Loading ${WORMHOLE_HOME}`);
	await page.goto(WORMHOLE_HOME);

	vlog('Clicking file upload button');
	// menu-button has a random number at the end, so we need this selector BS.
	await page.click('button[id^=menu-button]');
	const [filechooser] = await Promise.all([
		page.waitForFileChooser(),
		// Same story here, except the random number is in the middle this time.
		page.click('button[id^=menu-list][id*=menuitem]'),
	]);

	vlog('Beginning file upload');
	await filechooser.accept(files);
	await page.waitForNavigation();

	if (options.quiet) {
		console.log(page.url());
	} else {
		console.log('Download can be started before upload is finished.');
		console.log('Program will exit once upload is complete...');
		console.log();
		console.log(`Download URL: ${page.url()}`);
		console.log();
	}

	//<div style="width: 100%;" aria-valuemax="100" aria-valuemin="0" role="progressbar" class="css-177at4r" aria-valuenow="100"></div>
	await new Promise(resolve => {
		async function doit() {
			const val = await page.$eval('[role=progressbar]',
				element => element.getAttribute('aria-valuenow')
			);

			vlog(val);
			if (val == 100) {
				resolve();
			} else {
				setTimeout(doit, 1000);
			}
		};

		doit();
	});

	vlog('Finalizing upload');
	await page.waitForXPath('//h2[contains(., "Uploaded")]');
	vlog('Done!');

	await browser.close();
}
