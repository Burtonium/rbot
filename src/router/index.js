import Vue from 'vue';
import Router from 'vue-router';
import Exchanges from '@/components/Exchanges';
import ExchangeSettings from '@/components/ExchangeSettings';
import Arbitrage from '@/components/Arbitrage';
import OrderCaddy from '@/components/OrderCaddy';
import CaddyView from '@/components/OrderCaddyView';
import Login from '@/components/Login';
import store from '@/store';

Vue.use(Router);

const authenticationGuard = (to, from, next) => {
  let redirect;
  if (to.matched.some(record => record.meta.requiresAuth) && !store.state.token) {
    redirect = next({
      path: '/login'
    });
  }
  return redirect || next();
};

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/exchanges'
    },
    {
      meta: { requiresAuth: true },
      path: '/exchanges',
      name: 'Exchanges',
      component: Exchanges
    },
    {
      meta: { requiresAuth: true },
      path: '/exchanges/:id',
      name: 'ExchangeSettings',
      component: ExchangeSettings
    },
    {
      meta: { requiresAuth: true },
      path: '/arbitrage',
      name: 'Arbitrage',
      component: Arbitrage
    },
    {
      meta: { requiresAuth: true },
      path: '/caddy',
      name: 'Caddy',
      component: OrderCaddy
    },
    {
      meta: { requiresAuth: true },
      path: '/caddy/:id',
      name: 'CaddyView',
      component: CaddyView
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ],
});

router.beforeEach(authenticationGuard);
export default router;
