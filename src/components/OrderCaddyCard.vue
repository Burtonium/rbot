<template>
  <div class="card caddy-card clickable" @click="$router.push(`/caddy/${caddy.id}`)">
    <div class="card-body">
      <button type="button" class="close" aria-label="Close" @click.stop="$emit('delete')">
        <span aria-hidden="true">&times;</span>
      </button>
      <div class="row">
        <div class="col-md-4">
          <h2 class="card-title">
            {{ caddy.label }} ({{caddy.pair.label}})
          </h2>
        </div>
        <div class="col-md-4">
          <h5>
            Status:
            <span class="text-success clickable" v-if="caddy.active" @click="$emit('disable')">
              Active
            </span>
            <span class="text-muted" v-else @click="$emit('enable')">Disabled</span>
            <br>
            {{ new Date(caddy.createdAt).toLocaleString() }}

          </h5>
        </div>
        <div class="col-md-4">
          <h5>
            Reference: {{ caddy.referenceMarkets.map(rm => rm.exchange.name).join(', ') }}
            <br>
            Triggers:
            {{ caddy.triggerMarkets.map(tm => `${tm.exchange.name} ${tm.side}`).join(', ') }}
          </h5>
        </div>
      </div>
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
