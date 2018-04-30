import { pickBy } from 'lodash';

export default {
  exchanges: state => state.exchanges,
  filteredExchanges: state => state.exchanges && pickBy(state.exchanges, e => e.enabled),
  getExchangeState: state => id => state.exchanges[id],
  exchangeStates: state => state.exchanges,
  getExchangeIdList: state => Object.keys(state.exchanges),
  getFilteredExchangeStates: state => Object.values(state.exchanges)
    .filter(e => e.enabled),
  getFilteredExchangeIdList: state => Object.values(state.exchanges)
    .filter(e => e.enabled)
    .map(e => e.id),
  arbHistory: state => state.arbHistory,
  filters: state => state.filters,
  currencies: state => new Set(state.currencies),
  settings: state => state.settings,
  isAuthenticated: state => !!state.token
};
