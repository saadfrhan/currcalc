#!/usr/bin/env node

import { search, input, password, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { config } from "dotenv";
import figlet from "figlet";
import { validateApiKey, saveApiKey } from "./utils/apiKeyManager.js";
import { displayHistory, saveToHistory } from "./utils/historyManager.js";
import { CurrencyResult } from "./types/index.js";
import { spinner } from "./utils/spinner.js";
import {
  searchForTargetAmount,
  searchSymbol,
} from "./services/currencyService.js";

config({ path: new URL("./.env", import.meta.url).pathname });

const program = new Command();

program
  .version("1.0.0")
  .description("Advanced Currency Converter CLI")
  .option("-h, --history", "View conversion history")
  .option("-c, --clear", "Clear conversion history")
  .option("-k, --key <key>", "Set API key")
  .option("--historical", "Fetch historical exchange rates")
  .parse(process.argv);

const options = program.opts();

async function displayWelcome() {
  console.log(
    chalk.cyan(figlet.textSync("currcalc", { horizontalLayout: "full" }))
  );
  console.log(chalk.blue("Advanced Currency Converter CLI"));
  console.log(chalk.dim("-------------------------------------"));
}

async function handleConversion() {
  try {
    const from = await search({
      message: "Select source currency:",
      source: (input) => searchSymbol(input),
      pageSize: 10,
      validate(val) {
        return val ? true : "Please select a source currency";
      },
    });

    const to = await search({
      message: "Select target currency:",
      source: (input) => searchSymbol(input, from),
      pageSize: 10,
      validate(val) {
        if (!val) {
          return "Please select a target currency";
        }
        if (val === from) {
          return "Target currency must be different from source currency";
        }
        return true;
      },
    });

    const amount = await input({
      message: "Enter amount to convert:",
      default: "1",
      validate(val) {
        if (val === undefined || val === null || isNaN(Number(val))) {
          return "Please enter a valid number";
        }
        if (Number(val) <= 0) {
          return "Amount must be greater than 0";
        }
        return true;
      },
    });

    spinner.start("Converting currency...");

    const result = await searchForTargetAmount({
      from,
      to,
      amount: Number(amount),
    });

    if (!result) {
      spinner.fail("Conversion failed");
      return false;
    }

    spinner.succeed("Conversion complete");

    displayResult(result);
    saveToHistory({ from, to, amount: Number(amount), result });

    return true;
  } catch (error) {
    spinner.fail(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return false;
  }
}

function displayResult(result: CurrencyResult) {
  console.log("\n" + chalk.green("_".repeat(40)));
  console.log(chalk.bold(result.result));
  console.log(chalk.blue(result.rate));
  console.log(chalk.dim(result.date));
  console.log(chalk.green("-".repeat(40)) + "\n");
}

import { getHistoricalRates } from "./services/currencyService.js";

async function handleHistoricalRates() {
  try {
    const from = await search({
      message: "Select source currency:",
      source: (input) => searchSymbol(input),
      pageSize: 10,
      validate(val) {
        return val ? true : "Please select a source currency";
      },
    });

    const to = await search({
      message: "Select target currency:",
      source: (input) => searchSymbol(input, from),
      pageSize: 10,
      validate(val) {
        if (!val) {
          return "Please select a target currency";
        }
        if (val === from) {
          return "Target currency must be different from source currency";
        }
        return true;
      },
    });

    const days = await input({
      message: "Enter number of days for historical data:",
      default: "7",
      validate(val) {
        if (val === undefined || val === null || isNaN(Number(val))) {
          return "Please enter a valid number";
        }
        if (Number(val) <= 0) {
          return "Number of days must be greater than 0";
        }
        return true;
      },
    });

    spinner.start("Fetching historical rates...");

    const result = await getHistoricalRates(from, to, Number(days));

    if (!result) {
      spinner.fail("Failed to fetch historical rates");
      return false;
    }

    spinner.succeed("Historical rates fetched successfully");

    displayHistoricalRates(result);
    return true;
  } catch (error) {
    spinner.fail(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return false;
  }
}

function displayHistoricalRates(result: { dates: string[]; rates: number[] }) {
  console.log("\n" + chalk.green("_".repeat(40)));
  console.log(chalk.bold("Historical Exchange Rates Table:"));

  result.dates.forEach((date, index) => {
    console.log(`${chalk.blue(date)}: ${chalk.yellow(result.rates[index])}`);
  });
}

async function main() {
  await displayWelcome();

  if (options.key) {
    await saveApiKey(options.key);
    console.log(chalk.green("API key saved successfully!"));
    return;
  }

  if (options.history) {
    await displayHistory();
    return;
  }

  if (options.clear) {
    console.log(chalk.yellow("History cleared successfully!"));
    return;
  }

  if (!(await validateApiKey())) {
    console.log(chalk.red("\nAPI key not found or invalid"));
    console.log(chalk.yellow("Please set your API key:"));

    const apiKey = await password({
      message: "Enter your API key:",
      validate: (value) => (value ? true : "Please enter your API key"),
    });
    await saveApiKey(apiKey);
  }

  if (options.historical) {
    await handleHistoricalRates();
    return;
  }

  let continueConversion = true;

  while (continueConversion) {
    await handleConversion();

    const continuePrompt = await confirm({
      message: "Would you like to convert another currency?",
      default: false,
    });

    continueConversion = continuePrompt;
  }

  console.log(
    chalk.green("\nThanks for using the Advanced Currency Converter CLI!")
  );
}

main().catch((error) => {
  console.error(chalk.red(`Fatal error: ${error.message}`));
  process.exit(1);
});
