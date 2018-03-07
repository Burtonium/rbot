import { pick } from 'lodash';
import { BigNumber } from 'bignumber.js';

class Balance {
  constructor(args) {
    Object.assign(this, pick(args, ['code', 'available', 'locked']));
  }

  get total() {
    return (new BigNumber(this.available || 0)).plus(this.locked).toFixed(8);
  }

  toString() {
    return new BigNumber(this.available || 0).toFixed(8);
  }
}

export default Balance;
