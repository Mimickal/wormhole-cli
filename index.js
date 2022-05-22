#!/usr/bin/env node
const info = require('./package.json');
const minimist = require('minimist');
const { uploadFiles } = require('./wormhole');

const argv = minimist(process.argv.slice(2), {
	alias: {
		help: 'h',
		quiet: 'q',
		verbose: 'v',
	},
	boolean: [
		'help',
		'quiet',
		'verbose',
		'version',
	],
	default: {
		help: false,
		quiet: false,
		verbose: false,
		version: false,
	},
	string: [
		'chrome-args',
	]
});
argv.files = argv._;
argv.chrome_args = argv['chrome-args'].split(/\s+/);

const USAGE = [
	`Usage: ${info.name} [OPTIONS] <file(s)>`,
	'',
	'Options:',
	`\t -q --quiet     Print only the download URL.`,
	`\t -v --verbose   Prints each step of the upload process.`,
	`\t --chrome-args  Arguments passed to the underlying Chromium browser.`,
	`\t -h --help      Prints this help text and exits.`,
	`\t --version      Prints the program's version and exits.`,
].join('\n')

if (argv.help) {
	console.log(`${info.name} ${info.version}`);
	console.log(info.description);
	console.log('NOTE: This program exits only once the file upload is complete!');
	console.log();
	console.log(USAGE);
	process.exit();
}

if (argv.version) {
	console.log(info.version);
	process.exit();
}

if (argv.quiet && argv.verbose) {
	console.error('Error: conflicting options --quiet and --verbose given!');
	console.error();
	console.error(USAGE);
	process.exit(1);
}

if (argv.files.length === 0) {
	console.log('No files given!');
	console.log(USAGE);
	process.exit(1);
}

(async () => await uploadFiles(argv.files, {
	chrome_args: argv.chrome_args,
	quiet: argv.quiet,
	verbose: argv.verbose,
}))();
