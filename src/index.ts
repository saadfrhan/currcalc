#!/usr/bin/env node

import inquirer from "inquirer";
import welcome, { doReplay } from "./utils/index.js";
import { questions } from "./questions.js";
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import chalk from "chalk";
import { searchForTargetAmount } from "./api/index.js";

inquirer.registerPrompt('autocomplete', inquirerPrompt);

async function main() {
  console.log('invoked')
  while (true) {
    const { from, to, amount } = await inquirer.prompt(questions);
    const { date, result, rate } = (await searchForTargetAmount({ from, to, amount }))!;
    console.log(result);
    console.log(amount !== 1 ? rate : '');
    console.log(date);
    if ((await doReplay()).continue) {
      break;
    }
  }
  return console.log(chalk.green('Thanks for using the Currency Converter CLI!'));
}

// await welcome();
await main();