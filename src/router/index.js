import Vue from 'vue';
import Router from 'vue-router';
import Exchanges from '@/components/Exchanges';
import ExchangeSettings from '@/components/ExchangeSettings';
import Arbitrage from '@/components/Arbitrage';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/exchanges'
    },
    {
      path: '/exchanges',
      name: 'Exchanges',
      component: Exchanges
    },
    {
      path: '/exchanges/:id',
      name: 'ExchangeSettings',
      component: ExchangeSettings
    },
    {
      path: '/arbitrage',
      name: 'Arbitrage',
      component: Arbitrage
    }
  ],
});
