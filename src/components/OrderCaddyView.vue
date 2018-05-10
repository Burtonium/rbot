<template>
  <div class="wrapper" v-if="caddy">
    <h1 class="form-inline">Caddy:
      <input class="form-control" v-model.lazy="caddy.label" v-on:change="update"/>
    </h1>
    <button @click="toggleActive"
      :class="{'badge-success': caddy.active, 'badge-danger': !caddy.active}">
      {{ caddy.active ? "Active" : "Disabled" }}
    </button>
    <br>
    <h4 class="form-inline">Min Profitability Margin:
      <input class="form-control" v-model.lazy="caddy.minProfitabilityPercent"
        v-on:change="update"/>
    </h4>
    <br>
    <h4>Reference Markets</h4>
    <table class="table table-striped table-bordered orders">
      <thead>
        <tr>
          <th>Exchange</th>
          <th>Bid</th>
          <th>Ask</th>
          <th>Last Updated</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(market, index) in referenceMarkets" :key="index">
          <td>{{ market.exchange.name }}</td>
          <td>{{ +market.tickers[0].bid }}</td>
          <td>{{ +market.tickers[0].ask }}</td>
          <td>{{ dateTimeString(market.tickers[0].timestamp) }}</td>
          <td><button @click="removeReferenceMarket(index)">-</button></td>
        </tr>
      </tbody>
    </table>
    <div class="form-group form-inline">
      <v-select :options="referenceMarketOptions" v-model="referenceMarket"/>
    </div>
    <br>
    <h4>Trigger Markets</h4>
    <table class="table table-striped table-bordered orders">
      <thead>
        <tr>
          <th>Exchange</th>
          <th>Side</th>
          <th>Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(market, index) in triggerMarkets" :key="index">
          <td>{{ market.exchange.name }}</td>
          <td>
            <select v-model="market.side" class="form-control"
              @change="update(caddy)">
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </td>
          <td>
            <input class="form-control" v-model.lazy="market.amount" type="number"
              @change="update(caddy)"/>
          </td>
          <td><button @click="removeTriggerMarket(index)">-</button></td>
        </tr>
      </tbody>
    </table>
    <div class="form-group form-inline">
      <v-select :options="triggerMarketOptions" v-model="triggerMarket"/>
      <div v-if="triggerMarket" class="form-group form-inline">
        <select v-model="side" class="form-control">
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <span v-if="side" class="input-group">
          <input class="form-control" v-model="amount" type="number"/>
          <button v-if="amount>0" @click="addTriggerMarket">Add</button>
        </span>
      </div>
    </div>
    <br>
    <h4>Open Triggers</h4>
    <table class="table table-striped table-bordered orders">
      <thead>
        <tr>
          <th>Exchange</th>
          <th>Amount</th>
          <th>Price</th>
          <th>Created at</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(order, index) in openTriggers" :key="index">
          <td>{{ order.market.exchange.name || 'Pending' }}</td>
          <td>{{ +order.amount }} </td>
          <td>{{ +order.limitPrice }} </td>
          <td>{{ dateTimeString(order.createdAt) }}</td>
        </tr>
      </tbody>
    </table>
    <br>
    <h4>Arbitrage</h4>
    <div class="card" v-for="arb in arbs" :key="arb.id">
      <div class="card-body">
        <table class="table table-striped table-bordered orders">
          <thead>
            <tr>
              <th>Exchange</th>
              <th>Status</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Price</th>
              <th>Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(order, index) in arb.orders" :key="index">
              <td>{{ order.market.exchange.name || 'Pending' }}</td>
              <td>{{ order.status }}</td>
              <td>{{ capitalize(order.type) }} {{ order.side }}</td>
              <td>{{ +order.amount }} </td>
              <td>{{ +order.price }} </td>
              <td>{{ dateTimeString(order.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
import { fetchOrderCaddy, patchCaddy, fetchMarkets } from '@/api';
import { capitalize } from 'lodash';
import { dateTimeString } from '@/utils';

export default {
  data() {
    return {
      caddy: null,
      exchanges: [],
      allMarkets: [],
      referenceMarket: null,
      triggerMarket: null,
      side: '',
      amount: 0
    };
  },
  watch: {
    referenceMarket() {
      this.addReferenceMarket();
    }
  },
  computed: {
    openTriggers() {
      return this.caddy ? this.caddy.triggers.filter(t => t.status === 'open') : [];
    },
    referenceMarkets() {
      return this.caddy ? this.caddy.referenceMarkets : [];
    },
    triggerMarkets() {
      return this.caddy ? this.caddy.triggerMarkets : [];
    },
    arbs() {
      return this.caddy ? this.caddy.triggers.filter(t => t.arbCycle).map(t => t.arbCycle) : [];
    },
    marketOptions() {
      return this.markets.map(m => ({ label: m.exchange.name, value: m.id }));
    },
    markets() {
      return this.allMarkets.filter(m => m.pair.id === this.caddy.pair.id, 10);
    },
    referenceMarketOptions() {
      return this.marketOptions.filter(m =>
        !this.caddy.referenceMarkets.find(rm => rm.id === m.value));
    },
    triggerMarketOptions() {
      return this.marketOptions.filter(m =>
        !this.caddy.triggerMarkets.find(tm => tm.id === m.value));
    }
  },
  methods: {
    capitalize,
    dateTimeString,
    async update(caddyGraph) {
      if (!(caddyGraph.label.length
          && caddyGraph.referenceMarkets.length
          && caddyGraph.triggerMarkets.length)) {
        caddyGraph.active = false;
      }
      this.caddy = (await patchCaddy(caddyGraph)).caddy;
    },
    toggleActive() {
      this.caddy.active = !this.caddy.active;
      this.update(this.caddy);
    },
    addReferenceMarket() {
      const market = this.markets.find(m => m.id === this.referenceMarket.value);
      if (market) {
        if (!this.caddy.referenceMarkets.find(m => m.id === market.id)) {
          const upsert = { ...this.caddy };
          // clone array
          upsert.referenceMarkets = this.caddy.referenceMarkets.slice(0);
          upsert.referenceMarkets.push(market);
          this.update(upsert);
        }
      }
    },
    addTriggerMarket() {
      const market = this.markets.find(m => m.id === this.triggerMarket.value);
      if (market) {
        const upsert = { ...this.caddy };
        // clone array
        upsert.triggerMarkets = this.caddy.triggerMarkets.slice(0);
        upsert.triggerMarkets.push({
          side: this.side,
          amount: this.amount,
          id: market.id,
        });
        this.triggerMarket = null;
        this.side = '';
        this.amount = 0;
        this.update(upsert);
      }
    },
    removeReferenceMarket(index) {
      this.caddy.referenceMarkets.splice(index, 1);
      this.update(this.caddy);
    },
    removeTriggerMarket(index) {
      this.caddy.triggerMarkets.splice(index, 1);
      this.update(this.caddy);
    }
  },
  async mounted() {
    this.caddy = await fetchOrderCaddy(this.$route.params.id);
    this.allMarkets = await fetchMarkets();
  }
};
</script>
<style scoped>
  .wrapper {
    padding: 20px;
  }
</style>
