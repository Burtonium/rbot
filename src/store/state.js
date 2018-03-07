import ccxt from 'ccxt';
import { merge } from 'lodash';

export const STORAGE_KEY = 'R-BOT-STORAGE';

let initialState = {};

const exchanges = {};
ccxt.exchanges.forEach((e) => {
  const i = new ccxt[e]();
  exchanges[e] = {
    name: i.name,
    enabled: false,
    id: i.id,
    options: null,
    apiKey: '',
  };
});

initialState = {
  exchanges,
  arbHistory: [],
  filters: {},
  currencies: [],
  settings: {
    refreshMode: 'manual',
    refreshInterval: 8,
    lockPosition: true
  }
};

if (localStorage.getItem(STORAGE_KEY)) {
  merge(initialState, JSON.parse(localStorage.getItem(STORAGE_KEY)));
}

export const state = initialState;
