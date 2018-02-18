import * as types from './mutation_types';

export default {
  [types.TOGGLE_EXCHANGE](state, id) {
    if (typeof state.exchanges[id] === 'undefined') {
      throw new Error('Exchange undefined');
    }
    state.exchanges[id].enabled = !state.exchanges[id].enabled;
  }
};
