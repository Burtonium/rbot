import axios from 'axios';
import store from '@/store';
import * as types from '@/store/mutation_types';
// import router from '@/router';
// import assert from 'assert';

const instance = axios.create({ baseURL: process.env.API_URL });
const accessHeader = () => ({ 'x-access-token': store.state.token });

const attempt = async (method, url, data) => {
  let attempted;
  try {
    attempted = await instance({ method, url, data, headers: accessHeader() });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("REDIRECT TO LOGIN");
      console.log(this);
      store.commit(types.LOG_OUT);
      // router.push('/login');
    }
    attempted = { data: { success: false, status: error.response && error.response.status } };
  }

  return attempted.data;
};

export const authenticate = user => instance.post('/authenticate', user);
export const fetchOrderCaddies = async () => attempt('get', '/caddies');
export const fetchOrderCaddy = async id => attempt('get', `/caddies/${id}`);
export const fetchPairs = async () => (await instance.get('/pairs')).data;
export const fetchExchanges = async () => (await instance.get('/exchanges')).data;
export const createCaddy = async caddy => attempt('post', '/caddies', { caddy });
export const deleteCaddy = async id => attempt('delete', `/caddies/${id}`);
