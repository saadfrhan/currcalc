import axios from "axios";
import { getApiKey } from "../utils/apiKeyManager.js";
import {
  CurrencyData,
  ConversionParams,
  CurrencyResult,
  ExchangeRateResponse,
  CurrencySymbolsResult,
} from "../types/index.js";
import chalk from "chalk";
import fuzzy from "fuzzy";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 });

const baseUrl = "https://api.apilayer.com/exchangerates_data";

const debug = (message: string, data?: any) => {
  console.log(chalk.cyan(`[DEBUG] ${message}`));
  if (data) {
    console.log(chalk.dim(JSON.stringify(data, null, 2)));
  }
};

async function getApiOptions() {
  const apiKey = await getApiKey();
  debug(`API Key retrieved: ${apiKey ? "✓" : "✗"}`);

  return {
    headers: {
      apikey: apiKey,
    },
  };
}

export async function getCurrencySymbols() {
  debug("getCurrencySymbols called");

  const cachedSymbols = cache.get<CurrencySymbolsResult>("symbols");
  if (cachedSymbols) {
    debug("Using cached symbols", {
      symbolsCount: cachedSymbols.symbols.length,
    });
    return cachedSymbols;
  }

  debug("Cache miss for symbols, fetching from API");

  try {
    const apiOptions = await getApiOptions();
    debug("Making API request to /symbols");

    const { data }: CurrencyData = await axios.get(
      `${baseUrl}/symbols`,
      apiOptions
    );

    debug("API response received", {
      success: data.success,
      symbolsCount: Object.keys(data.symbols).length,
    });

    if (!data.success) {
      debug("API call unsuccessful", data);
      throw new Error("Failed to fetch currency symbols");
    }

    const result = {
      success: data.success,
      symbols: Object.keys(data.symbols),
      fullNames: data.symbols,
    };

    const sampleSymbols = Object.keys(data.symbols).slice(0, 3);
    debug(
      "Sample symbols",
      sampleSymbols.reduce((obj, key) => {
        obj[key] = data.symbols[key];
        return obj;
      }, {} as Record<string, string>)
    );

    cache.set("symbols", result);
    debug("Symbols cached successfully");

    return result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      debug("Axios error in getCurrencySymbols", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      debug("Error in getCurrencySymbols", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    throw error;
  }
}

export async function searchSymbol(
  input = "",
  from?: string
): Promise<
  {
    name: string;
    value: string;
  }[]
> {
  debug(`searchSymbol called with input: "${input}"`);

  try {
    const data = await getCurrencySymbols();
    debug("Got currency symbols for search", {
      symbolsCount: data.symbols.length,
    });

    // Remove the "from" symbol if present
    if (from) {
      const index = data.symbols.indexOf(from);
      if (index !== -1) {
        data.symbols.splice(index, 1);
        debug(`Removed "from" symbol: ${from}`, {
          updatedSymbolsCount: data.symbols.length,
        });
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const results = fuzzy.filter(input, data.symbols).map((el) => {
          const code = el.original;
          const name = data.fullNames[code];
          return {
            name: `${code} - ${name}`,
            value: code,
          };
        });

        debug(`Search results for "${input}"`, {
          resultsCount: results.length,
          sampleResults: results.slice(0, 3),
        });

        resolve(results);
      }, 0);
    });
  } catch (error) {
    debug("Error in searchSymbol", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

export async function searchForTargetAmount({
  to,
  from,
  amount,
}: ConversionParams): Promise<CurrencyResult | undefined> {
  debug("searchForTargetAmount called", { from, to, amount });

  const cacheKey = `${from}-${to}`;
  debug(`Checking cache for key: ${cacheKey}`);

  const cachedRate = cache.get<{ rate: number; date: string }>(cacheKey);
  if (cachedRate) {
    debug("Cache hit for exchange rate", cachedRate);
  } else {
    debug("Cache miss for exchange rate");
  }

  try {
    let rate: number;
    let date: string;

    if (cachedRate) {
      debug("Using cached exchange rate");
      rate = cachedRate.rate;
      date = cachedRate.date;
    } else {
      debug("Fetching fresh exchange rate from API");
      const apiOptions = await getApiOptions();

      const apiUrl = `${baseUrl}/convert?to=${to}&from=${from}&amount=1`;
      debug(`Making API request to: ${apiUrl}`);

      const { data }: ExchangeRateResponse = await axios.get(
        apiUrl,
        apiOptions
      );

      debug("API response received", {
        success: data.success,
        rate: data.info?.rate,
        date: data.date,
      });

      if (!data.success) {
        debug("API call unsuccessful", data);
        throw new Error("Conversion failed");
      }

      rate = data.info.rate;
      date = data.date;

      debug("Caching exchange rate", { rate, date });
      cache.set(cacheKey, { rate, date });
    }

    const result = amount * rate;
    debug("Calculated conversion result", {
      amount,
      rate,
      result,
      from,
      to,
    });

    const formattedResult =
      result < 0.01 ? result.toFixed(6) : result.toFixed(2);

    debug("Formatted result", { formattedResult });

    const currencyResult = {
      date: `Last updated: ${new Date(date).toLocaleDateString()} ${new Date(
        date
      ).toLocaleTimeString()}`,
      rate: `1 ${from} = ${rate.toFixed(4)} ${to}`,
      result: `${amount} ${from} = ${chalk.yellow(formattedResult)} ${to}`,
      rawRate: rate,
      rawResult: result,
    };

    debug("Returning currency result", currencyResult);
    return currencyResult;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      debug("Axios error in searchForTargetAmount", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      debug("Error in searchForTargetAmount", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
    throw error;
  }
}

export async function getHistoricalRates(
  from: string,
  to: string,
  days: number = 7
) {
  debug("getHistoricalRates called", { from, to, days });

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  debug("Date range calculated", {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  try {
    const apiOptions = await getApiOptions();

    const apiUrl = `${baseUrl}/timeseries?start_date=${formatDate(
      startDate
    )}&end_date=${formatDate(endDate)}&base=${from}&symbols=${to}`;

    debug(`Making API request to: ${apiUrl}`);

    const { data } = await axios.get(apiUrl, apiOptions);

    debug("Historical rates API response received", {
      success: data.success,
      datesCount: Object.keys(data.rates || {}).length,
    });

    if (!data.success) {
      debug("API call unsuccessful", data);
      throw new Error("Failed to fetch historical rates");
    }

    const result = {
      dates: Object.keys(data.rates),
      rates: Object.values(data.rates).map((rate: any) => rate[to]),
    };

    debug("Processed historical rates", {
      datesCount: result.dates.length,
      sampleDates: result.dates.slice(0, 3),
      sampleRates: result.rates.slice(0, 3),
    });

    return result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      debug("Axios error in getHistoricalRates", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      debug("Error in getHistoricalRates", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    throw error;
  }
}
