<template>
  <div class="wrapper">
    <br>
    <ul class="nav nav-tabs" role="tablist">
      <li class="nav-item">
        <a class="nav-link active" data-toggle="tab" href="#active" role="tab">Active</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-toggle="tab" href="#closed" role="tab">Closed</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-toggle="tab" href="#create" role="tab">Create</a>
      </li>
    </ul>
      <div class="tab-content">
        <div class="tab-pane active" id="active" role="tabpanel">
          <order-caddy-card v-for="caddy in activeCaddies"
                            :key="'caddy-' + caddy.id"
                            :caddy="caddy"/>
        </div>
        <div class="tab-pane" id="closed" role="tabpanel">
          <order-caddy-card v-for="caddy in closedCaddies"
                            :key="'caddy-' + caddy.id"
                            :caddy="caddy"/>
        </div>
        <div class="tab-pane" id="create" role="tabpanel">
          <order-caddy-create />
        </div>
      </div>
  </div>
</template>
<script>
import { fetchOrderCaddies } from '@/api';
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
    activeCaddies() {
      return this.caddies.filter(c => c.active)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    closedCaddies() {
      return this.caddies.filter(c => !c.active)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  async mounted() {
    this.caddies = await fetchOrderCaddies();
  }
};
</script>
