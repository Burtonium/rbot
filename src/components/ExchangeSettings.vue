<template>
<div class="wrapper">
  <div>
    <h1>{{ exchange.name }}</h1>
    <h3>Settings</h3>
    <div class="form-group">
      <div class="form-check">
        <input type="checkbox" class="form-check-input" id="enabledCheck" v-model="enabled">
        <label class="form-check-label" for="enabledCheck">Enabled</label>
      </div>
    </div>
    <h3>Credentials</h3>
    <div class="form-group"  v-if="exchange.requires.apiKey">
      <label>API key</label>
      <input class="input form-control" placeholder="API Key"
             v-model.lazy="key">
    </div>
    <div class="form-group" v-if="exchange.requires.secret">
      <label>Secret</label>
      <input class="input form-control"
             placeholder="Secret"
             v-model.lazy="secret"
             type="password">
    </div>
    <div class="form-group"  v-if="exchange.requires.login">
      <label>Login</label>
      <input class="input form-control" placeholder="Login" v-model.lazy="uid">
    </div>
    <div class="form-group" v-if="exchange.requires.password">
      <label>Password</label>
      <input class="input form-control"
             placeholder="Password"
             type="password"
             v-model.lazy="password">
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
import { capitalize } from 'lodash';
import { dateTimeString } from '@/utils';
import { fetchBalances } from '@/api';

const pendingExchange = {
  name: 'Pending',
  enabled: false,
  requires: {
    apiKey: false,
    secret: false,
    uid: false,
    password: false,
  },
};

const mapExchangeSettings = (settings) => {
  const res = {};
  settings.forEach((s) => {
    res[s] = {
      get() {
        return (this.$store.state.exchanges[this.exchangeId] || pendingExchange)[s];
      },
      set(value) {
        this.$store.dispatch('patchExchange', {
          [s]: value,
          id: this.exchangeId
        });
      }
    };
  });
  return res;
};

export default {
  data() {
    return {
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
      const result = fetchBalances(this.exchangeId);
      this.error = !result.success;
      if (result.success) {
        this.balances = result.balances;
      }
    },
  },
  computed: {
    ...mapExchangeSettings(['tradingFeePercent', 'enabled', 'key', 'secret', 'uid', 'password']),
    exchangeId() {
      return this.$route.params.id;
    },
    exchange() {
      return this.$store.state.exchanges[this.exchangeId] || pendingExchange;
    }
  },
  async mounted() {
    await this.$store.dispatch('fetchExchanges');
    await this.$forceUpdate();
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
