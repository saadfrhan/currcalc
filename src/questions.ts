import { QuestionCollection } from 'inquirer';
import { QuestionsReturnI } from './types/index.js';
import { searchSymbol } from './api/index.js';

export const questions: QuestionCollection<QuestionsReturnI> = [
  {
    name: 'from',
    type: 'autocomplete',
    message: 'Enter the source currency code:',
    suggestOnly: false,
    searchText: 'Loading...',
    emptyText: 'There is no currency symbol you provided.',
    source: searchSymbol,
    pageSize: 12,
    validate(val) {
      return val ? true : 'Type something!';
    }
  },
  {
    name: 'to',
    type: 'autocomplete',
    message: 'Enter the target currency code:',
    suggestOnly: false,
    searchText: 'Loading...',
    emptyText: 'There is no currency symbol you provided.',
    source: searchSymbol,
    pageSize: 12,
    validate(val, answers) {
      return val && val !== answers?.from ? true : 'You must not select the same symbol for target';
    }
  },
  {
    name: 'amount',
    type: 'number',
    message: 'Enter the amount to convert:',
    validate(val) {
      if (!val) {
        return 'Please enter the amount!';
      }
      if (!/^\d+(\.\d+)?$/.test(val)) {
        return 'Please enter a valid number!';
      }
      return true;
    }
  }
];