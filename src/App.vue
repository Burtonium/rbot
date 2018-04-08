<template>
  <div id="app">
    <navbar v-if="isAuthenticated"></navbar>
    <router-view/>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar';
import Login from '@/components/Login';
import { mapGetters } from 'vuex';

export default {
  name: 'App',
  computed: {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    }
  },
  watch: {
    isAuthenticated(){
      if (!this.isAuthenticated){
        this.$router.push('/login');
      }
    }
  }
  components: {
    Navbar,
    Login
  },
  watch: {
    isAuthenticated() {
      if (!this.isAuthenticated) {
        this.$router.push('/login');
      }
    }
  }
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.wrapper { max-width: 1024px; margin: 0 auto; }

.clickable {
  cursor: pointer;
}

.hover-info:hover {
  background-color: #c0e6f2;
}

/* button overrides for vuejs-dialog */
.dg-btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out,
              background-color 0.15s ease-in-out,
              border-color 0.15s ease-in-out,
              box-shadow 0.15s ease-in-out;
}

.dg-btn:hover, .dg-btn:focus {
  text-decoration: none;
}

.dg-btn:focus {
  outline: 1px dotted;
  outline: 5px auto -webkit-focus-ring-color;
}

.dg-btn.dg-btn--ok {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.dg-btn.dg-btn--ok:hover {
  color: #fff;
  background-color: #0069d9;
  border-color: #0062cc;
}

.dg-btn.dg-btn--ok:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);
}

.dg-btn.dg-btn--ok span {
  background-color: inherit;
  color: white;
}

.dg-btn.dg-btn--cancel {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}

.dg-btn.dg-btn--cancel:hover {
  color: #fff;
  background-color: #5a6268;
  border-color: #545b62;
}

.dg-btn.dg-btn--cancel:focus {
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5);
}
</style>
