import Vue from 'vue';
import assert from 'assert';
import { patchExchange, fetchExchanges } from '@/api';
import * as types from './mutation_types';

export default {
  clearStorage({ commit }) {
    commit(types.CLEAR_STORAGE);
  },
  toggleExchange({ commit }, { id }) {
    commit(types.TOGGLE_EXCHANGE, id);
  },
  addItemToListFilter({ commit, state }, { key, item }) {
    assert(item, 'Item required');
    commit(types.TOGGLE_FILTER_ON, key);
    if (!state.filters[key].data) {
      state.filters[key].data = {};
    }
    const data = state.filters[key].data;
    Vue.set(data, 'list', data.list || []);
    if (!data.list.includes(item)) {
      data.list.push(item);
    }
    commit(types.SET_FILTER_DATA, { data, key });
  },
  removeItemFromListFilter({ commit, state }, { key, item }) {
    assert(item, 'Item required');
    const data = state.filters[key].data || {};
    Vue.set(data, 'list', data.list || []);
    const index = data.list.indexOf(item);
    data.list.splice(index, 1);
    if (data.list.length === 0) {
      commit(types.TOGGLE_FILTER_OFF, key);
    }
    commit(types.SET_FILTER_DATA, { data, key });
  },
  addExchangeFilter({ commit, state }, { exchangeId, symbol }) {
    commit(types.TOGGLE_FILTER_ON, 'exchanges');
    const filter = state.filters.exchanges;
    Vue.set(filter, 'data', filter.data || {});
    Vue.set(filter.data, exchangeId, filter.data[exchangeId] || {});
    Vue.set(filter.data[exchangeId], 'symbols', filter.data[exchangeId].symbols || []);
    const symbols = filter.data[exchangeId].symbols;
    if (!symbols.includes(symbol)) {
      symbols.push(symbol);
    }
    commit(types.SET_FILTER_DATA, { key: 'exchanges', data: filter.data });
  },
  removeExchangeFilter({ commit, state }, { exchangeId, symbol }) {
    const filter = state.filters.exchanges;
    const symbols = ((filter.data || {})[exchangeId] || {}).symbols || [];
    const index = symbols.indexOf(symbol);
    symbols.splice(index, 1);
    commit(types.SET_FILTER_DATA, { key: 'exchanges', data: filter.data });
  },
  async fetchExchanges({ commit }) {
    const exchanges = await fetchExchanges();
    commit(types.SET_EXCHANGES, exchanges);
  },
  async patchExchange({ commit }, args) {
    const { success, exchange } = await patchExchange(args);
    if (success) {
      commit(types.ASSIGN_EXCHANGE_STATE, exchange);
    }
  }
};
