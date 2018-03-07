<template>
  <div class="container">
    <h4>Balance Filters</h4>
    <div class="form-check">
      <input class="form-check-input"
             type="checkbox"
             name="balances"
             :checked="filters.hasBalances && filters.hasBalances.enabled"
             @change="TOGGLE_FILTER('hasBalances')">
      <label>Filter arbitrages that don't have balances</label>
    </div>
    <div class="form-check">
      <input class="form-check-input"
             type="checkbox"
             name="balances"
             :checked="filters.sufficientBalances && filters.sufficientBalances.enabled"
             @change="TOGGLE_FILTER('sufficientBalances')">
      <label>Filter arbitrages that have insufficient balances</label>
    </div>

    <list-filter title="Exclusive Currency Filter"
                 filter-key="exclusiveCurrencyFilter"
                 :options="currencies" />
    <h4>Exchange Filters</h4>
    <div class="form-group form-inline">
      <v-select :options="exchangeLabels" v-model="exchangeSelector"></v-select>
    </div>
    <h5 v-if="exchangeSelector">
      Symbols
      <span class="text-muted small">
        ({{ filteredPairs.length }} of {{ exchange.pairs.length }})
      </span>
      <br>
      <span class="badge clickable"
            :class="{'badge-success': !filteredSymbols.has(pair.symbol),
                     'badge-danger' : filteredSymbols.has(pair.symbol)}"
            v-for="(pair, index) in filteredPairs"
            :key="index"
            @click="toggleExchangeFilter(pair.symbol)">
        {{ pair.symbol }}
      </span>
    </h5>
    <button class="btn btn-primary" @click="CLEAR_FILTERS">
      Clear Filters
    </button>
  </div>
</template>
<script>
import { mapGetters, mapMutations, mapActions } from 'vuex';
import assert from 'assert';
import * as types from '@/store/mutation_types';
import ListFilter from '@/components/ListFilter';
import Exchange from '@/models/Exchange';

export default {
  data() {
    return {
      exclusiveCurrencyFilter: null,
      exchangeSelector: null,
      exchange: null
    };
  },
  watch: {
    exchangeSelector() {
      if (!this.exchangeSelector) {
        return;
      }
      const id = this.exchangeSelector.value;
      this.exchange = id ? new Exchange(id) : null;
      if (this.exchange) {
        this.exchange.ccxt.loadMarkets().then(() => { this.$forceUpdate(); });
      }
    }
  },
  computed: {
    ...mapGetters(['filters', 'currencies', 'getFilteredExchangeStates']),
    exchangeLabels() {
      return this.getFilteredExchangeStates.map(e => ({ label: e.name, value: e.id }));
    },
    pairs() {
      return this.exchange ? this.exchange.pairs : [];
    },
    filteredCurrencyList() {
      const f = this.filters.exclusiveCurrencyFilter || {};
      return new Set((f.data || {}).list || []);
    },
    filteredPairs() {
      const c = this.filteredCurrencyList;
      const filterIsOn = c.size > 0;
      return filterIsOn ? this.pairs.filter(p => c.has(p.quote) && c.has(p.base)) : this.pairs;
    },
    filteredSymbols() {
      const filter = this.filters.exchanges || {};
      const data = filter.data || {};
      const id = this.exchange ? this.exchange.id : null;
      return data[id] ? new Set(data[id].symbols) : new Set();
    }
  },
  methods: {
    ...mapMutations([
      types.TOGGLE_FILTER,
      types.TOGGLE_FILTER_ON,
      types.SET_FILTER_DATA,
      types.CLEAR_FILTERS
    ]),
    ...mapActions(['addExchangeFilter', 'removeExchangeFilter']),
    toggleExchangeFilter(symbol) {
      assert(this.exchange, 'Exchange is required');
      const filtered = this.filteredSymbols;
      if (filtered.has(symbol)) {
        this.removeExchangeFilter({ exchangeId: this.exchange.id, symbol });
      } else {
        this.addExchangeFilter({ exchangeId: this.exchange.id, symbol });
      }
    }

  },
  components: {
    ListFilter
  }
};
</script>
<style scoped>
.form-control {
  width:auto;
  display:inline-block;
}
.badge {
  margin-right:4px;
}
</style>
