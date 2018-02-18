import ccxt from 'ccxt';
import assert from 'assert';
import { wait } from '@/utils';
import store from '@/store';
import { pick } from 'lodash';

class Exchange {
  constructor(args) {
    assert(ccxt[args.id], `${args.id} not found in ccxt exchanges`);

    this.ccxt = new ccxt[args.id]();
    if (!this.ccxt.has.cors) {
      this.ccxt.proxy = process.env.CORS_PROXY_URL;
    }
    this.refreshState();
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
    return Object.values(this.markets).map(m => pick(m, ['base', 'quote', 'symbol']));
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
        this.error = new Error(`${this.name} requires loaded markets`);
        throw this.error;
      }
      this.tickers = {};
      const promises = Object.keys(markets)
        .filter(k => markets[k].active)
        .map(async (s) => {
          this.tickers[s] = await this.callApi('fetchTicker', s);
        });
      await Promise.all(promises);
    }
    return this.tickers;
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
}

export default Exchange;
