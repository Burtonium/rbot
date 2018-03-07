import ccxt from 'ccxt';
import Exchange from '@/models/Exchange';
import { flatten, keyBy, uniqBy } from 'lodash';

class ExchangeManager {
  constructor() {
    this.exchanges = {};
    ccxt.exchanges.forEach((exchangeId) => {
      this.exchanges[exchangeId] = new Exchange({ id: exchangeId });
    });
  }

  get enabledExchanges() {
    return Object.values(this.exchanges).filter(ex => ex.enabled);
  }

  get pairs() {
    const pairs = flatten(this.enabledExchanges.map(e => e.pairs));
    return keyBy(uniqBy(pairs, p => p.symbol), p => p.symbol);
  }

  get currencies() {
    const s = new Set();
    Object.values(this.pairs).forEach((p) => {
      s.add(p.quote);
      s.add(p.base);
    });
    return s;
  }

  loadMarket(id) {
    return this.exchanges[id].callApi('load_markets', true);
  }

  async loadMarkets(exchangeIds = null) {
    const ids = exchangeIds || this.enabledExchanges.map(ex => ex.id);
    await Promise.all(ids.map(id => this.loadMarket(id)));
  }

  fetchTickers() {
    const promises = this.enabledExchanges.map((ex) => {
      return ex.fetchTickers().then(() => {
        if (!ex.tickers) {
          ex.error = new Error(`Unable to get tickers for ${ex.name}`);
        }
      });
    });
    return Promise.all(promises);
  }

  async fetchOrderBooks() {
    const promises = await this.enabledExchanges.map(async (ex) => {
      await ex.fetchOrderBooks();
      if (!ex.tickers) {
        ex.error = new Error(`Unable to get tickers for ${ex.name}`);
      }
    });
    await Promise.all(promises);
  }

  fetchPotentialArbs() {
    this.arbs = {};
    Object.values(this.exchanges).forEach((e) => {
      const exchange = e;
      if (!e.tickers) {
        e.error = new Error(`Unable to fetch potential arbs for ${e.name}`);
        return;
      }

      Object.values(e.tickers).forEach((t) => {
        if (!t || !t.symbol) {
          return;
        }
        this.arbs[t.symbol] = this.arbs[t.symbol] || {};

        if (!this.arbs[t.symbol].high || this.arbs[t.symbol].high.ticker.bid < t.bid) {
          this.arbs[t.symbol].high = { exchange, ticker: { ...t } };
        }

        if (!this.arbs[t.symbol].low || this.arbs[t.symbol].low.ticker.ask > t.ask) {
          this.arbs[t.symbol].low = { exchange, ticker: { ...t } };
        }
      });
    });
  }
}

export default ExchangeManager;
