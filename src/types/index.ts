export interface TargetAmountReturnValue {
  date: string;
  rate: string;
  result: string;
}

export interface QuestionsReturnI {
  from: string;
  to: string;
  amount: number;
}

export interface TargetAmountResult {
  data: {
    date: Date;
    info: {
      rate: number;
    }
    result: number;
    success: boolean;
  }
}

export interface CurrencyData {
  data: {
    success: boolean;
    [x: string]: any;
  }
}