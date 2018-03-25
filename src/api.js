import axios from 'axios';
import store from '@/store';
import * as types from '@/store/mutation_types';
import assert from 'assert';

const instance = axios.create({ baseURL: process.env.API_URL });
const accessHeader = () => ({ headers: { 'x-access-token': store.state.token } });

const attempt = async (method, route, data) => {
  assert(typeof instance[method] === 'function');
  let attempted;
  try {
    attempted = await instance[method](route, data, accessHeader());
  } catch (error) {
    if (error.response && error.response.status === 401) {
      store.commit(types.LOG_OUT);
    }
    attempted = { data: { success: false, status: error.response.status } };
  }

  return attempted.data;
};

export const authenticate = user => instance.post('/authenticate', user);
export const fetchOrderCaddies = async () => (await instance.get('/caddies')).data;
export const fetchPairs = async () => (await instance.get('/pairs')).data;
export const fetchExchanges = async () => (await instance.get('/exchanges')).data;
export const createCaddy = async caddy => attempt('post', '/caddies', { caddy });
