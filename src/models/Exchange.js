import ccxt from 'ccxt';
import assert from 'assert';
import { wait, precisionRound } from '@/utils';
import store from '@/store';
import * as types from '@/store/mutation_types';
import Balance from '@/models/Balance';
import { pick, kebabCase, replace, capitalize, keyBy } from 'lodash';
import api from '../api';

class Exchange {
  constructor(args) {
    const id = args.id || args;
    assert(ccxt[id], `${id} not found in ccxt exchanges`);

    this.ccxt = new ccxt[id]();
    if (!this.ccxt.has.cors) {
      this.ccxt.proxy = process.env.CORS_PROXY_URL;
    }
    this.refreshState();
    this.balances = {};
  }

  get id() {
    return this.ccxt.id;
  }

  get name() {
    return this.ccxt.name;
  }

  get enabled() {
    return this.state.enabled;
  }

  get state() {
    return store.getters.getExchangeState(this.ccxt.id);
  }

  get markets() {
    return this.ccxt.markets;
  }

  get pairs() {
    return Object.values(this.markets || {}).map(m => pick(m, ['base', 'quote', 'symbol']));
  }

  get apiKey() {
    return this.state.apiKey;
  }

  get tradingFeePercent() {
    return this.state.tradingFeePercent;
  }

  set apiKey(apiKey) {
    store.commit(types.ASSIGN_EXCHANGE_STATE, { apiKey, id: this.id });
    this.refreshState();
  }

  get secret() {
    return this.state.secret;
  }

  set secret(secret) {
    store.commit(types.ASSIGN_EXCHANGE_STATE, { secret, id: this.id });
    this.refreshState();
  }

  get login() {
    return this.state.login;
  }

  set login(login) {
    store.commit(types.ASSIGN_EXCHANGE_STATE, { login, id: this.id });
    this.refreshState();
  }

  get password() {
    return this.state.password;
  }

  set password(password) {
    store.commit(types.ASSIGN_EXCHANGE_STATE, { password, id: this.id });
    this.refreshState();
  }

  get countries() {
    let countries = [];
    if (this.ccxt.countries instanceof Array) {
      countries = this.ccxt.countries;
    } else if (typeof this.ccxt.countries === 'string') {
      countries = [this.ccxt.countries];
    }
    return countries;
  }

  get requires() {
    return this.ccxt.requiredCredentials ? this.ccxt.requiredCredentials : {};
  }

  get unfulfilledRequirements() {
    return Object.keys(this.requires)
      .filter(k => this.requires[k])
      .filter(k => !this[k])
      .map(kebabCase)
      .map(e => replace(e, '-', ' '))
      .map(capitalize)
      .join(', ');
  }

  get has() {
    return this.ccxt.has;
  }

  get orders() {
    return this.state.orders;
  }

  refreshState() {
    Object.assign(this.ccxt, pick(this.state, ['apiKey', 'secret', 'password', 'uid']));
  }

  async fetchTickers() {
    if (this.ccxt.has.fetchTickers) {
      this.tickers = await this.callApi('fetchTickers');
    } else {
      const markets = this.ccxt.markets;
      if (!markets) {
        this.error =  new Error(`${this.name} requires loaded markets`); // eslint-disable-line
        throw this.error;
      }
      this.tickers = {};
      const activeMarkets = Object.keys(markets)
        .filter(k => markets[k].active);

      for (let index = 0; index < activeMarkets.length; index += 1) {
        const market = activeMarkets[index];
        await wait(this.ccxt.rateLimit); // eslint-disable-line
        this.tickers[market] = await this.callApi('fetchTicker', market); // eslint-disable-line
      }
    }
  }

  async callApi(method, ...args) {
    let data = null;
    assert(typeof this.ccxt[method] === 'function', `${method} not found in ccxt instance`);

    const msSinceLastCall = new Date() - this.lastCall;
    if (msSinceLastCall < this.ccxt.rateLimit) {
      await wait(this.ccxt.rateLimit - msSinceLastCall);
    }

    try {
      this.lastCall = new Date();
      data = await this.ccxt[method](...args);
    } catch (e) {
      this.error = e;
    }
    return data;
  }

  availableBalance(currency) {
    assert(this.balances, 'Fetch balances first');
    return (this.balances[currency] || {}).available;
  }

  async fetchBalances() {
    if (!this.has.fetchBalance || this.unfulfilledRequirements) {
      return {};
    }
    const response = await this.callApi('fetchBalance');
    if (!response) {
      throw new Error(`Unable to fetch balance for ${this.name}`);
    }
    this.balances = keyBy(Object.keys(response)
      .filter(key => !['free', 'info', 'total', 'used'].includes(key))
      .map(code => new Balance({
        code,
        available: response.free[code],
        locked: response.used[code]
      })), b => b.code);
    return this.balances;
  }

  async placeOrder(order) {
    assert(order.symbol
      && ['buy', 'sell'].includes(order.side)
      && ['limit', 'market'].includes(order.type)
      && order.amount
      && order.price, 'Order invalid');

    let price = order.price;
    if (store.state.settings.padLimitOrders) {
      if (order.side === 'buy') {
        price *= (1 + (store.state.settings.limitOrderPaddingPercent / 100));
      } else if (order.side === 'sell') {
        price *= (1 - (store.state.settings.limitOrderPaddingPercent / 100));
      }
    }

    const response = await this.callApi('createOrder', order.symbol, order.type,
      order.side, order.amount, precisionRound(price, 6));

    if (this.error) {
      throw this.error;
    }
    return response;
  }
}

export default Exchange;
