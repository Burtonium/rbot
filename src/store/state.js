import ccxt from 'ccxt';
import deepAssign from 'deep-assign';

export const STORAGE_KEY = 'R-BOT-STORAGE';

let initialState = {};

const exchanges = {};
ccxt.exchanges.forEach((e) => {
  const i = new ccxt[e]();
  exchanges[e] = {
    name: i.name,
    enabled: false,
    id: i.id,
    options: null
  };
});

initialState = {
  exchanges
};

if (localStorage.getItem(STORAGE_KEY)) {
  deepAssign(initialState, JSON.parse(localStorage.getItem(STORAGE_KEY)));
}

export const state = initialState;
