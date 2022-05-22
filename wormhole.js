const puppeteer = require('puppeteer');
const { SingleBar } = require('cli-progress');

const WORMHOLE_HOME = 'https://wormhole.app';
const PROGRESS_MAX = 100;

/**
 * Uploads a file to wormhole.app using a headless browser.
 *
 * Wormhole's web interface doesn't have any consistent HTML id attributes we
 * can rely on, so we use a combination of CSS and XPath selectors to navigate
 * the page and extract progress info. This is obviously brittle and could
 * break at any time.
 */
module.exports.uploadFiles = async function uploadFiles(files, options={}) {
	function vlog(text) {
		if (options.verbose) {
			console.log(text);
		}
	}

	vlog('Starting headless browser');
	const browser = await puppeteer.launch({
		args: options.chrome_args,
	});
	const page = await browser.newPage();

	vlog(`Loading ${WORMHOLE_HOME}`);
	await page.goto(WORMHOLE_HOME);

	vlog('Clicking file upload button');
	await page.click('button[id^=menu-button]');
	const [filechooser] = await Promise.all([
		page.waitForFileChooser(),
		page.click('button[id^=menu-list][id*=menuitem]'),
	]);

	vlog('Beginning file upload');
	await filechooser.accept(files);
	await page.waitForNavigation();

	const progressBar = new SingleBar();

	if (options.quiet) {
		console.log(page.url());
	} else {
		console.log('Download can be started before upload is finished.');
		console.log('Program will exit once upload is complete...');
		console.log();
		console.log(`Download URL: ${page.url()}`);
		console.log();
		progressBar.start(PROGRESS_MAX, 0);
	}

	// Reproduce the progress bar on the command line.
	await new Promise(resolve => {
		async function checkProgress() {
			const progressVal = await page.$eval('[role=progressbar]',
				element => element.getAttribute('aria-valuenow')
			);

			if (!options.quiet) {
				progressBar.update(Number.parseInt(progressVal) || 0);
			}

			if (progressVal == PROGRESS_MAX) {
				resolve();
			} else {
				setTimeout(checkProgress, 1000);
			}
		};

		checkProgress();
	});
	progressBar.stop();

	vlog('Finalizing upload');
	await page.waitForXPath('//h2[contains(., "Uploaded")]');
	vlog('Done!');

	await browser.close();
}
