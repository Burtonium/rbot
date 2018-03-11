<template>
  <div>
    <div v-if="arbHistory.length === 0">
      <p>No arbs executed yet.</p>
    </div>
    <div v-else>
      <button class="btn btn-primary" @click="clearHistory">Clear History</button>
      <br>
      <br>
      <div class="card arbitrage-card" v-for="(arb, index) in history" :key="index">
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <h1 class="card-title">
                {{ new Date(arb.timestamp).toLocaleString() }}
              </h1>
            </div>
          </div>
          <br>
          <table class="table table-bordered">
            <thead>
              <tr>
                  <th>Exchange</th>
                  <th>Order</th>
                  <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(order, index) in arb.orders" :key="index">
                <td>
                  <router-link :to="'/exchanges/' + order.exchangeId">
                    {{ manager.exchanges[order.exchangeId].name }}
                  </router-link>
                </td>
                <td v-if="order.side === 'buy'">
                  Bought {{ order.amount }} {{ order.pair.base }}
                  for {{ precisionRound(order.amount * order.limitPrice, 8) }}
                  {{ order.pair.quote }}
                </td>
                <td v-else-if="order.side === 'sell'">
                  Sold {{ order.amount }} {{ order.pair.base }}
                  for {{ precisionRound(order.amount * order.limitPrice, 8) }}
                  {{ order.pair.quote }}
                </td>
                <td>
                  {{ new Date(order.timestamp).toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
          <div class="text-danger" v-for="order in arb.orders" :key="order.id">
            <span v-if="order.error">Error: {{ order.error }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ExchangeManager from '@/models/ExchangeManager';
import { mapGetters } from 'vuex';
import { precisionRound } from '@/utils';
import store from '@/store';
import * as types from '@/store/mutation_types';

export default {
  data() {
    return {
      manager: new ExchangeManager()
    };
  },
  computed: {
    ...mapGetters(['arbHistory']),
    history() {
      return this.arbHistory.concat().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  },
  methods: {
    precisionRound,
    clearHistory() {
      store.commit(types.CLEAR_ARBITRAGE_HISTORY);
    }
  }
};
</script>
<style scoped>
.arbitrage-card {
  margin-bottom: 20px;
}
</style>
