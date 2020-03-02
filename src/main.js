import Vue from 'vue';
import Axios from 'axios';
import Vuex from 'vuex';
import App from './App.vue';

import SvgIcon from './components/django/svg-icon.vue';

import actions from './store/actions';
import getters from './store/getters';
import mutations from './store/mutations';

Vue.config.productionTip = false;

Vue.prototype.$axios = Axios;

Vue.component('svg-icon', SvgIcon);
Vue.use(Vuex);

Vue.filter('rur', (val) => {
  if (!val && val !== 0 || isNaN(val)) return;
  if (val === 0) return val;

  let res = +val;
  res = res.toLocaleString('ru-RU').replace(',', '.');
  return res;
});

Vue.filter('declDays', (val) => {
  const cases = [2, 0, 1, 1, 1, 2]; const
    titles = ['день', 'дня', 'дней'];

  const title = titles[(val % 100 > 4 && val % 100 < 20) ? 2
    : cases[(val % 10 < 5) ? val % 10 : 5]];

  return `${val} ${title}`;
});

Vue.filter('currentDay', (val) => {
  const now = new Date();
  const later = new Date();
  const month = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  later.setDate(now.getDate() + +val);

  return `${later.getDate()} ${month[later.getMonth()]}`;
});

function debounce(func, wait, immediate) {
  let timeout;
  return function (...args) {
    const context = this;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

Vue.directive('debounce', {
  inserted(el, binding, vnode) {
    const method = vnode.context[binding.expression];
    const delay = parseInt(binding.arg, 10) || 1000;
    el.addEventListener('keyup', debounce((e) => {
      // binding.value();
      if (e.key !== 'Tab' || e.code !== 'Tab') method();
    }, delay));
  },
});

const store = new Vuex.Store({
  // strict: true,
  state: {
    currentScreen: 1,
    apiData: {
      entity: null,
      user_info: null,
      orders: null,
      credit_data: null,
      isSpinnerShow: true,
      delivery_info: {},
      transportCompaniesYandexList: {},
      transportCompaniesYandex: {},
    },

    userData: {
      buyerAddressForm: {},
      entity: null,
      user_info: null,
      company: null,
      orders: {},
      shipping: {},
      form_data: {},
      receiverInfo: null,
    },

    response: null,
    DELIVERY_LABEL: {
      1516: {
        name: 'СДЭК',
        image: '/static/site/images/map/markerSdek.svg',
      },
      3390: {
        name: 'Почта',
        image: '/static/site/images/map/markerPochta.svg',
      },
      3937: {
        name: 'DPD',
        image: '/static/site/images/map/markerDpd.svg',
      },
    },
    shippingComplete: {},
  },
  actions,
  getters,
  mutations,
});

new Vue({
  store,
  render: h => h(App),
}).$mount('#app');