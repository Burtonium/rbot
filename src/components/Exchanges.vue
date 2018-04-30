<template>
  <div>
    <ul class="exchanges wrapper">
      <li v-for="(e, key) in exchanges" :key="key"
          @click="toggleExchange(e)">
        <span class="badge"
              :class="{'badge-success': e.enabled, 'badge-danger': !e.enabled}">
          {{ e.name }}
        </span>
      </li>
    </ul>
    <br>
    <table class="table table-striped table-bordered" style="max-width:767.98px; margin:0 auto">
      <thead>
        <tr>
            <th>Name</th>
            <th>API Status</th>
            <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(ex, key) in filteredExchanges" :key="key">
          <td>
            {{ ex.name }}
          </td>
          <td>
            <p>{{ ex.status || 'Pending' }}</p>
          </td>
          <td>
            <router-link class="btn btn-primary" :to="'/exchanges/' + ex.ccxtId">
              Settings
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'Home',
  computed: {
    ...mapGetters([
      'exchanges',
      'filteredExchanges',
    ])
  },
  methods: {
    ...mapActions(['patchExchange', 'fetchExchanges']),
    toggleExchange(exchange) {
      exchange.enabled = !exchange.enabled;
      return this.patchExchange(exchange);
    }
  },
  async mounted() {
    await this.fetchExchanges();
  }
};
</script>

<style>
.exchanges {
  text-align:center;
}
.exchanges li {
  display:inline-block;
  cursor:pointer;
  margin: 0 2px;
}
</style>
