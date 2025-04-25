#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p dist

# Clean dist directory
rm -rf dist/*

# Run webpack build
npm run build

# Minify HTML
html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true popup.html -o dist/popup.html

# Create zip file for Chrome Web Store
cd dist
zip -r ../extension.zip *
cd ..

echo "Build complete! The extension package is ready in extension.zip"