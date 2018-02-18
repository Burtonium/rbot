<template>
<div class="wrapper">
  <div>
    <h1>{{ exchange.name }}</h1>
    <p>{{ exchange }}</p>
    <p v-if="!exchange.marketLoadError">Api delay time: {{ exchange.apiDelay }} ms</p>
    <p v-else>Error: {{ exchange.marketLoadError.message }}</p>
    <p>Countries: {{ countries ? countries.join(', ') : 'none'}}</p>
    <div class="form-group" v-if="exchange.has && exchange.has.publicAPI">
      <input class="input form-control" placeholder="Public API Key">
    </div>
    <div class="form-group" v-if="exchange.has && exchange.has.privateAPI">
      <input class="input form-control" placeholder="Private API Key" type="password">
    </div>
    <div class="form-group"
         v-if="exchange.requiredCredentials && exchange.requiredCredentials.login">
      <input class="input form-control" placeholder="Username">
    </div>
    <div class="form-group"
         v-if="exchange.requiredCredentials && exchange.requiredCredentials.password">
      <input class="input form-control" placeholder="Password" type="password">
    </div>
    <div class="form-group">
      <button class="btn btn-info">Save</button>
    </div>
  </div>
</div>
</template>
<script>
import ccxt from 'ccxt';

export default {
  data() {
    return {
      exchange: {}
    };
  },
  computed: {
    countries() {
      let e = [];
      if (this.exchange.countries instanceof Array) {
        e = this.exchange.countries;
      } else if (typeof this.exchange.countries === 'string') {
        e = [this.exchange.countries];
      }
      return e;
    }
  },
  methods: {
    async loadMarket() {
      this.exchange.proxy = 'https://cors-anywhere.herokuapp.com/';
      this.exchange.loadingMarkets = true;
      const started = new Date();
      try {
        // await this.exchange.loadMarkets(true);
      } catch (e) {
        this.exchange.marketLoadError = e;
      }
      const ended = new Date();
      this.exchange.apiDelay = ended - started;

      this.$forceUpdate();
    }
  },
  mounted() {
    this.exchange = new ccxt[this.$route.params.id]();
    this.loadMarket();
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

:-moz-placeholder { /* Firefox 18- */
   text-align: center;
}

::-moz-placeholder {  /* Firefox 19+ */
   text-align: center;
}

:-ms-input-placeholder {
   text-align: center;
}
</style>
