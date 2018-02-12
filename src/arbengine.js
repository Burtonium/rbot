class ArbEngine {
  constructor(exchanges) {
    this.exchanges = exchanges;
  }

  init() {
    this.exchanges.forEach(async (exchange) => {
      await exchange.loadMarkets(true);
      exchange.orderBooks = {};
      Object.values(exchange.markets).forEach(async () => {

        // exchange.orderBooks[market.id] = await exchange.fetchOrderBook(market.symbol);
      });
    });
  }
}

export default ArbEngine;
