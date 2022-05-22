# [Wormhole.app](https://wormhole.app/) command line interface

<a href="LICENSE.md"><img align="right" alt="GPL-3.0 Logo"
src="https://www.gnu.org/graphics/gplv3-127x51.png">
</a>

## Usage

```bash
wormhole-cli [OPTIONS] <file(s)>
```

```
~> wormhole-cli ~/Downloads/testfile.bin
Download can be started before upload is finished.
Program will exit once upload is complete...

Download URL: https://wormhole.app/[redacted]

progress [========================================] 100% | ETA: 0s | 100/100
```

### Options

```
-q --quiet    Only print the file download URL.
-v --verbose  Print each step of the file upload process. Useful for debugging.
-h --help     Print program usage info and exit.
--version     Print program version and exit.
```

## Installing

```bash
git clone https://github.com/Mimickal/wormhole-cli.git
cd wormhole-cli
npm install -g .
```

## Limitations / Planned features

Right now this just uploads one or more files to Wormhole using the default
settings. It cannot view or delete uploaded files.

Planned features:
- Add the ability to tweak file settings (number downloads, expiration)
- Show all previously uploaded files
- Delete previously uploaded files

## How it works

Wormhole does not currently have a usable API, so we're stuck using a headless
browser ([puppeteer](https://pptr.dev/)) to upload files via the web interface.
Puppeteer also downloads the frustratingly large Chromium package, which means
what should be a several-KB script with a few HTTP requests is instead a
several-KB script with a ~250MB dependency hanging off of it. Sorry.
At least it's self-contained.

# License
This code is licensed under the
[GPL-3.0](https://www.gnu.org/licenses/gpl-3.0-standalone.html) license.

Basically, any modifications to this code must be made open source.
