<template>
  <div class="card caddy-card">
    <div class="card-body">
      <h1 class="card-title">
        {{ caddy.label }}
        <button type="button" class="close" aria-label="Close" @click="$emit('delete')">
          <span aria-hidden="true">&times;</span>
        </button>
      </h1>
      <h4>
        Status:
        <span class="text-success clickable" v-if="caddy.active" @click="$emit('disable')">Active</span>
        <span class="text-muted" v-else @click="$emit('enable')">Disabled</span>
      </h4>
      <h4>Created: {{ new Date(caddy.createdAt).toLocaleString() }}</h4>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    caddy: Object
  }
};
</script>
<style>
  .caddy-card {
    margin:10px 0;
  }
</style>
