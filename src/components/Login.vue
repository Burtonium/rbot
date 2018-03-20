<template>
  <div class="login text-center">
    <h2>Login</h2>
    <form @submit.prevent="onSubmit">
      <div class="form-group">

        <span class="text-danger" v-if="error">Nope. Try again.</span>
        <input class="form-control" placeholder="Username" v-model="user.username">
      </div>
      <div class="form-group">
        <input class="form-control"
               placeholder="Password"
               type="password"
               v-model="user.password">
      </div>
      <button class="btn btn-primary" type="submit">Submit</button>
    </form>
  </div>
</template>
<script>
import * as types from '@/store/mutation_types';
import { authenticate } from '@/api';

export default {
  data() {
    return {
      user: {},
      error: null
    };
  },
  methods: {
    async onSubmit() {
      try {
        const result = await authenticate(this.user);
        this.$store.commit(types.AUTHENTICATE, result.data.token);
        this.$router.push('/exchanges');
      } catch (e) {
        this.error = true;
      }
    }
  }
};
</script>
<style scoped>
.login {
  margin: 200px auto;
  width: 400px;
}
</style>
