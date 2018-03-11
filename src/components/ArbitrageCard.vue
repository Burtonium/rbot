<template>
  <div class="card arbitrage-card">
    <div class="card-body">
      <div class="row clickable" data-toggle="collapse" :data-target="'#' + collapsibleId">
        <div class="col-md-8">
          <h1 class="card-title">
            Arb #{{ index + 1 }}
            <loading-progress   :progress="progress"
                                :indeterminate="false"
                                size="30"
                                fillDuration="10"
                                style="position:relative;bottom:-24px; left:15px; margin:-35px"
                                v-if="settings.refreshMode === 'auto'"/>
          </h1>
          <h6>
            <div class="hide-on-collapsed text-info"
                 v-for="(order, index) in arb.orders"
                 :key="index">
              {{ order.exchange.name }} {{ order.pair.base }}/{{order.pair.quote}}
            </div>
          </h6>
        </div>
        <div class="col col-md-4 text-right"
             :class="{'text-success': arb.percent > 0,
                      'text-danger': arb.percent < 0}">
          <h1 class="card-subtitle">
            {{ Math.abs(arb.percent) }}%
          </h1>
        </div>
      </div>
      <br>
      <div class="collapse" :id="collapsibleId">
        <table class="table table-bordered">
          <thead>
            <tr>
                <th>Exchange</th>
                <th>Available Balance</th>
                <th>Order</th>
                <th>24H Volume</th>
                <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(order, index) in arb.orders" :key="index">
              <td>
                <router-link :to="'/exchanges/' + order.exchangeId">
                  {{ order.exchange.name }}
                </router-link>
              </td>
              <td v-if="!order.exchange.balances ||
                        !order.exchange.has.fetchBalance">
                Unavailable
              </td>
              <td class="text-warning"
                 v-else-if="order.exchange.unfulfilledRequirements">
                Requires: {{ order.exchange.unfulfilledRequirements }}
              </td>
              <td v-else-if="order.side === 'buy'">
                {{ order.availableQuoteBalance }} {{ order.pair.quote }}
              </td>
              <td v-else-if="order.side === 'sell'">
                {{ order.availableBaseBalance  }} {{ order.pair.base }}
              </td>

              <td v-if="order.side === 'buy'">
                Buy {{ order.amount }} {{ order.pair.base }}
                for {{ order.quotedAmountString }}
              </td>
              <td v-else-if="order.side === 'sell'">
                Sell {{ order.amount }} {{ order.pair.base }}
                for {{ order.quotedAmountString }}
              </td>
              <td v-if="order.quoteVolume">
                {{ precisionRound(order.quoteVolume, 6) }} {{ order.pair.quote }}
              </td>
              <td v-else>
                {{ precisionRound(order.baseVolume * order.price, 6) }} {{ order.pair.quote }}
              </td>
              <td class="text-danger" v-if="order.exchange.error">
                {{ order.exchange.error.message || 'Error' }}
              </td>
              <td class="text-danger" v-else-if="!order.hasBalance">
                No Balance
              </td>
              <td class="text-success" v-else>Ready</td>
            </tr>
          </tbody>
        </table>
        <div class="form-group">
          <button class="btn btn-primary float-right"
                  @click="$emit('execute', arb)">
            View
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Arbitrage from '@/models/Arbitrage';
import { precisionRound } from '@/utils';
import { mapGetters } from 'vuex';

export default {
  props: {
    arb: {
      type: Arbitrage
    },
    index: {
      type: Number
    },
    progress: {
      type: Number,
      validator(value) {
        return value <= 100 && value >= 0;
      },
      default: 0
    }
  },
  data() {
    return {
      collapsibleId: `collapse-${this.arb.arbId}`
    };
  },
  computed: {
    ...mapGetters(['settings'])
  },
  methods: {
    precisionRound
  },
};
</script>
<style scoped>
.arbitrage-card {
  margin-bottom: 20px;
}

.row:not([aria-expanded="true"]) {
  margin-bottom: -30px;
  transition: margin 300ms;
}


.row:not([aria-expanded="true"]) .hide-on-expanded {
  display:none;
}
</style>
