import Vue from 'vue'
import App from './App.vue'
import router from './router'
import XLSX from 'xlsx';
import axios from 'axios';
import * as d3 from 'd3';


Vue.config.productionTip = false

Vue.prototype.$XLSX = XLSX;
Vue.prototype.$axios = axios;
Vue.prototype.$d3 = d3;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
