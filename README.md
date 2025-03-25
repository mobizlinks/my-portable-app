# Tauri Application

This project is a Tauri application developed using vanilla HTML, CSS, and JavaScript.

## Project Structure

- **scripts/prompt.js**: This script handles the interactive setup for building the Tauri application. It prompts the user for application details, updates the configuration, and manages the build process.
- **src-tauri**: Contains the Tauri configuration and Rust source code.
- **output**: The directory where the built application is saved as a zip file.

## Prerequisites

- [Node.js](https://nodejs.org/) and npm
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mobizlinks/my-portable-app.git
   cd my-portable-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Interactive Build

To start the interactive build process, run:

```bash
npm run build:interactive
```

This will prompt you for application details and build the application based on your input.

### Build

To build the application without interaction, run:

```bash
npm run build
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) with the [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) extension and [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

## License

This project is licensed under the MIT License.
