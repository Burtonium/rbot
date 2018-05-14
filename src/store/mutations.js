import Vue from 'vue';
import { omit, keyBy } from 'lodash';
import assert from 'assert';
import * as types from './mutation_types';

export default {
  [types.SET_EXCHANGES](state, exchanges) {
    state.exchanges = Object.assign({}, state.exchanges, keyBy(exchanges, 'id'));
  },
  [types.ASSIGN_EXCHANGE_STATE](state, args) {
    Object.assign(state.exchanges[args.id], omit(args, ['id']));
  },
  [types.ADD_TO_ARBITRAGE_HISTORY](state, args) {
    assert(args.arb, 'Arb is a required argument');
    state.arbHistory.push(args.arb);
  },
  [types.UPDATE_ARBITRAGE_HISTORY_ORDERS](state, args) {
    assert(args.id, 'Id is required');
    assert(args.orders, 'Orders are required');
    const arb = state.arbHistory.find(a => a.id === args.id);
    assert(arb, 'Arb not found');
    Vue.set(arb, 'orders', args.orders);
  },
  [types.CLEAR_ARBITRAGE_HISTORY](state) {
    state.arbHistory = [];
  },
  [types.TOGGLE_FILTER](state, filter) {
    if (!state.filters[filter]) {
      Vue.set(state.filters, filter, {});
    }
    Vue.set(state.filters[filter], 'enabled', !state.filters[filter].enabled);
  },
  [types.TOGGLE_FILTER_ON](state, filter) {
    if (!state.filters[filter]) {
      Vue.set(state.filters, filter, {});
    }
    Vue.set(state.filters[filter], 'enabled', true);
  },
  [types.TOGGLE_FILTER_OFF](state, filter) {
    if (!state.filters[filter]) {
      Vue.set(state.filters, filter, {});
    }
    Vue.set(state.filters[filter], 'enabled', true);
  },
  [types.SET_FILTER_DATA](state, args) {
    const filter = args.key;
    if (!state.filters[filter]) {
      Vue.set(state.filters, filter, {});
    }
    Vue.set(state.filters[filter], 'data', args.data);
  },
  [types.CLEAR_FILTERS](state) {
    state.filters = {};
  },
  [types.UPDATE_PAIRS](state, pairs) {
    state.pairs = pairs;
  },
  [types.UPDATE_CURRENCIES](state, currencies) {
    state.currencies = currencies;
  },
  [types.PATCH_SETTING](state, setting) {
    Object.assign(state.settings, setting);
  },
  [types.AUTHENTICATE](state, token) {
    state.token = token;
  },
  [types.LOG_OUT](state) {
    state.token = null;
  }
};
