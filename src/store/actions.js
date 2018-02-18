import * as types from './mutation_types';

export default {
  clearStorage({ commit }) {
    commit(types.CLEAR_STORAGE);
  },
  toggleExchange({ commit }, { id }) {
    commit(types.TOGGLE_EXCHANGE, id);
  }
};
