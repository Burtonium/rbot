export default {
  getExchangeState: state => id => state.exchanges[id],
  getExchangeStates: state => state.exchanges,
  getExchangeIdList: state => Object.keys(state.exchanges),
  getFilteredExchangeIdList: state => Object.values(state.exchanges)
    .filter(e => e.enabled)
    .map(e => e.id)

};
