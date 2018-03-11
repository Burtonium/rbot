import assert from 'assert';
import { BigNumber } from 'bignumber.js';
import store from '@/store';
import * as types from '@/store/mutation_types';
import { uniq, flatten, pick } from 'lodash';
import uuidv4 from 'uuid/v4';
import { precisionRound } from '@/utils';

class Arbitrage {
  constructor(args) {
    Object.assign(this, pick(args, Arbitrage.attributes));
    this.orders = args.orders;
  }

  static get attributes() {
    return ['timestamp', 'id'];
  }

  get arbId() {
    return this.orders.map(o => o.exchangeId.toUpperCase() + o.pair.base + o.pair.quote).join('-');
  }

  get percent() {
    return parseFloat(new BigNumber(this.profit || 0)
      .dividedBy(this.orders[0].quotedAmount || 1).times(100).toFixed(4));
  }

  get startingAmount() {
    return this.orders[0] && this.orders[0].amount;
  }

  set startingAmount(amount) {
    this.orders.forEach((o) => { o.amount = amount; });
  }

  get startingQuote() {
    return this.orders[0] && this.orders[0].quotedPrice;
  }

  set startingQuote(quote) {
    this.jsandk = quote; // TODO change this
  }

  get endingAmount() {
    const o = this.orders[this.orders.length - 1];
    return o && o.amount;
  }

  get profitCurrency() {
    return this.orders[0].pair.quote;
  }

  get profit() {
    const firstOrder = this.orders[0];
    const lastOrder = this.orders[this.orders.length - 1];
    assert(firstOrder.pair.quote === lastOrder.pair.quote, 'Quote currencies do not match');
    if (!lastOrder.quotedAmount || !firstOrder.quotedAmount) {
      return NaN;
    }
    return new BigNumber(lastOrder.quotedAmount).minus(firstOrder.quotedAmount).toFixed(8);
  }

  get actualProfit() {
    const p = this.orders.reduce((acc, cur) => {
      let profit;
      if (cur.side === 'buy') {
        profit = acc - cur.cost;
      } else if (cur.side === 'sell') {
        profit = acc + cur.cost;
      }
      return profit;
    }, 0);
    return precisionRound(p, 8);
  }

  get containsInsufficientBalances() {
    return this.orders.some(o => o.insufficientBalance);
  }

  get hasBalances() {
    return this.orders.every(o => o.hasBalance);
  }

  get currencies() {
    return uniq(flatten(this.orders.map(o => [o.pair.quote, o.pair.base])));
  }

  get status() {
    if (this.refreshing) {
      return 'refreshing...';
    }
    if (!this.orders || this.orders.some(o => o.status === 'error')) {
      return 'error';
    }
    return this.orders.every(o => o.status === 'closed') ? 'closed' : 'open';
  }

  get bookWarnings() {
    return this.orders.map(o => o.bookWarning).filter(w => !!w);
  }

  async execute() {
    assert(!this.timestamp, 'Executing arb twice');
    const p = this.orders.map(o => o.execute());

    await Promise.all(p);
    this.timestamp = new Date();
    this.id = uuidv4();
  }

  save() {
    store.commit(types.ADD_TO_ARBITRAGE_HISTORY, { arb: this });
  }

  update() {
    this.orders.forEach(o => o.update());
  }

  async updateOrderInfo() {
    this.refreshing = true;
    await Promise.all(this.orders.map(o => o.fetchOrderInfo()));
    store.commit(types.UPDATE_ARBITRAGE_HISTORY_ORDERS, { id: this.id, orders: this.orders });
    this.refreshing = false;
  }

  greaterThan(arb) {
    return new BigNumber(this.percent || 0).isGreaterThan(arb.percent || 0);
  }

  toJSON() {
    return pick(this, Arbitrage.attributes.concat(['arbId', 'orders']));
  }
}

export default Arbitrage;
