<template>
  <div class="wrapper">
    <div class="container">
      <div class="row text-center">
        <div class="col-md-3">Engine status: Online</div>
        <div class="col-md-3">Active Pairs: 34</div>
        <div class="col-md-3"></div>
        <div class="col-md-3"></div>
      </div>
      <p class="text"></p>
    </div>
    <br>
    <div class="card">
      <div class="card-body">
        <div class="row">
          <h1 class="card-title col-md-8">
            Arb #1
          </h1>
          <div class="col col-md-4 text-right text-success">
            <h1 class="card-subtitle">
              4.86%
            </h1>
            <h6>928.00$ CAD</h6>
          </div>
        </div>
        <table class="table table-bordered">
          <thead>
            <tr>
                <th>Exchange</th>
                <th>Order</th>
                <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Binance</td>
              <td>Buy 9323$ CAD for 1.1 BTC</td>
              <td>Not executed</td>
            </tr>
            <tr>
              <td>Bitmex</td>
              <td>Sell 1.1 BTC for 8.2 ETH</td>
              <td>Not executed</td>
            </tr>
            <tr>
              <td>QuadrigaCX</td>
              <td>Sell 8.2 ETH for 10251$ CAD</td>
              <td>Not executed</td>
            </tr>
          </tbody>
        </table>
        <div class="form-group">
          <button class="btn btn-primary float-right">Execute</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ccxt from 'ccxt';
import ArbEngine from '../arbengine';

let enabledExchanges = null;
try {
  enabledExchanges = JSON.parse(localStorage.getItem('ARBBOT_ENABLED'));
} catch (e) {
  // ERROR
}

if (!enabledExchanges) {
  enabledExchanges = {};
  ccxt.exchanges.forEach((exchange) => {
    enabledExchanges[exchange] = false;
  });
}

const exchanges = Object.entries(enabledExchanges)
  .filter(args => args[1])
  .map(args => new ccxt[args[0]]({ proxy: 'https://cors-anywhere.herokuapp.com/' }));

const engine = new ArbEngine(exchanges);

export default {
  data() {
    return {
      exchanges,
      engine
    };
  },
  mounted() {
    this.engine.init();
  }
};
</script>
<style scoped>
  body {
    text-align: left;
  }
</style>
