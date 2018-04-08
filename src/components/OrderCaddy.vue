<template>
  <div class="wrapper">
    <br>
    <ul class="nav nav-tabs" role="tablist">
      <li class="nav-item">
        <a class="nav-link active" data-toggle="tab" href="#active" role="tab">Active</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-toggle="tab" href="#create" role="tab">Create</a>
      </li>
    </ul>
      <div class="tab-content">
        <div class="tab-pane active" id="active" role="tabpanel">
          <order-caddy-card v-for="caddy in allCaddies"
                            :key="'caddy-' + caddy.id"
                            :caddy="caddy"
                            @delete="deleteCaddy(caddy)"/>
        </div>
        <div class="tab-pane" id="create" role="tabpanel">
          <order-caddy-create />
        </div>
      </div>
  </div>
</template>
<script>
import { fetchOrderCaddies, deleteCaddy } from '@/api';
import OrderCaddyCreate from '@/components/OrderCaddyCreate';
import OrderCaddyCard from '@/components/OrderCaddyCard';
import Checkmark from '@/components/Checkmark';

export default {
  components: {
    OrderCaddyCreate,
    OrderCaddyCard,
    Checkmark
  },
  data() {
    return {
      caddies: []
    };
  },
  computed: {
    allCaddies() {
      return this.caddies.concat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  methods: {
    async deleteCaddy(caddy) {
      const { success } = await deleteCaddy(caddy.id)
      if (success) {
        const index = this.caddies.indexOf(caddy);
        this.caddies.splice(index, 1);
      }
    }
  },
  async beforeRouteEnter(to, from, next) {
    const caddies = await fetchOrderCaddies();
    next(vm => {
      vm.caddies = caddies;
    });
  }
};
</script>
