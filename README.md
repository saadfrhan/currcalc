# currcalc

Advanced Currency Converter CLI with Node.js, TypeScript, and Interactive Features

<img src="./preview.gif" />

## Features

- Convert between 170+ global currencies
- Store conversion history
- Auto-complete currency selection
- Beautiful, colorful output
- Fast fuzzy search for currencies
- Multiple API key storage options
- Response caching for faster performance
- Get historical data option.

## Installation

```bash
# Install globally
pnpm install -g currcalc

# Or run directly with pnpm
pnpm dlx currcalc
```

## Setup

### API Key Setup

1. Create a free account on [ExchangeRates API](https://apilayer.com/marketplace/exchangerates_data-api)
2. Subscribe to the free plan and copy your API key
3. Set up your API key using one of these methods:

#### Method 1: Command Line

```bash
pnpm dlx currcalc --key YOUR_API_KEY
```

#### Method 2: Environment Variable

```bash
# Windows
set CURR_API_KEY=YOUR_API_KEY

# Mac & Linux
export CURR_API_KEY=YOUR_API_KEY
```

## Usage

### Basic Currency Conversion

```bash
pnpm dlx currcalc
```

Follow the interactive prompts:

1. Select source currency (with autocomplete)
2. Select target currency (with autocomplete)
3. Enter the amount to convert / Enter number of days (if `--historical` is passed)

### Command Line Options

```bash
# Start the currency calculator
pnpm dlx currcalc
pnpm dlx currcalc --historical # if you want to get historical data

# View conversion history
pnpm dlx currcalc --history
pnpm dlx currcalc -h

# Clear conversion history
pnpm dlx currcalc --clear
pnpm dlx currcalc -c

# Set API key
pnpm dlx currcalc --key YOUR_API_KEY
pnpm dlx currcalc -k YOUR_API_KEY

# View help
pnpm dlx currcalc --help

# View version
pnpm dlx currcalc --version
```

## Development

### Prerequisites

- Node.js
- pnpm

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/user/currcalc.git
cd currcalc

# Install dependencies
pnpm install

# Run in development mode
pnpm run dev

# Build for production
pnpm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [ExchangeRates API](https://apilayer.com/marketplace/exchangerates_data-api) for currency data
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) for interactive CLI
- [Commander.js](https://github.com/tj/commander.js) for command line option parsing
