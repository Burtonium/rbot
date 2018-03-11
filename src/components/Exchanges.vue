<template>
  <div>
    <ul class="exchanges wrapper">
      <li v-for="(e, index) in exchangeStates" :key="index"
          @click="toggleExchangeAndTestApi(e.id)">
        <span class="badge"
              :class="{'badge-success': e.enabled, 'badge-danger': !e.enabled}">
          {{ e.name }}
        </span>
      </li>
    </ul>
    <br>
    <table class="table table-striped table-bordered" style="max-width:767.98px; margin:0 auto">
      <thead>
        <tr>
            <th></th>
            <th>Name</th>
            <th>API Status</th>
            <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(ex, key) in filteredExchanges" :key="key">
          <td>
            <a :href="ex.ccxt.urls.www">
              <img :src="ex.ccxt.urls.logo">
            </a>
          </td>
          <td>
            <a :href="ex.ccxt.urls.www">
              {{ ex.name }}
            </a>
          </td>
          <td v-if="typeof delays[ex.id] === 'undefined' && !ex.error"
              class="text-warning">
            Loading...
          </td>
          <td v-else-if="typeof ex.error === 'undefined'"
              class="text-success">
            Online ({{ delays[ex.id] }} ms)
          </td>
          <td v-else>
            <p class="text-danger">{{ ex.error.message }}</p>
          </td>
          <td>
            <router-link class="btn btn-primary" :to="'/exchanges/' + ex.id">
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
import { mapGetters, mapActions } from 'vuex';
import { wait } from '@/utils';

import ExchangeManager from '@/models/ExchangeManager';

export default {
  name: 'Home',
  data() {
    return {
      manager: {},
      delays: {}
    };
  },
  computed: {
    ...mapGetters([
      'getExchangeState',
      'exchangeStates',
      'getFilteredExchangeIdList',
      'getExchangeIdList',
    ]),
    filteredExchanges() {
      const xs = this.manager.exchanges || [];
      return Object.values(xs).filter(e => e.state.enabled);
    }
  },
  methods: {
    ...mapActions(['toggleExchange']),
    toggleExchangeAndTestApi(id) {
      this.toggleExchange({ id });
      this.testApi(id);
    },
    async testApi(exchangeId) {
      const ex = this.manager.exchanges[exchangeId];
      await ex.callApi('load_markets');
      await wait(ex.ccxt.rateLimit);
      if (!ex.markets) {
        ex.error = new Error('Could not load market');
        return;
      }
      const firstSymbol = Object.values(ex.markets)[0].symbol;
      if (!firstSymbol) {
        ex.error = new Error('Could not load symbols');
        return;
      }
      const start = new Date();
      await ex.callApi('fetch_ticker', firstSymbol);
      Vue.set(this.delays, ex.id, new Date() - start);
      this.$forceUpdate();
    }
  },
  mounted() {
    this.manager = new ExchangeManager();
    this.getFilteredExchangeIdList.forEach(this.testApi);
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
