# Random Favorite Picker for Songsterr

A Chrome extension that adds a random song picker functionality to Songsterr.com, allowing users to play a random song from their favorites list.

## Features

- One-click random song selection from your favorites
- Keyboard shortcut support (default: "=" key)
- Customizable keyboard shortcut
- Debug mode for troubleshooting

## Development

### Prerequisites

- Node.js
- npm

### Setup

1. Clone the repository
```bash
git clone [repository-url]
cd random-favorite-picker
```

2. Install dependencies
```bash
npm install
```

3. Build the extension
```bash
npm run build
```

The built extension will be in the `dist` directory.

### Loading the extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` directory

## Building for Production

To create a production build:

```bash
npm run build
```

This will create:
- Compiled files in the `dist` directory
- A ready-to-upload `extension.zip` file

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
