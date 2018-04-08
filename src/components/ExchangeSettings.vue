<template>
<div class="wrapper">
  <div>
    <h1>{{ exchange.name }}</h1>
    <p>Countries: {{ exchange.countries ? exchange.countries.join(', ') : 'none'}}</p>
    <h3>Settings</h3>
    <div class="form-group form-inline">
      Trading Fee Percent &nbsp;
      <div class="input-group">
        <input class="form-control" type="number" min="0" max="100" v-model="tradingFeePercent"/>
        <span class="input-group-append">
          <span class="input-group-text">%</span>
        </span>
      </div>
    </div>
    <h3>Credentials</h3>
    <div class="form-group"  v-if="exchange.requires.apiKey">
      <label>API key</label>
      <input class="input form-control" placeholder="API Key"
             v-model="exchange.apiKey">
    </div>
    <div class="form-group" v-if="exchange.requires.secret">
      <label>Secret</label>
      <input class="input form-control"
             placeholder="Secret"
             v-model="exchange.secret">
    </div>
    <div class="form-group"  v-if="exchange.requires.login">
      <label>Login</label>
      <input class="input form-control" placeholder="Login" :required="exchange.requires.login">
    </div>
    <div class="form-group" v-if="exchange.requires.password">
      <label>Password</label>
      <input class="input form-control" placeholder="Password" type="password">
    </div>
    {{ exchange.orders }}
    <h3>Orders</h3>
    <table class="table table-striped table-bordered orders">
      <thead>
        <tr>
            <th>Symbol</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Price</th>
            <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(order, index) in exchange.orders" :key="index">
          <td>{{ order.symbol }}</td>
          <td>{{ capitalize(order.type) }} {{ order.side }}</td>
          <td>{{ order.amount }} </td>
          <td>{{ order.price }} </td>
          <td>{{ dateTimeString(order.timestamp) }}</td>
        </tr>
      </tbody>
    </table>
    <h3>Balances</h3>
    <div v-if="error" class="text-danger">
      Error. Recheck your credentials.
    </div>
    <div v-else-if="balances">
      <table class="table table-striped table-bordered">
        <thead>
          <tr>
              <th>Coin</th>
              <th>Available Balance</th>
              <th>Total Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(balance, index) in balances" :key="index">
            <td>{{ balance.code }}</td>
            <td>{{ balance.available }}</td>
            <td>{{ balance.total }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="balance">
      <button class="btn btn-primary" @click="fetchBalances">Fetch</button>
    </div>
  </div>
</div>
</template>
<script>
import Exchange from '@/models/Exchange';
import * as types from '@/store/mutation_types';
import { capitalize } from 'lodash';
import { dateTimeString } from '@/utils';

const mapExchangeSettings = (settings) => {
  const res = {};
  settings.forEach((s) => {
    res[s] = {
      get() { return this.$store.state.exchanges[this.exchange.id][s]; },
      set(value) {
        this.$store.commit(types.PATCH_EXCHANGE, {
          field: { key: s, value },
          id: this.exchange.id
        });
      }
    };
  });
  return res;
};

export default {
  data() {
    return {
      exchange: new Exchange(this.$route.params.id),
      balances: null,
      error: null,
      quoteRate: null,
      order: null
    };
  },
  methods: {
    capitalize,
    dateTimeString,
    pair(string) {
      const match = /^(.+)\/(.+)$/.exec(string);
      return { base: match[1], quote: match[2] };
    },
    async fetchBalances() {
      const e = this.exchange;
      this.balances = await e.fetchBalances();
      this.error = e.error ? e.error.message : null;
    },
  },
  computed: {
    ...mapExchangeSettings(['tradingFeePercent'])
  },
  async mounted() {
    this.exchange.verbose = true;
    this.balances = await this.exchange.fetchBalances();
    this.$forceUpdate();
  }
};
</script>
<style scoped>
  .wrapper {
    max-width: 724px;
    margin: 0 auto;
  }

  input {
    text-align: center
  }

  ::-webkit-input-placeholder {
    text-align: center;
  }

  :-moz-placeholder {
    /* Firefox 18- */
    text-align: center;
  }

  ::-moz-placeholder {
    /* Firefox 19+ */
    text-align: center;
  }

  :-ms-input-placeholder {
    text-align: center;
  }
</style>
