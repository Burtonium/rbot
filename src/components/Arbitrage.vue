<template>
  <div class="wrapper">
    <div class="container">
      <div class="row text-center">
        <div class="col-md-4">Engine status:
          <span :class="{'text-success': status === 'Idle',
                         'text-warning': status !== 'Idle'}">
            {{ status }}
          </span>
        </div>
        <div class="col-md-2">
          <span class="clickable" v-if="refreshMode === 'manual'" @click="attemptRefresh">
            Refresh &nbsp;
            <icon class="clickable" :icon="syncIcon" :spin="status !== 'Idle'"/>
          </span>
          <span v-if="refreshMode === 'auto'">
            Refreshing
            <span v-if="timeRemainingBeforeRefresh > 0">
              in &nbsp; {{ timeRemainingBeforeRefresh }}
            </span>
            <span v-else>...</span>
          </span>
        </div>
        <div class="col-md-6">Filters:
          <span class="badge clickable filter"
                :class="{'badge-success': state.enabled, 'badge-danger': !state.enabled}"
                v-for="(state, filter) in filters"
                :key="filter"
                @click="TOGGLE_FILTER(filter)">
            {{ toWords(filter) }}
          </span>
        </div>
      </div>
    </div>
    <br>
    <!-- Nav tabs -->
    <div class="arbitrage-container">
      <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item">
          <a class="nav-link active" data-toggle="tab" href="#arbs" role="tab">Arbs</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-toggle="tab" href="#history" role="tab">History</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-toggle="tab" href="#filters" role="tab">Filters</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-toggle="tab" href="#settings" role="tab">Settings</a>
        </li>
      </ul>

      <br>
      <!-- Tab panes -->
      <div class="tab-content">
        <div class="tab-pane active" id="arbs" role="tabpanel">
          <spinner v-if="arbs.length === 0"></spinner>
          <transition-group name="flip-list" tag="div">
            <div class="card arbitrage-card" v-for="(arb, index) in filteredArbs" :key="arb.id">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-8">
                    <h1 class="card-title">
                      Arb #{{ index + 1 }}
                      <loading-progress   :progress="progressBar"
                                          :indeterminate="false"
                                          size="30"
                                          fillDuration="10" style="position:relative;bottom:-20px; left:10px; margin:-35px"/>
                    </h1>
                    <div class="row">
                      <div class="col-md-6">
                        <label style="font-weight:bold">Starting Amount</label>
                        <input v-model="arb.startingAmount" class="form-control"
                               placeholder="Amount" type="number">
                      </div>
                    </div>
                  </div>
                  <div class="col col-md-4 text-right"
                       :class="{'text-success': arb.percent > 0,
                                'text-danger': arb.percent < 0}">
                    <h1 class="card-subtitle">
                      {{ Math.abs(arb.percent) }}%
                    </h1>
                    <h6>{{ arb.profit }} {{ arb.profitCurrency }}</h6>
                  </div>
                </div>
                <br>
                <table class="table table-bordered">
                  <thead>
                    <tr>
                        <th>Exchange</th>
                        <th>Available Balance</th>
                        <th>Order</th>
                        <th>24H Volume</th>
                        <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(order, index) in arb.orders" :key="index">
                      <td>
                        <router-link :to="'/exchanges/' + order.exchangeId">
                          {{ order.exchange.name }}
                        </router-link>
                      </td>
                      <td v-if="!order.exchange.balances ||
                                !order.exchange.has.fetchBalance">
                        Unavailable
                      </td>
                      <td class="text-warning"
                         v-else-if="order.exchange.unfulfilledRequirements">
                        Requires: {{ order.exchange.unfulfilledRequirements }}
                      </td>
                      <td v-else-if="order.side === 'buy'">
                        {{ order.availableQuoteBalance }} {{ order.pair.quote }}
                      </td>
                      <td v-else-if="order.side === 'sell'">
                        {{ order.availableBaseBalance  }} {{ order.pair.base }}
                      </td>

                      <td v-if="order.side === 'buy'">
                        Buy {{ order.amount }} {{ order.pair.base }}
                        for {{ order.quotedAmountString }}
                      </td>
                      <td v-else-if="order.side === 'sell'">
                        Sell {{ order.amount }} {{ order.pair.base }}
                        for {{ order.quotedAmountString }}
                      </td>
                      <td v-if="order.quoteVolume">
                        {{ precisionRound(order.quoteVolume, 6) }} {{ order.pair.quote }}
                      </td>
                      <td v-else>
                        {{ precisionRound(order.baseVolume * order.price, 6) }} {{ order.pair.quote }}
                      </td>
                      <td class="text-danger" v-if="order.exchange.error">
                        {{ order.exchange.error.message || 'Error' }}
                      </td>
                      <td class="text-danger" v-else-if="order.insufficientBalance">
                        Insufficient Balance
                      </td>
                      <td class="text-success" v-else>Ready</td>
                    </tr>
                  </tbody>
                </table>
                <div class="form-group">
                  <button class="btn btn-primary float-right" @click="execute(arb)">Execute</button>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
        <div class="tab-pane" id="history" role="tabpanel">
          <history></history>
        </div>
        <div class="tab-pane" id="filters" role="tabpanel">
          <filters></filters>
        </div>
        <div class="tab-pane" id="settings" role="tabpanel">
          <settings></settings>
        </div>
      </div>
    </div>
    <modal v-if="selectedArb" @dismiss="selectedArb = null">
      <h3 slot="header">Arbitrage Execution</h3>
      <div slot="body">
        <arbitrage-details :arb="selectedArb"></arbitrage-details>
      </div>
      <span slot="confirm">Execute</span>
    </modal>
  </div>
</template>
<script>
import ExchangeManager from '@/models/ExchangeManager';
import Order from '@/models/Order';
import Arbitrage from '@/models/Arbitrage';
import Spinner from '@/components/Spinner';
import ArbitrageHistory from '@/components/ArbitrageHistory';
import ArbitrageDetails from '@/components/ArbitrageDetails';
import Filters from '@/components/Filters';
import Settings from '@/components/ArbitrageSettings';
import Modal from '@/components/Modal';
import Icon from '@fortawesome/vue-fontawesome';
import faSync from '@fortawesome/fontawesome-free-solid/faSync';
import { sortedIndexBy, keyBy, sortBy } from 'lodash';
import { precisionRound, wait, toWords } from '@/utils';
import * as types from '@/store/mutation_types';
import { mapGetters, mapMutations } from 'vuex';

export default {
  data() {
    return {
      manager: {},
      tickers: {},
      status: 'Loading',
      pairs: {},
      arbs: [],
      balances: {},
      activeTab: 'arbs',
      running: false,
      timeRemainingBeforeRefresh: this.refreshInterval,
      selectedArb: null
    };
  },
  computed: {
    ...mapGetters(['arbHistory', 'filters', 'settings']),
    refreshMode() {
      return this.settings.refreshMode;
    },
    refreshInterval() {
      return this.settings.refreshInterval;
    },
    progressBar() {
      const secondsElapsed = this.refreshInterval - this.timeRemainingBeforeRefresh || 0;
      return secondsElapsed / this.refreshInterval;
    },
    syncIcon() {
      return faSync;
    },
    filteredArbs() {
      let arbs = this.arbs;
      if (this.filters.hasBalances && this.filters.hasBalances.enabled) {
        arbs = arbs.filter(a => a.hasBalances);
      }
      if (this.filters.sufficientBalances && this.filters.sufficientBalances) {
        arbs = arbs.filter(a => !a.containsInsufficientBalances);
      }

      const currencyFilter = this.filters.exclusiveCurrencyFilter;
      if (currencyFilter && currencyFilter.enabled && currencyFilter.data.list.length > 0) {
        const list = new Set(currencyFilter.data.list);
        arbs = arbs.filter(a => a.currencies.every(c => list.has(c)));
      }

      const symbolFilter = this.filters.exchanges;
      if (symbolFilter && symbolFilter.enabled && symbolFilter.data) {
        const f = symbolFilter.data;
        arbs = arbs.filter(a => a.orders.every(o => !f[o.exchangeId]
          || !f[o.exchangeId].symbols.includes(o && o.symbol)));
      }

      return arbs;
    },
    activePairCount() {
      return Object.keys(this.tickers).length;
    }
  },
  components: {
    Spinner,
    history: ArbitrageHistory,
    ArbitrageDetails,
    Filters,
    Settings,
    Icon,
    Modal
  },
  methods: {
    ...mapMutations([types.TOGGLE_FILTER, types.UPDATE_CURRENCIES, types.UPDATE_PAIRS]),
    toWords,
    precisionRound,
    async calculateSimpleArbs() {
      this.manager.fetchPotentialArbs();
      Object.values(this.manager.arbs).forEach((arb) => {
        if (!arb.high.ticker.bid || !arb.low.ticker.ask) {
          return;
        }

        const pair = this.pairs[arb.high.ticker.symbol];
        const arbitrage = new Arbitrage({
          orders: [new Order({
            amount: 1,
            side: 'buy',
            type: 'limit',
            pair,
            ticker: arb.low.ticker,
            exchange: arb.low.exchange
          }), new Order({
            amount: 1,
            side: 'sell',
            type: 'limit',
            pair,
            ticker: arb.high.ticker,
            exchange: arb.high.exchange
          })]
        });

        const index = sortedIndexBy(this.arbs, arbitrage, a => -a.percent);
        this.arbs.splice(index, 0, arbitrage);
      });
    },
    fetchBalances() {
      this.manager.enabledExchanges.filter(e => e.ccxt.has.fetchBalance)
        .forEach(async (e) => {
          await e.fetchBalances();
          this.balances[e.id] = keyBy(Object.values(e.balances), b => b.code);
        });
    },
    async updateArbs() {
      const updates = this.arbs.map(a => a.update());
      await Promise.all(updates);
      if (!this.settings.lockPosition) {
        this.arbs = sortBy(this.arbs, [a => -a.percent]);
      }
    },
    refreshTickers() {
      return this.manager.fetchTickers();
    },
    async execute(arb) {
      try {
        if (arb.containsInsufficientBalances) {
          await this.$dialog.confirm(`Arb has orders from exchanges with insufficient
            balances. Continue anyway?`);
        }

        this.selectedArb = arb;
      } catch (err) {
        // Do nothing
      }
    },
    showExecutionWindow(arb) {
      this.selectedArb = arb;
    },
    async refresh() {
      this.status = 'Refreshing tickers';
      await this.refreshTickers(); // eslint-disable-line

      this.status = 'Updating arbs';
      this.updateArbs();

      this.status = 'Idle';
      this.$forceUpdate();
    },
    async countdown() {
      this.timeRemainingBeforeRefresh = this.refreshInterval;
      while (this.timeRemainingBeforeRefresh > 0) {
        await wait(1000); /* eslint-disable-line */
        this.timeRemainingBeforeRefresh -= 1;
      }
    },
    attemptRefresh() {
      if (this.status === 'Idle') {
        this.refresh();
      }
    },
    startMainLoop() {
      if (!window.mainLoopTimeout) {
        window.mainLoopTimeout = setTimeout(async () => {
          while (window.mainLoopTimeout) {
            if (this.refreshMode === 'auto') {
              await this.refresh();
              await this.countdown();
            }
            await wait(1000);
          }
        });
      }
    }
  },
  async mounted() {
    this.manager = new ExchangeManager();
    this.status = 'Loading markets';
    await this.manager.loadMarkets();
    this.status = 'Fetching balances';
    await this.fetchBalances();

    this.pairs = this.manager.pairs;
    this.status = 'Updating currencies';
    this.UPDATE_CURRENCIES(this.manager.currencies);

    this.status = 'Refreshing tickers';
    await this.refreshTickers();

    this.status = 'Calculating arbs';
    this.calculateSimpleArbs();
    this.status = 'Idle';

    this.startMainLoop();
  },
  destroyed() {
    window.mainLoopTimeout = null;
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
.filter {
  margin-right:4px;
}
.flip-list-move {
  transition: transform 1s;
}
</style>
