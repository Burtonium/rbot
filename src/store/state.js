import { merge } from 'lodash';

export const STORAGE_KEY = 'R-BOT-STORAGE';

let initialState = {};

initialState = {
  token: null,
  exchanges: {},
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
