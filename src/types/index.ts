export interface CurrencyResult {
  date: string;
  rate: string;
  result: string;
  rawRate: number;
  rawResult: number;
}

export interface ConversionParams {
  from: string;
  to: string;
  amount: number;
}

export interface ConversionHistory extends ConversionParams {
  result: CurrencyResult;
  timestamp: number;
}

export interface ExchangeRateResponse {
  data: {
    date: string;
    info: {
      rate: number;
    };
    result: number;
    success: boolean;
  };
}

export interface CurrencyData {
  data: {
    success: boolean;
    symbols: Record<string, string>;
  };
}

export interface CurrencySymbolsResult {
  success: boolean;
  symbols: string[];
  fullNames: Record<string, string>;
}
