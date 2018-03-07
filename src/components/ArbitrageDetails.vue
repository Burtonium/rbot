<template>
  <div v-if="arbitrage">
    <h4>Details</h4>
    <div class="form-inline form-group">
      Amount: &nbsp; <input v-model="arbitrage.startingAmount" type="number" class="form-control">
      &nbsp;&nbsp;{{ arbitrage.orders[0].pair.base }}
    </div>
    <div v-for="(order, index) in arbitrage.orders" class="form-inline form-group">
      {{ order.exchange && order.exchange.name || order.exchangeId }} {{ order.side }} price  &nbsp;
      <input v-model="order.price" class="form-control" type="number"> &nbsp; {{ order.pair.quote }}
    </div>
    <p>
      Expected profit: {{ arbitrage.profit }} {{ arbitrage.profitCurrency }} ({{ arbitrage.percent }}%) <br>
    </p>
    <h4>Order books <button class="btn btn-primary" @click="loadOrderBooks">Fetch</button></h4>
    <table class="table table-striped" v-if="booksLoaded">
      <thead>
        <tr>
          <th colspan="2" v-for="(order, index) in arbitrage.orders" :key="order.index">
            {{ order.exchange && order.exchange.name || order.exchangeId }} {{ order.side }}
          </th>
        </tr>
        <tr>
          <template v-for="(order, index) in arbitrage.orders">
            <th>Amount</th>
            <th>Price</th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="index in orderbookDepth">
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
                {{ order.book.asks[index] && order.book.asks[index][1] }} {{ order.pair.base }}
              </td>
              <td v-if="order.side === 'buy'">
                {{ order.book.asks[index] && order.book.asks[index][0] }} {{ order.pair.quote }}
              </td>
              <td v-if="order.side === 'sell'">
                {{ order.book.bids[index] && order.book.bids[index][1] }} {{ order.pair.base }}
              </td>
              <td v-if="order.side === 'sell'">
                {{ order.book.bids[index] && order.book.bids[index][0] }} {{ order.pair.quote }}
              </td>
            </template>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import Spinner from '@/components/Spinner';
import Arbitrage from '@/models/Arbitrage';

export default {
  data() {
    return{
      arbitrage: new Arbitrage({ orders: this.arb.orders }),
      orderbookDepth: 5,
      booksLoaded: this.arb.orders[0].book,
      priceOverrides: []
    };
  },
  props: {
    arb: Object
  },
  methods: {
    async loadOrderBooks() {
      this.booksLoaded = true;
      await Promise.all(this.arbitrage.orders.map(o => o.loadBook()));
      this.$forceUpdate();
    }
  },
  components: {
    Spinner
  },
  mounted() {
    this.priceOverrides = this.arbitrage.orders.map(o => ({
      name: o.exchange.name,
      side: o.side,
      price: o.price
    }))
  }
};
</script>