<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div v-if="arbitrage">
    <h4>Balances</h4>
    <div class="row">
      <div class="col-md-3" v-for="(order, index) in arbitrage.orders" :key="index">
        <label class="font-weight-bold">
          {{ order.exchange && order.exchange.name || order.exchangeId }}
        </label>
        <br>
        <span v-if="order.side === 'buy'">
          {{ order.availableQuoteBalance }} {{ order.pair.quote }}
        </span>
        <span v-else-if="order.side === 'sell'">
          {{ order.availableBaseBalance  }} {{ order.pair.base }}
        </span>
      </div>
    </div>
    <br>
    <div class="row">
      <div class="col-md-6">
        <h4>Amount</h4>
        <div class="form-inline form-group" v-if="arbitrage.orders[0].side === 'buy'">
          <div class="input-group">
            <input v-model="arbitrage.startingAmount"
                   type="number"
                   class="form-control">
            <span class="input-group-append">
              <span class="input-group-text">{{ arbitrage.orders[0].pair.base }}</span>
              <button class="btn btn-outline-primary"
                      type="button" @click="execute">Execute</button>
            </span>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <h4>Steps</h4>
        <div v-for="(order, index) in arbitrage.orders" :key="index">
          <div>
            <span v-if="order.side === 'buy'">Buying</span>
            <span v-else-if="order.side === 'sell'">Selling</span>
            <span class="font-weight-bold">{{ order.amount }} {{ order.pair.base }}</span>
            on <span class="font-weight-bold">{{ order.exchange.name }}</span>
            for <span class="font-weight-bold">{{ order.quotedAmountString }}</span>
          </div>
        </div>
      </div>
    </div>
    <br>
    <div class="row">
      <div class="col-md-12">
        <h4>Details</h4>
        <div>
          Expected profit:
          <span :class="{ 'text-success': arbitrage.profit > 0,
                          'text-danger': arbitrage.profit < 0 }">
            <span class="font-weight-bold">
              {{ arbitrage.profit }} {{ arbitrage.profitCurrency }}
            </span>
            ({{ arbitrage.percent }}%)
          </span>
          <div v-for="order in arbitrage.orders">
            <span class="font-weight-bold">{{ order.exchange.name }}</span>
            {{ order.side }} price
            <span class="font-weight-bold">{{ order.price }}</span>
            <span v-if="settings.padLimitOrders">
              with <span class="font-weight-bold">
                {{ settings.limitOrderPaddingPercent }}%
              </span> padding
            </span>
          </div>
          <div class="text-warning" v-for="warning in arbitrage.bookWarnings">
            {{ warning }}
          </div>
        </div>
      </div>
    </div>
    <br>
    <h4 class="clickable" v-b-toggle.orderbooks @click="loadOrderBooks">
      Order Books
    </h4>
    <b-collapse id="orderbooks" visible>
      <table class="table table-striped scroll-x">
      <thead>
        <tr>
          <th colspan="2" v-for="order in arbitrage.orders">
            {{ order.exchange && order.exchange.name || order.exchangeId }}
            {{ order.side === 'buy' ? 'asks' : 'bids'  }}
          </th>
        </tr>
        <tr>
          <template v-for="index in arbitrage.orders.length"> <!-- eslint-disable-line -->
            <th>Amount</th>
            <th>Price</th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="index in orderbookDepth" :key="index">
          <template v-for="order in arbitrage.orders">
            <template v-if="order.book && order.book.error">
              <td>
                Error
              </td>
              <td>
                Error
              </td>
            </template>
            <template v-else-if="order.book">
              <td v-if="order.side === 'buy'">
                {{ order.book.asks[index] && order.book.asks[index][1] }}
                {{ order.pair.base }}
              </td>
              <td v-if="order.side === 'buy'">
                {{ order.book.asks[index] && precisionRound(order.book.asks[index][0], 8) }}
                {{ order.pair.quote }}
              </td>
              <td v-if="order.side === 'sell'">
                {{ order.book.bids[index] && order.book.bids[index][1] }}
                {{ order.pair.base }}
              </td>
              <td v-if="order.side === 'sell'">
                {{ order.book.bids[index] && precisionRound(order.book.bids[index][0], 8) }}
                {{ order.pair.quote }}
              </td>
            </template>
          </template>
        </tr>
      </tbody>
    </table>
    </b-collapse>
    <br>
    <h4 class="clickable" v-b-toggle.recent>Recent</h4>
    <b-collapse id="recent" visible>
      <p v-if="history.length === 0">
        No arbs executed yet
      </p>
      <div v-for="(arb, index) in history" :key="'arb-' + index">
        <h5 v-b-toggle="'#arb-info-' + index" class="clickable row hover-info">
          <div class="col-md-4">
            {{ new Date(arb.timestamp).toLocaleString() }}
          </div>
          <div class="col-md-2">
            <span class="badge" :class="{ 'badge-danger': arb.status === 'error',
                                          'badge-warning': arb.status === 'open',
                                          'badge-success': arb.status === 'closed' }">
              {{ capitalize(arb.status) }}
            </span>
          </div>
          <div class="col-md-3" :class="{
            'text-success': arb.actualProfit > 0 && arb.status === 'closed',
            'text-danger': arb.actualProfit < 0 || arb.status === 'error',
          }">
            <icon :icon="playIcon"
                   :transform="{ scale: 0.6, rotate: arb.actualProfit >= 0 ? 270 : 90}"
                   v-if="arb.status !== 'error'"/>
             {{ arb.status === 'error' ? 'error' : arb.actualProfit + ' ' + arb.profitCurrency }}
          </div>
        </h5>
        <b-collapse :id="'#arb-info-' + index">
          <table class="table">
            <thead>
              <tr>
                <th>Exchange</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Filled</th>
                <th>Limit Price</th>
                <th>Executed Price</th>
                <th>Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(order, index) in arb.orders" :key="'arb.arbId' + '-' + index">
                <td>
                  {{ exchangeStates[order.exchangeId] && exchangeStates[order.exchangeId].name }}
                </td>
                <td> {{ order.side }}</td>
                <td> {{ order.amount }} {{ order.pair.base }} </td>
                <td> {{ order.filled }} {{ order.pair.base }}</td>
                <td> {{ order.limitPrice }} {{ order.pair.symbol }}</td>
                <td> {{ order.executedPrice || 'N/A' }} {{ order.pair.symbol }}</td>
                <td> {{ order.cost }} {{ order.pair.quote }}</td>
                <td> {{ capitalize(order.status) || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </b-collapse>
      </div>
    </b-collapse>
  </div>
</template>
<script>
import Icon from '@fortawesome/vue-fontawesome';
import faPlay from '@fortawesome/fontawesome-free-solid/faPlay';
import faSync from '@fortawesome/fontawesome-free-solid/faSync';
import { mapGetters } from 'vuex';
import Spinner from '@/components/Spinner';
import Arbitrage from '@/models/Arbitrage';
import Order from '@/models/Order';
import { capitalize } from 'lodash';
import { precisionRound } from '@/utils';

export default {
  data() {
    return {
      arbitrage: new Arbitrage({ orders: this.arb.orders }),
      orderbookDepth: 5,
      booksLoaded: false,
      priceOverrides: []
    };
  },
  props: {
    arb: Object,
    manager: Object
  },
  computed: {
    ...mapGetters(['arbHistory', 'exchangeStates', 'settings']),
    playIcon() {
      return faPlay;
    },
    syncIcon() {
      return faSync;
    },
    history() {
      return this.arbHistory.filter(a => a.arbId === this.arbitrage.arbId && a.orders)
        .map(a => new Arbitrage({
          ...a,
          orders: a.orders.map(o => new Order({
            ...o,
            exchange: this.manager.exchanges[o.exchangeId]
          }))
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    }
  },
  methods: {
    precisionRound,
    capitalize,
    async loadOrderBooks() {
      this.booksLoaded = true;
      await Promise.all(this.arbitrage.orders.map(o => o.loadBook()));
      this.$forceUpdate();
    },
    async execute() {
      await this.arbitrage.execute();
      this.arbitrage.save();
      this.$forceUpdate();
    },
  },
  components: {
    Spinner,
    Icon
  },
  mounted() {
    this.loadOrderBooks();
  },
};
</script>
<style>
.table tbody .highlight td { background-color: whitesmoke; }
.scroll-x {
  overflow-x:auto;
}
</style>
