import Vue from 'vue';
import Axios from 'axios';

export default {
  changeScreen(state, val) {
    Vue.set(state, 'currentScreen', val);
  },

  setLocalDeliveryCityData(state, data) {
    Vue.set(state.userData, 'delivery_city_data', data);
  },

  setSpinnerStatus(state, status) {
    Vue.set(state.apiData, 'isSpinnerShow', status);
  },

  setDeliveryDataForOrder(state, data) {
    Vue.set(state.userData.orders, data.index, data.shippingData);
  },

  setDeliveryDataForOrderYandex(state, data) {
    Vue.set(state.userData.orders, data.index, data.shippingData);
  },

  setRecieverInfo(state, data) {
    Vue.set(state.userData, 'receiverInfo', data);
  },

  setBuyerInfoToOrders(state) {
    Object.keys(state.apiData.orders).forEach((index) => {
      Vue.set(state.userData.orders[index],
        'receiver_info', state.userData.receiverInfo);
    });
  },

  setDeliveryDataForOrders(state, data) {
    Vue.set(state.userData, 'shipping', data);
  },

  setDeliveryDataForOrdersYandex(state, data) {
    Vue.set(state.userData, 'shipping', data);
  },

  removeOrderFromBuyingProcess(state, index) {
    Vue.set(state.userData.orders, index, null);
  },

  setUserInfo(state, data) {
    Vue.set(state.apiData, 'entity', data.entity);
    Vue.set(state.apiData, 'user_info', data.user_info);
  },

  setDeliveryPoints(state, data) {
    if (data.delivery_pickpoints) {
      Vue.set(state.apiData, 'pickpoints', data.delivery_pickpoints);
    }
    if (data.pickpoints) {
      Vue.set(state.apiData, 'pickpoints', data.pickpoints);
    }
    if (data.warehouses) {
      Vue.set(state.apiData, 'warehouses', data.warehouses);
    }
  },

  setResponseOrders(state, data) {
    Vue.set(state.response, 'orders', data);

    Object.keys(this.state.response.orders).forEach((index) => {
      this.commit('setResponseOrdersIds', Object.assign({ index }, data));
    });
  },

  setOrdersIds(state, data) {
    Vue.set(state.apiData.orders, data.index, Object.assign(
      {},
      state.apiData.orders[data.index],
      {id: data.index},
    ));
  },

  setResponseOrdersIds(state, data) {
    Vue.set(state.response.orders, data.index, Object.assign(
      {},
      state.response.orders[data.index],
      {id: data.index},
    ));
  },

  _clearTransportCompaniesData(state) {
    if (Object.keys(state.apiData.orders)) {
      Object.keys(state.apiData.orders).forEach((order) => {
        Vue.set(state.apiData.transportCompaniesData, order, {});
        Object.keys(state.apiData.transportCompaniesList).forEach((key) => {
          Vue.set(state.apiData.transportCompaniesData[order], key, {});
        });
      });
    }
  },

  _clearTransportCompaniesDataYandex(state) {
    Vue.set(state.apiData, 'transportCompaniesYandex', {});
    Vue.set(state.apiData, 'transportCompaniesYandexList', {});
  },

  resetTransportCompaniesData() {
    this.commit('_clearTransportCompaniesData');
    this.commit('_clearTransportCompaniesDataYandex');
  },

  test(state) {
    Object.keys(state.apiData.orders).forEach((order) => {
      Vue.set(state.apiData.transportCompaniesData, order, {});
    });
  },

  setPaymentTypes(state, data) {
    Vue.set(state.apiData, 'payment_types', data);
  },

  setOrders(state, data) {
    Vue.set(state.apiData, 'orders', data);
  },

  setToken(state, data) {
    Axios.defaults.data = {
      csrfmiddlewaretoken: data.csrf,
    };
    Axios.defaults.headers = {
      'X-CsrfToken': data.csrf,
    };
  },

  setCreditData(state, data) {
    Vue.set(state.apiData, 'credit_data', data);
  },

  selectTkYandex(state, data) {
    Vue.set(state.userData.orders, data.index, Object.assign(
      {},
      state.userData.orders[data.index],
      {
        type_shipping: data.type_shipping,
        tk: 7,
        tk_current: data.tk_id,
        tk_name: data.tk_name,
        comment: data.comment,
      },
    ));
  },

  selectPayment(state, data) {
    Vue.set(state.userData.orders, data.index, Object.assign(
      {},
      state.userData.orders[data.index],
      {
        payment_type: data.payment_type,
        credit: data.credit_order,
      },
    ));
  },

  resetUserOrders(state) {
    Vue.set(state.userData, 'orders', {});
  },

  addToShippingCompleteValidation(state, { key, el }) {
    if (!Object.prototype.hasOwnProperty.call(state.shippingComplete, key)) {
      Vue.set(state.shippingComplete, key, {
        done: false,
        show: false,
        el,
      });
    }
  },

  setToShippingCompleteValidation(state, { key, done, show }) {
    Vue.set(state.shippingComplete, key, Object.assign({},
      state.shippingComplete[key], {
        done: done || false,
        show: show || false,
      }));
  },

  setToShippingCompleteValidationYandex(state, { key, done, show }) {
    Vue.set(state.shippingComplete, key, Object.assign({},
      state.shippingComplete[key], {
        done: done || false,
        show: show || false,
      }));
  },

  unsetToShippingCompleteValidation(state) {
    Vue.set(state, 'shippingComplete', {});
  },

  removeOrder(state, data) {
    if (data.where === 'transportCompaniesData') {
      if (state.apiData.transportCompaniesData[data.key]) {
        Vue.delete(state.apiData.transportCompaniesData, data.key);
      }
    } else if (state[data.where] && state[data.where].orders[data.key]) {
      Vue.delete(state[data.where].orders, data.key);
    }
  },

  removeOrders(state, data) {
    if (data.where === 'transportCompaniesData') {
      if (state.apiData.transportCompaniesData) {
        Object.keys(state.apiData.transportCompaniesData).forEach((order) => {
          Vue.delete(state.apiData.transportCompaniesData, order);
        });
      }
    } else if (state[data.where]) {
      if (state[data.where].orders) {
        Object.keys(state[data.where].orders).forEach((order) => {
          Vue.delete(state[data.where].orders, order);
        });
      }
    }
  },
};