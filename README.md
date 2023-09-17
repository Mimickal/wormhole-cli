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
-q --quiet     Only print the file download URL.
-v --verbose   Print each step of the file upload process. Useful for debugging.
--chrome-args  Arguments passed to the underlying Chromium instance.
-h --help      Print program usage info and exit.
--version      Print program version and exit.
```

## Installing

```bash
# You can use git (recommended for easier updating)
git clone https://github.com/Mimickal/wormhole-cli.git

# Or just download / extract the latest release

cd wormhole-cli
npm install
npm install -g
```

## Limitations / Planned features

Right now this just uploads one or more files to Wormhole using the default
settings. It cannot view or delete uploaded files. It also cannot transfer files
over 5GB, because Wormhole uses peer-to-peer transfers for this, which Puppeteer
seems to not like.

Planned features:
- Add the ability to tweak file settings (number downloads, expiration)
- Show all previously uploaded files
- Delete previously uploaded files
- Handle files above 5GB

## How it works

Wormhole does not currently have a usable API, so we're stuck using a headless
browser ([puppeteer](https://pptr.dev/)) to upload files via the web interface.
Puppeteer also downloads the frustratingly large Chromium package, which means
what should be a several-KB script with a few HTTP requests is instead a
several-KB script with a ~250MB dependency hanging off of it. Sorry.
At least it's self-contained.

## Troubleshooting

Errors like this may come up on older Linux installs.

```
No usable sandbox! Update your kernel or see https://chromium.googlesource.com/chromium/src/+/main/docs/linux/suid_sandbox_development.md for more information on developing with the SUID sandbox. If you want to live dangerously and need an immediate workaround, you can try using --no-sandbox.
```

You can work around this using `--chrome-args`:
```bash
wormhole-cli --chrome-args="--no-sandbox" <your file>
```

# License
This code is licensed under the
[GPL-3.0](https://www.gnu.org/licenses/gpl-3.0-standalone.html) license.

Basically, any modifications to this code must be made open source.
