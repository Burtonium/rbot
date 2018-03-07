import assert from 'assert';
import { BigNumber } from 'bignumber.js';
import store from '@/store';
import * as types from '@/store/mutation_types';
import { uniq, flatten } from 'lodash';

class Arbitrage {
  constructor(args) {
    this.orders = args.orders;
  }

  get id() {
    return this.orders.map(o => o.exchangeId.toUpperCase() + o.pair.base + o.pair.quote).join();
  }

  get percent() {
    return parseFloat(new BigNumber(this.profit || 0).dividedBy(this.orders[0].quotedAmount || 1).times(100).toFixed(4));
  }

  greaterThan(arb) {
    return new BigNumber(this.percent || 0).isGreaterThan(arb.percent || 0);
  }

  get startingAmount() {
    return this.orders[0] && this.orders[0].amount;
  }

  set startingAmount(amount) {
    this.orders.forEach((o) => { o.amount = amount; });
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

  get containsInsufficientBalances() {
    return this.orders.some(o => o.insufficientBalance);
  }

  get hasBalances() {
    return this.orders.every(o => o.hasBalance);
  }

  get currencies() {
    return uniq(flatten(this.orders.map(o => [o.pair.quote, o.pair.base])));
  }

  execute() {
    const p = this.orders.map(o => o.execute());
    return Promise.all(p);
  }

  save() {
    store.commit(types.ADD_TO_ARBITRAGE_HISTORY, { arb: this });
  }

  update() {
    return Promise.all(this.orders.map(o => o.update()));
  }
}

export default Arbitrage;
