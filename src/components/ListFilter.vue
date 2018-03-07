<template>
  <div>
    <h4>{{ title }}</h4>
    <h5 v-if="list && list.size > 0">
      <span class="badge clickable"
            :class="{'badge-success': hover !== item, 'badge-danger': hover === item }"
            v-for="(item, index) of Array.from(list)"
            :key="index"
            @mouseover="hover = item"
            @mouseout="hover = null"
            @click="removeItemFromListFilter({ item, key: filterKey })">
        {{ item }}
      </span>
    </h5>
    <h5 v-else>
      <span class="badge badge-success">All</span>
    </h5>
    <div class="form-group form-inline">
      <v-select :options="Array.from(options)" v-model="value"/>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  data() {
    return {
      value: null,
      hover: null
    };
  },
  computed: {
    ...mapGetters(['filters']),
    list() {
      const k = this.filterKey;
      return this.filters[k] && new Set(this.filters[k].data.list);
    }
  },
  watch: {
    value() {
      if (this.value) {
        this.addItemToListFilter({ item: this.value, key: this.filterKey });
      }
    }
  },
  props: {
    title: String,
    filterKey: String,
    options: [Array, Set]
  },
  methods: {
    ...mapActions(['addItemToListFilter', 'removeItemFromListFilter'])
  }
};
</script>
<style scoped>
.badge {
  margin-right:4px;
}
</style>
