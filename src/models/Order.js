import { BigNumber } from 'bignumber.js';
import { pick } from 'lodash';
import assert from 'assert';

class Order {
  constructor(args) {
    Object.assign(this, pick(args, [
      'amount',
      'type',
      'side',
      'pair',
      'ticker',
      'exchange'
    ]));
    assert(this.pair, 'Pair is required');
  }

  get exchangeId() {
    return this.exchange.id;
  }

  get availableQuoteBalance() {
    return this.exchange.availableBalance(this.pair.quote) || 0;
  }

  get availableBaseBalance() {
    return this.exchange.availableBalance(this.pair.base) || 0;
  }

  get quotedAmount() {
    return this.price && new BigNumber(this.amount || 0).times(this.price).toFixed(8);
  }

  get quotedAmountString() {
    return `${this.quotedAmount} ${this.pair.quote}`;
  }

  get quoteVolume() {
    return this.ticker.quoteVolume;
  }

  get baseVolume() {
    return this.ticker.baseVolume;
  }

  get price() {
    return this.side === 'buy' ? this.ticker.ask : this.ticker.bid;
  }

  get symbol() {
    return this.ticker.symbol;
  }

  get insufficientBalance() {
    let data = false;
    try {
      if (this.side === 'buy') {
        data = this.availableQuoteBalance < this.quotedAmount;
      } else {
        data = this.availableBaseBalance < this.amount;
      }
    } catch (e) {
      data = true;
    }
    return data;
  }

  get hasBalance() {
    let data = false;
    try {
      if (this.side === 'buy') {
        data = !!this.availableQuoteBalance;
      } else {
        data = !!this.availableBaseBalance;
      }
    } catch (e) {
      data = true;
    }
    return data;
  }

  execute() {
    return this.exchange.placeOrder(this)
      .then((response) => {
        this.timestamp = new Date();
        this.id = response.id;
      }).catch((error) => {
        this.error = error.message;
      });
  }

  async update() {
    const symbol = this.ticker.symbol;
    if (this.exchange.tickers) {
      this.ticker = { ...this.exchange.tickers[symbol] };
    }
  }

  async loadBook() {
    assert(this.exchange, 'Exchange instance required');
    assert(this.exchange.has.fetchOrderBook, `Method fetchOrderBook not in ${this.exchange.name}`);
    try {
      this.book = await this.exchange.ccxt.fetchOrderBook(this.symbol, 6);
    } catch (error) {
      this.book = { error };
    }
    console.log('Fetched', this.book);
    return true;
  }

  toJSON() {
    return {
      ...pick(this, ['amount', 'id', 'exchangeId', 'pair', 'type', 'side', 'price', 'timestamp']),
    };
  }
}

export default Order;
