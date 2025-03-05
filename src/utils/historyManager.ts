import fs from "fs/promises";
import path from "path";
import os from "os";
import chalk from "chalk";
import { ConversionHistory } from "../types/index.js";
import Table from "cli-table3";

const HISTORY_DIR = path.join(os.homedir(), ".currcalc");
const HISTORY_FILE = path.join(HISTORY_DIR, "history.json");

async function ensureHistoryDir() {
  try {
    await fs.mkdir(HISTORY_DIR, { recursive: true });
  } catch (error) {}
}

async function getHistory(): Promise<ConversionHistory[]> {
  try {
    await ensureHistoryDir();
    const historyData = await fs.readFile(HISTORY_FILE, "utf8");
    return JSON.parse(historyData) || [];
  } catch (error) {
    return [];
  }
}

export async function saveToHistory(
  conversion: Omit<ConversionHistory, "timestamp">
): Promise<void> {
  await ensureHistoryDir();

  const history = await getHistory();

  const newConversion: ConversionHistory = {
    ...conversion,
    timestamp: Date.now(),
  };

  history.unshift(newConversion);
  const limitedHistory = history.slice(0, 20);

  await fs.writeFile(HISTORY_FILE, JSON.stringify(limitedHistory, null, 2));
}

export async function clearHistory(): Promise<void> {
  await ensureHistoryDir();
  await fs.writeFile(HISTORY_FILE, JSON.stringify([], null, 2));
}

export async function displayHistory(): Promise<void> {
  const history = await getHistory();

  if (history.length === 0) {
    console.log(chalk.yellow("No conversion history found."));
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan("Date"),
      chalk.cyan("From"),
      chalk.cyan("To"),
      chalk.cyan("Amount"),
      chalk.cyan("Result"),
    ],
    style: {
      head: [],
      border: [],
    },
  });

  history.forEach((item) => {
    const date = new Date(item.timestamp).toLocaleString();
    table.push([
      date,
      `${item.from}`,
      `${item.to}`,
      `${item.amount}`,
      `${item.result.rawResult.toFixed(2)}`,
    ]);
  });

  console.log(chalk.bold("\nConversion History:"));
  console.log(table.toString());
}
