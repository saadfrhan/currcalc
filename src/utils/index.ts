import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';
import inquirer from 'inquirer';

const sleep = (ms: number = 2000) => new Promise(resolve => setTimeout(resolve, ms));

export default async function welcome() {
  const rainbowTitle = chalkAnimation.rainbow('Welcome to the Currency Converter CLI');
  await sleep();
  console.log(`
    ${chalk.bgBlueBright('Instructions:')}
    ${chalk.blue('1.')} On the first prompt, enter your input in this format <amount> <from-currency>
    ${chalk.blue('2.')} On the second prompt, enter the currency you wants to convert to.
    ${chalk.blue('3.')} Press enter.
  `);
  rainbowTitle.stop();
  await sleep(1000);
}

export const doReplay = async (): Promise<{ continue: boolean }> => await inquirer.prompt({
  type: 'confirm',
  name: 'continue',
  message: 'Would you like to continue?',
});