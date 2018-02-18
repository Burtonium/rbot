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

  loadMarket(id) {
    return this.exchanges[id].callApi('load_markets', true);
  }

  async loadMarkets(exchangeIds = null) {
    const ids = exchangeIds || this.enabledExchanges.map(ex => ex.id);
    await Promise.all(ids.map(id => this.loadMarket(id)));
  }

  async getTickers() {
    const data = {};
    const promises = await this.enabledExchanges.map(async (ex) => {
      const tickers = await ex.fetchTickers();
      Object.keys(tickers).forEach((k) => {
        if (!data[k]) {
          data[k] = [];
        }
        data[k].push({ id: ex.id, ticker: tickers[k] });
      });
    });
    await Promise.all(promises);
    return data;
  }
}

export default ExchangeManager;
