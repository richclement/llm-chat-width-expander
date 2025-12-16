# LLM Chat Width Expander

A Chrome extension that allows you to customize the width of chat interfaces for various LLM services, making them more readable and comfortable to use.

## Supported Services

- ChatGPT (chatgpt.com)
- Gemini (gemini.google.com)
- Grok (grok.com)
- Kapa.ai (chat.kapa.ai)

## Features

- Customize the width of chat interfaces to your preferred size
- Supports different units of measurement (px, rem, em, etc.)
- Real-time width updates without page refresh
- Works across multiple LLM chat services
- Simple and intuitive popup interface

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files

## Usage

1. Click the extension icon in your Chrome toolbar to open the popup
2. Enter your desired width value
3. Select your preferred unit of measurement (px, rem, em, etc.)
4. The changes will be applied immediately to any open chat interfaces

## Development

The extension consists of the following main components:

- `manifest.json`: Extension configuration and permissions
- `content.js`: Main content script that applies width changes to chat interfaces
- `popup.html`: User interface for configuring the width
- `popup.js`: Handles user interactions in the popup

### How it Works

The extension works by:
1. Detecting which LLM service you're using based on the URL
2. Finding the appropriate container element in the page
3. Applying your custom width settings to the container
4. Using a MutationObserver to ensure the width is maintained even when the page content changes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
