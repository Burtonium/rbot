<template>
  <div class="wrapper">
    <div class="container">
      <div class="row text-center">
        <div class="col-md-4">Engine status:
          <span :class="{'text-success': status === 'Running',
                         'text-warning': status === 'Loading'}">
            {{ status }}
          </span>
        </div>
        <div class="col-md-4">Active Pairs: {{ activePairCount }}</div>
        <div class="col-md-2"></div>
        <div class="col-md-2"></div>
      </div>
      <p class="text"></p>
    </div>
    <br>
    <div class="arbitrage-container">
      <div class="card arbitrage-card" v-for="(arb, index) in arbs" :key="index">
        <div class="card-body">
          <div class="row">
            <h1 class="card-title col-md-8">
              Arb #{{ index + 1 }}
            </h1>
            <div class="col col-md-4 text-right text-success">
              <h1 class="card-subtitle">
                {{ Math.abs(arb.percent) }}%
              </h1>
              <h6>{{ arb.amount }}</h6>
            </div>
          </div>
          <table class="table table-bordered">
            <thead>
              <tr>
                  <th>Exchange</th>
                  <th>Balance</th>
                  <th>Order</th>
                  <th>24H Volume</th>
                  <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(order, index) in arb.orders" :key="index">
                <td>{{ manager.exchanges[order.exchangeId].name }}</td>
                <td v-if="order.type === 'buy'">0 {{ order.pair.quote }}</td>
                <td v-else-if="order.type === 'sell'">0 {{ order.pair.base }}</td>

                <td v-if="order.type === 'buy'">
                  Buy {{ order.amount || 1 }} {{ order.pair.base }}
                  for {{ order.price }} {{ order.pair.quote }}
                </td>
                <td v-else-if="order.type === 'sell'">
                  Sell {{ order.amount || 1 }} {{ order.pair.base }}
                  for {{ order.price }} {{ order.pair.quote }}
                </td>
                <td v-if="order.quoteVolume">
                  {{ precisionRound(order.quoteVolume, 6) }} {{ order.pair.quote }}
                </td>
                <td v-else>
                  {{ precisionRound(order.baseVolume * order.price, 6) }} {{ order.pair.quote }}
                </td>
                <td>Not executed</td>
              </tr>
            </tbody>
          </table>
          <div class="form-group">
            <button class="btn btn-primary float-right">Execute</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ExchangeManager from '@/models/ExchangeManager';
import { pick, sortBy, sortedIndexBy } from 'lodash';
import { precisionRound } from '@/utils';

export default {
  data() {
    return {
      manager: {},
      tickers: {},
      status: 'Loading',
      pairs: {},
      arbs: [],
      interval: null
    };
  },
  methods: {
    precisionRound,
    calculateSimpleArbs() {
      this.arbs = [];
      const tickers = sortBy(Object.values(this.tickers), t => -t.length);
      tickers.forEach((t) => {
        let highestBid;
        let lowestAsk;
        let symbol;

        t.forEach((s) => {
          const ticker = s.ticker;
          symbol = ticker.symbol;

          if (!highestBid || highestBid.amount < ticker.bid) {
            highestBid = {
              amount: ticker.bid,
              id: s.id,
              ...ticker
            };
          }
          if (!lowestAsk || lowestAsk.amount > ticker.ask) {
            lowestAsk = { amount: ticker.ask, id: s.id, ...ticker };
          }
        });

        if (highestBid.amount > lowestAsk.amount) {
          const pair = this.pairs[symbol];
          const percent = ((highestBid.amount - lowestAsk.amount) / highestBid.amount) * 100;

          const arb = {
            percent: precisionRound(percent, 4),
            orders: [{
              type: 'buy',
              pair,
              quoteVolume: lowestAsk.quoteVolume,
              baseVolume: lowestAsk.baseVolume,
              price: lowestAsk.amount,
              exchangeId: lowestAsk.id
            }, {
              type: 'sell',
              pair,
              quoteVolume: highestBid.quoteVolume,
              baseVolume: highestBid.baseVolume,
              price: highestBid.amount,
              exchangeId: highestBid.id
            }]
          };

          const index = sortedIndexBy(this.arbs, arb, a => -a.percent);
          this.arbs.splice(index, 0, arb);
        }
      });
    },
    async refreshTickers() {
      const s = await this.manager.getTickers();
      this.tickers = pick(s, Object.keys(s).filter(k => s[k].length > 1));
    }

  },
  computed: {
    activePairCount() {
      return Object.keys(this.tickers).length;
    }
  },
  async mounted() {
    this.manager = new ExchangeManager();
    this.status = 'Loading markets';
    await this.manager.loadMarkets();

    this.interval = setInterval(async () => {
      this.status = 'Refreshing tickers';
      await this.refreshTickers();
      this.status = 'Calculating arbs';
      this.pairs = this.manager.pairs;
      this.calculateSimpleArbs();
      this.status = 'Idle';
    }, 10000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  }
};
</script>
<style scoped>
  body {
    text-align: left;
  }

  .arbitrage-container {
    padding: 20px;
  }
  .arbitrage-card {
    margin-bottom: 20px;
  }
</style>
