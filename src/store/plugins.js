import { pick } from 'lodash';
import { STORAGE_KEY } from './state';
import * as types from './mutation_types';

const localStoragePlugin = (store) => {
  store.subscribe((mutation, state) => {
    const syncedData = pick(state, ['exchanges', 'arbHistory', 'filters', 'currencies', 'settings']);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(syncedData));

    if (mutation.type === types.CLEAR_STORAGE) {
      localStorage.removeItem(STORAGE_KEY);
    }
  });
};

export default [localStoragePlugin];
