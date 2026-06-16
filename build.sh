#!/bin/bash
set -e

# Single source of truth for the build pipeline lives in package.json.
# This wrapper just runs the canonical webpack build + zip.
#
#   npm run build    -> webpack (minifies JS, copies manifest/popup.html/images to dist/)
#   npm run zip      -> packages dist/* into extension.zip
#   npm run compile  -> build + zip
npm run compile

echo "Build complete! The extension package is ready in extension.zip"
