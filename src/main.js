// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VuejsDialog from 'vuejs-dialog';
import vSelect from 'vue-select';
import 'vue-progress-path/dist/vue-progress-path.css';
import VueProgress from 'vue-progress-path';
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';
import bToggle from 'bootstrap-vue/es/directives/toggle/toggle';
import App from './App';
import router from './router';
import store from './store';

Vue.use(VueProgress, {
  defaultShape: 'circle',
});

Vue.config.productionTip = false;
Vue.use(VuejsDialog);
Vue.component('v-select', vSelect);
Vue.component('b-collapse', bCollapse);
Vue.directive('b-toggle', bToggle);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>',
});
