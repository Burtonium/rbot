import axios from 'axios';
import store from '@/store';
import * as types from '@/store/mutation_types';
import assert from 'assert';

const instance = axios.create({ baseURL: process.env.API_URL });
const accessHeader = () => ({ 'x-access-token': store.state.token });

const attempt = async (method, url, data) => {
  assert(typeof instance[method] === 'function');
  let attempted;
  try {
    attempted = await instance({ method, url, data, headers: accessHeader() });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      store.commit(types.LOG_OUT);
    }
    attempted = { data: { success: false, status: error.response.status } };
  }

  return attempted.data;
};

export const authenticate = user => instance.post('/authenticate', user);
export const fetchOrderCaddies = async () => attempt('get', '/caddies');
export const fetchOrderCaddy = async id => attempt('get', `/caddies/${id}`);
export const fetchPairs = async () => (await instance.get('/pairs')).data;
export const fetchExchanges = async () => attempt('get', '/exchanges');
export const fetchMarkets = async () => attempt('get', '/markets');
export const patchExchange = async exchange => attempt('patch',
  `/exchanges/${exchange.id}`, { exchange });
export const createCaddy = async caddy => attempt('post', '/caddies', { caddy });
export const patchCaddy = async caddy => attempt('patch', `/caddies/${caddy.id}`,
  { caddy });
export const deleteCaddy = async id => attempt('delete', `/caddies/${id}`);
export const fetchBalances = async id => attempt('get', `/exchanges/${id}/balances`);
