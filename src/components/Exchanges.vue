<template>
  <div>
    <ul class="exchanges wrapper">
      <li v-for="(enabled, id) in enabledExchanges" :key="id"  @click="toggleExchange(id)">
        <span v-if="exchanges[id]" class="badge" :class="{'badge-success': enabled,
                                     'badge-danger': !enabled}">
          {{ exchanges[id].name }}
        </span>
      </li>
    </ul>
    <br>
    <table class="table table-striped table-bordered" style="max-width:767.98px; margin:0 auto">
      <thead>
        <tr>
            <th></th>
            <th>Name</th>
            <th>Status</th>
            <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(exchange, key) in filteredExchanges" :key="key">
          <td>
            <a :href="exchange.urls.www">
              <img :src="exchange.urls.logo">
            </a>
          </td>
          <td>
            <a :href="exchange.urls.www">
              {{ exchange.name }}
            </a>
          </td>
          <td v-if="!exchange.markets && !exchange.marketLoadError"
              class="text-warning">
            Loading...
          </td>
          <td v-else-if="!exchange.marketLoadError && exchange.symbols"
              class="text-success" :data-delay="exchange.apiDelay">
            Online ({{ exchange.apiDelay }} ms)
          </td>
          <td v-else-if="exchange.marketLoadError">
            <p class="text-danger">{{ exchange.marketLoadError.message }}</p>
          </td>
          <td>
            <router-link class="btn btn-primary" :to="'/exchanges/' + exchange.id">
              Settings
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import Vue from 'vue';
import ccxt from 'ccxt';

let enabled = null;
try {
  enabled = JSON.parse(localStorage.getItem('ARBBOT_ENABLED'));
} catch (e) {
  // ERROR
}

if (!enabled) {
  enabled = {};
  ccxt.exchanges.forEach((exchange) => {
    enabled[exchange] = false;
  });
}

export default {
  name: 'Home',
  data() {
    return {
      exchangeNames: ccxt.exchanges,
      exchanges: {},
      enabledExchanges: enabled
    };
  },
  computed: {
    filteredExchanges() {
      return Object.values(this.exchanges).filter(e => this.enabledExchanges[e.id]);
    }
  },
  methods: {
    toggleExchange(id) {
      this.enabledExchanges[id] = !this.enabledExchanges[id];

      localStorage.setItem('ARBBOT_ENABLED', JSON.stringify(this.enabledExchanges));
      this.loadMarket(this.exchanges[id]);
    },
    async loadMarket(exchange) {
      if (!exchange.has.cors) {
        exchange.proxy = 'https://cors-anywhere.herokuapp.com/';
      }
      exchange.loadingMarkets = true;
      const started = new Date();
      try {
        await exchange.loadMarkets(true);
      } catch (e) {
        exchange.marketLoadError = e;
      }
      const ended = new Date();
      exchange.apiDelay = ended - started;
      this.$forceUpdate();
    },
    loadMarkets() {
      this.filteredExchanges.forEach(this.loadMarket);
    }
  },
  mounted() {
    const exchanges = this.exchangeNames;
    exchanges.forEach(async (exchange) => {
      const ex = new ccxt[exchange]();
      Vue.set(this.exchanges, exchange, ex);
    });
    this.loadMarkets();
  }
};
</script>

<style>
.exchanges {
  text-align:center;
}
.exchanges li {
  display:inline-block;
  cursor:pointer;
  margin: 0 2px;
}
</style>
