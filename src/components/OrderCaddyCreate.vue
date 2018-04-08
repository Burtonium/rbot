<template>
  <div>
  <br>
    <div v-if="success">
      <checkmark></checkmark>
      <p class="text-center">Order caddy was successfully created.
        <a href="##" @click="clearCaddy">
          Add another?
        </a>
      </p>
    </div>
    <div v-else>
      <h4>Caddy Label</h4>
      <div class="form-group form-inline">
        <input class="form-control" v-model="caddy.label"/>
      </div>
      <h4>Minimum Profitability Margin</h4>
      <div class="form-group form-inline">
        <input class="form-control"
               v-model="caddy.minProfitabilityPercent"
               type="number"
               min="0"
               max="1000"/>
      </div>
      <h4>Pair</h4>
      <div class="form-group form-inline">
        <v-select :options="pairs" v-model="pair"/>
      </div>
      <div v-if="pair">
        <h4>Reference Exchanges</h4>
        <div class="form-group form-inline">
          <v-select :options="marketOptions" v-model="market"/>
        </div>
        <h5 v-if="caddy.referenceMarkets.length">
          <span class="badge clickable"
                :class="{'badge-success': hover !== market, 'badge-danger': hover === market }"
                v-for="(market, index) of caddy.referenceMarkets"
                :key="index"
                @mouseover="hover = market"
                @mouseout="hover = null"
                @click="removeReference(market)">
            {{ market.exchange.name }}
          </span>
        </h5>
        <div v-if="caddy.referenceMarkets.length > 0">
          <h4>Trigger Orders</h4>
          <div class="form-inline">
            <h5>Side: &nbsp;</h5>
            <select v-model="side" class="form-control">
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <template v-if="side">
              &nbsp;&nbsp;
              <h5>Exchange: &nbsp;</h5>
              <v-select v-model="trigger" :options="triggerMarketOptions"></v-select>
              &nbsp;&nbsp;
              <div class="input-group">
                <input class="form-control" v-model="amount" type="number"/>
                <div class="input-group-append">
                  <span class="input-group-text">{{ triggerAmountCurrency }}</span>
                </div>
              </div>
              &nbsp;&nbsp;
              <button class="btn btn-primary" @click="addTrigger">Add</button>
            </template>
          </div>

          <br>
          <h5 v-if="caddy.triggerMarkets.length">
            <span class="badge clickable"
                  :class="{'badge-success': hover2 !== market, 'badge-danger': hover2 === market }"
                  v-for="(market, index) of caddy.triggerMarkets"
                  :key="index"
                  @mouseover="hover2 = market"
                  @mouseout="hover2 = null"
                  @click="removeTrigger(market)">
              {{ market.exchange.name }} {{ market.side }}
            </span>
          </h5>
          <br>
          <button class="btn btn-primary"
                  :class="{ disabled: !caddy.triggerMarkets.length }"
                  :disabled="!caddy.triggerMarkets.length" @click="createOrderCaddy">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Checkmark from '@/components/Checkmark';
import { fetchExchanges, createCaddy } from '@/api';
import { flatten, sortedUniqBy, sortBy } from 'lodash';
import { mapGetters } from 'vuex';

export default {
  components: {
    Checkmark
  },
  data() {
    return {
      success: false,
      pair: null,
      exchanges: [],
      market: null,
      allMarkets: [],
      hover: null,
      hover2: null,
      trigger: null,
      side: '',
      amount: 0,
      caddy: {
        label: '',
        referenceMarkets: [],
        triggerMarkets: []
      }
    };
  },
  watch: {
    pair() {
      this.caddy.referenceMarkets = [];
      this.caddy.triggerMarkets = [];
    },
    market() {
      const market = this.allMarkets.find(m => m.id === this.market.value);
      if (market && !this.caddy.referenceMarkets.includes(market)) {
        this.caddy.referenceMarkets.push(market);
      }
    }
  },
  computed: {
    ...mapGetters(['getFilteredExchangeIdList']),
    pairs() {
      const pairs = this.allMarkets.map(m => ({
        label: m.pair.label,
        value: m.pair.id
      }));
      return sortedUniqBy(sortBy(pairs, [p => p.label]), p => p.label);
    },
    marketOptions() {
      return this.markets.map(m => ({ label: m.exchange.name, value: m.id }));
    },
    triggerMarketOptions() {
      return this.marketOptions.filter(mo =>
        !this.caddy.referenceMarkets.find(rm => rm.id === mo.value, 10));
    },
    triggerAmountCurrency() {
      const match = /([A-Z]{2,})\/([A-Z]{2,})/.exec(this.pair.label);
      return match && match[1];
    },
    markets() {
      return this.allMarkets.filter(m => this.pair && m.pair.id === this.pair.value, 10);
    },
    selectedReferenceExchanges() {
      return this.markets.map(m => m.exchange.name);
    }
  },
  methods: {
    removeReference(value) {
      const rm = this.caddy.referenceMarkets;
      rm.splice(rm.indexOf(value), 1);
    },
    removeTrigger(value) {
      const tm = this.caddy.triggerMarkets;
      tm.splice(tm.indexOf(value), 1);
    },
    addTrigger() {
      const trigger = this.allMarkets.find(m => m.id === this.trigger.value);
      if (trigger &&
          !this.caddy.triggerMarkets.find(tm => tm.id === trigger.id && tm.side === this.side)) {
        this.caddy.triggerMarkets.push({ ...trigger, side: this.side, amount: this.amount });
      }
    },
    async createOrderCaddy() {
      const { success } = await createCaddy(this.caddy);
      if (success) {
        this.success = true;
      }
    },
    clearCaddy() {
      this.caddy = {
        referenceMarkets: [],
        triggerMarkets: []
      };
      this.trigger = null;
      this.pair = null;
      this.market = null;
      this.success = false;
    }
  },
  async mounted() {
    console.log('Mounted');
    this.exchanges = (await fetchExchanges())
      .filter(e => this.getFilteredExchangeIdList.includes(e.ccxtId));
    this.allMarkets = flatten(this.exchanges.map(e => e.markets));
  }
};
</script>
<style scoped>
.badge {
  margin-right:4px;
}
</style>
