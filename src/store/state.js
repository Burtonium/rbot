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
    tradingFeePercent: 0
  };
});

initialState = {
  token: null,
  exchanges,
  arbHistory: [],
  filters: {},
  currencies: [],
  settings: {
    refreshMode: 'manual',
    refreshInterval: 8,
    lockPosition: true,
    padLimitOrders: true,
    limitOrderPaddingPercent: 5
  }
};

if (localStorage.getItem(STORAGE_KEY)) {
  merge(initialState, JSON.parse(localStorage.getItem(STORAGE_KEY)));
}

export const state = initialState;
