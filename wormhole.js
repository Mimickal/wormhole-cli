const { SingleBar } = require('cli-progress');
const { statSync } = require('fs');
const puppeteer = require('puppeteer');

const DIRECT_TRANSFER_THRESHOLD = 5e9;
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
	const totalSize = files.reduce((total, file) => {
		return total + statSync(file).size;
	}, 0);

	if (totalSize > DIRECT_TRANSFER_THRESHOLD) {
		console.error('Error: total upload size exceeds 5GB.');
		console.error(
			'Wormhole supports this using peer-to-peer transfers, ' +
			'but this script currently does not.'
		);
		return;
	}

	function vlog(text) {
		if (options.verbose) {
			console.log(text);
		}
	}

	vlog('Starting headless browser');
	const browser = await puppeteer.launch({
		args: options.chrome_args,
		headless: 'new',
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

	const progressBar = new SingleBar({
		format: '{label} [{bar}] {percentage}% | ETA: {eta}s',
	});

	if (options.quiet) {
		console.log(page.url());
	} else {
		console.log('Download can be started before upload is finished.');
		console.log('Program will exit once upload is complete...');
		console.log();
		console.log(`Download URL: ${page.url()}`);
		console.log();
		progressBar.start(PROGRESS_MAX, 0, { label: 'Progress' });
	}

	// TODO handle these labels on the progress bar
	// h2 Encrypting...
	// h2 Uploading...

	// Reproduce the progress bar on the command line.
	let interval;
	if (!options.quiet) {
		// The progress bar in Wormhole's UI momentarily resets to 0 before
		// disappearing, so we need to check for the value going down too.
		// Interval function makes a closure over this value.
		let prevProgressVal = 0;

		interval = setInterval(async () => {
			let progressVal;
			try {
				const valueStr = await page.$eval('[role=progressbar]',
					element => element.getAttribute('aria-valuenow')
				);
				progressVal = Number.parseInt(valueStr);
			} catch {}

			if (progressVal > prevProgressVal) {
				progressBar.update(progressVal); // TODO update label here
				prevProgressVal = progressVal;
			}
		}, 1000);
	}

	const uploadResult = await Promise.race([
		page.waitForSelector('h2 ::-p-text(Uploaded)',        { timeout: 0 }),
		page.waitForSelector('h2 ::-p-text(Direct transfer)', { timeout: 0 }),
	]);

	clearInterval(interval);
	progressBar.update(100);
	progressBar.stop();

	vlog('Done!');
	const uploadText = await uploadResult.evaluate(elem => elem.textContent);
	if (uploadText === 'Direct transfer') {
		console.error('Error: File(s) uploaded in direct transfer mode.');
		console.error('Wormhole transfers files above 5GB directly rather than uploading.');
		console.error('This script does not currently support direct-transfer mode.');
	}

	await browser.close();
}
