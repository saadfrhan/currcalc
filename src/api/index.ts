import axios from 'axios';
import fuzzy from 'fuzzy';
import {
  CurrencyData,
  QuestionsReturnI,
  TargetAmountResult,
  TargetAmountReturnValue
} from '../types/index.js';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

const baseUrl = 'https://api.apilayer.com/exchangerates_data';
const apiOptions = {
  headers: {
    'apikey': process.env.API_KEY
  }
}

export async function getCurrencySymbols() {
  try {
    const { data: { symbols, success } }: CurrencyData = await axios.get(`${baseUrl}/symbols`, apiOptions);
    return {
      success,
      symbols: Object.keys(symbols)
    };
  } catch (error) {
    throw error
  }
}

export async function searchSymbol(_: string[], input = '') {
  let data = await getCurrencySymbols();
  if (!data?.success) return []
  return new Promise((resolve) => {
    setTimeout(async () => {
      const results = fuzzy.filter(input, data?.success ? data?.symbols : []).map((el) => el.original);
      resolve(results);
    }, 0);
  })
}

export async function searchForTargetAmount(
  { to, from, amount }: QuestionsReturnI
): Promise<TargetAmountReturnValue | undefined> {
  try {
    const { data: { date, info: { rate }, result } }: TargetAmountResult = await axios.get(`${baseUrl}/convert?to=${to}&from=${from}&amount=${amount}`, apiOptions);
    return {
      date: `Last updated: ${new Date(date).toDateString()}`,
      rate: `1 ${from} = ${rate} ${to}`,
      result: `${amount} ${from} = ${chalk.yellow(`${result} ${to}`)}`
    }
  } catch (error) {
    throw error;
  }
}