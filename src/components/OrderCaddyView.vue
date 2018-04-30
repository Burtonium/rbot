<template>
  <div class="wrapper" v-if="caddy">
    <h1>Caddy: {{ caddy.label }}</h1>
    <br>
    <h4 class="form-inline">Min Profitability Margin:
      <input class="form-control" v-model="caddy.minProfitabilityPercent"/>
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
        </tr>
      </thead>
      <tbody>
        <tr v-for="(market, index) in referenceMarkets" :key="index">
          <td>{{ market.exchange.name }}</td>
          <td>{{ +market.tickers[0].bid }}</td>
          <td>{{ +market.tickers[0].ask }}</td>
          <td>{{ dateTimeString(market.tickers[0].timestamp) }}</td>
        </tr>
      </tbody>
    </table>
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
          <td>{{ order.market.exchange.name }}</td>
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
              <td>{{ order.market.exchange.name }}</td>
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
import { fetchOrderCaddy } from '@/api';
import { capitalize } from 'lodash';
import { dateTimeString } from '@/utils';

export default {
  data() {
    return {
      caddy: null
    };
  },
  computed: {
    openTriggers() {
      return this.caddy ? this.caddy.triggers.filter(t => t.status === 'open') : [];
    },
    referenceMarkets() {
      return this.caddy ? this.caddy.referenceMarkets : [];
    },
    arbs() {
      return this.caddy ? this.caddy.triggers.filter(t => t.arbCycle).map(t => t.arbCycle) : [];
    }
  },
  methods: {
    capitalize,
    dateTimeString
  },
  async mounted() {
    this.caddy = await fetchOrderCaddy(this.$route.params.id);
  }
};
</script>
<style scoped>
  .wrapper {
    padding: 20px;
  }
</style>
