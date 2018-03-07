<template>
  <div class="container">
    <h4>Ticker update cycle</h4>
    <div class="form-group form-inline">
      <select class="form-control" v-model="refreshMode">
        <option value="manual">Manual</option>
        <option value="auto">Automatic</option>
      </select>
      <span v-if="refreshMode === 'auto'">
        &nbsp; Interval: &nbsp;
        <input type="number"
               class="form-control"
               v-model="refreshInterval"
               min="5" max="30">
        &nbsp; seconds
      </span>
    </div>
    <div class="form-check">
      <input class="form-check-input"
             type="checkbox"
             name="Lock position"
             v-model="lockPosition">
      <label>Lock arb positions after loading</label>
    </div>
  </div>
</template>
<script>
import * as types from '@/store/mutation_types';

const mapSettings = (settings) => {
  const res = {};
  settings.forEach((s) => {
    res[s] = {
      get() { return this.$store.state.settings[s]; },
      set(setting) { this.$store.commit(types.PATCH_SETTINGS, { [s]: setting }); }
    };
  });
  return res;
};

export default {
  data() {
    return {

    };
  },
  computed: {
    ...mapSettings(['refreshMode', 'refreshInterval', 'lockPosition'])
  },
  methods: {

  },
  mounted() {
    Object.assign(this, this.settings);
  }
};
</script>
