import { readFileSync } from 'fs';
import minimist from 'minimist';
import { uploadFiles } from './wormhole.js';

const argv = minimist(process.argv.slice(2), {
	alias: {
		help: 'h',
	},
	boolean: [
		'help',
		'version',
	],
	default: {
		help: false,
		version: false,
	},
});
argv.files = argv._;

const info = JSON.parse(readFileSync('./package.json'));
const USAGE = [
	`${info.name} ${info.version}`,
	info.description,
	'',
	`Usage: ${info.name} [OPTIONS] <file(s)>`,
	'',
	'Options:',
	`\t -h --help  Prints this help text and exits.`,
	`\t --version  Prints the program's version and exits.`,
].join('\n')

if (argv.help || argv.files.length === 0) {
	console.log(USAGE);
	process.exit();
}

if (argv.version) {
	console.log(info.version);
	process.exit();
}

await uploadFiles(argv.files);
