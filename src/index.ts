#!/usr/bin/env node

import inquirer from "inquirer";
import welcome, { doReplay } from "./utils/index.js";
import { questions } from "./questions.js";
import inquirerPrompt from "inquirer-autocomplete-prompt";
import chalk from "chalk";
import { searchForTargetAmount } from "./api/index.js";

inquirer.registerPrompt("autocomplete", inquirerPrompt);

async function main() {
  if (!process.env.CURR_API_KEY) {
    console.log(`
      Please signup for an API key on: https://apilayer.com/marketplace/exchangerates_data-api.
      
      And set the API Key as your environment variable.
      set CURR_API_KEY=xxxxxxxxXXXXXXXX # Windows
      export CURR_API_KEY=xxxxxxxxXXXXXXXX # Mac & Linux
    `)
  }
  while (true) {
    const { from, to, amount } = await inquirer.prompt(questions);
    const { date, result, rate } = (await searchForTargetAmount({
      from,
      to,
      amount,
    }))!;
    console.log(result);
    amount !== 1 && console.log(rate);
    console.log(date);
    if (!(await doReplay()).continue) {
      break;
    }
  }
  return console.log(
    chalk.green("Thanks for using the Currency Converter CLI!")
  );
}

// await welcome();
await main();
