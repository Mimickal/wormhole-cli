# Wormhole.app command line interface

<a href="LICENSE.md"><img align="right" alt="GPL-3.0 Logo"
src="https://www.gnu.org/graphics/gplv3-127x51.png">
</a>

This is a command-line interface for [wormhole.app](https://wormhole.app/).

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
