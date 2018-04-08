import { BigNumber } from 'bignumber.js';
import { pick } from 'lodash';
import assert from 'assert';
import { precisionRound } from '@/utils';

class Order {
  constructor(args) {
    this.ticker = args.ticker;
    this.exchange = args.exchange;
    this.exchangeId = args.exchangeId || (args.exchange && args.exchange.id);
    Object.assign(this, pick(args, Order.attributes));
    assert(this.pair, 'Pair is required');
    if (this.exchange && !this.ticker && this.exchange.tickers) {
      this.ticker = this.exchange.tickers[this.pair.symbol];
    }
  }

  static get attributes() {
    return [
      'id',
      'amount',
      'type',
      'side',
      'pair',
      'exchangeId',
      'limitPrice',
      'timestamp',
      'trades',
      'error'
    ];
  }

  get params() {
    return {
      kucoin: { type: this.side.toUpperCase() }
    };
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
    let price = null;
    if (this.book) {
      const bookSide = this.side === 'buy' ? this.book.asks : this.book.bids;
      let remaining = this.amount;

      const filteredBook = [];
      // eat up orders on the book according to the amount
      bookSide.map(s => ({ price: s[0], amount: s[1] })).every((cur) => {
        let data;
        if (cur.amount > remaining) {
          data = { price: cur.price, amount: remaining };
          remaining = 0;
        } else if (cur.amount < remaining) {
          data = cur;
          remaining -= cur.amount;
        }
        filteredBook.push(data);
        return remaining > 0; // break loop if remaining is 0
      });

      // Ate the entire order book with some to spare. Profit calculation no longer reliable.
      if (remaining > 0) {
        filteredBook.push({
          price: filteredBook[filteredBook.length - 1].price,
          amount: remaining
        });
        this.bookWarning = `${this.exchange.name} ${this.side} orders are all eaten
          by this amount. Price no longer reliable; proceed with caution.`;
      } else {
        this.bookWarning = null;
      }

      const theOneTruePrice = filteredBook.reduce((acc, cur) => {
        const ratio = cur.amount / this.amount;
        return (cur.price * ratio) + acc;
      }, 0);
      price = precisionRound(theOneTruePrice, 8);
    } else {
      price = this.side === 'buy' ? this.ticker.ask : this.ticker.bid;
    }

    // readjust price for trading fees
    if (this.exchange.tradingFeePercent) {
      if (this.side === 'buy') {
        price += (this.exchange.tradingFeePercent / 100) * price;
      } else if (this.side === 'sell') {
        price -= (this.exchange.tradingFeePercent / 100) * price;
      }
    }
    return precisionRound(price, 8);
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
      data = false;
    }
    return data;
  }

  get filled() {
    return precisionRound((this.trades || []).map(t => t.filled).reduce((a, b) => a + b, 0), 8);
  }

  get cost() {
    return precisionRound((this.trades || []).map(t => t.cost).reduce((a, b) => a + b, 0), 8);
  }

  get executedPrice() {
    const result = (this.trades || []).reduce((acc, cur) => {
      const ratio = cur.amount / this.amount;
      return (cur.price * ratio) + acc;
    }, 0);
    return precisionRound(result, 8);
  }

  get status() {
    let status = 'executed';
    if (this.error || (this.trades && this.trades.length === 0)) {
      status = 'error';
    }
    if (this.trades && this.trades.length > 0) {
      status = this.trades.every(t => t.status === 'closed') ? 'closed' : 'open';
    }
    return status;
  }

  execute() {
    return this.exchange.placeOrder(this)
      .then((response) => {
        this.timestamp = new Date();
        this.id = response.id;
        this.limitPrice = this.price;
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
      this.book = await this.exchange.ccxt.fetchOrderBook(this.symbol, 5);
    } catch (error) {
      this.book = { error };
    }
  }

  async fetchOrderInfo() {
    // assert(this.id, 'Order id is required');
    assert(this.exchange, 'Exchange instance is required');

    let trades = [];

    if (this.status === 'closed') {
      return;
    }

    const closed = await this.exchange.callApi('fetchClosedOrders', this.pair.symbol);
    trades = trades.concat(closed.filter(o => o.id === this.id));

    const open = await this.exchange.callApi('fetchOpenOrders', this.pair.symbol);
    trades = trades.concat(open.filter(o => o.id === this.id));

    this.trades = trades;
  }

  toJSON() {
    return {
      ...pick(this, Order.attributes),
    };
  }
}

export default Order;
