import Axios from 'axios';

export default {
  nextScreen() {
    this.commit('changeScreen', this.state.currentScreen += 1);
  },

  setScreen(context, step) {
    this.commit('changeScreen', step);
  },

  getUserInfo() {
    Axios.get('/order/api/user-info/')
    .then((response) => {
      if (response.data.success) {
        this.commit('setUserInfo', response.data.payment_details);
        this.commit('setSpinnerStatus', false);
        return;
      }
      throw new Error('Network response was not ok');
    })
    .catch(error => alert(error));
  },

  selectContact(context, dataToSend) {
    return Axios(`/order/api/delivery/${dataToSend}`, {
      company_data: dataToSend,
    })
    .then(
      (response) => {
        if (response.data.success) {
          this.dispatch('setScreen', 2);
          context.state.response = response.data;
          context.state.apiData.orders = response.data.orders;
          context.state.userData.user_type = dataToSend ? "legal" : "natural";
          context.state.userData.user_info = {};
          context.state.userData.user_info.entity_id = dataToSend;

        } else {
          window.showMessage(JSON.stringify(response.data), 'error');
          this.dispatch('setScreen', 1);
        }
      },
    )
    .catch(error => alert(error));
  },

  confirmOrders(state, dataToSend) {
    const params = dataToSend || '';

    Axios({
      method: 'post',
      url: 'api/user-orders/',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      data: params,
    })
    .then((response) => {
      this.commit('setSpinnerStatus', false);
      if (response.data.success) {
        // this.commit("setSpinnerStatus", false);
        sessionStorage.removeItem('ing-order__step');

        Object.values(response.data.metrika).forEach((item) => {
          state.dispatch('dataLayerPusher', item);
        });

        window.location = response.data.redirect_url;
      } else if (response.data.errors) {
        showMessage(response.data.errors, 'error');
      }
    })
    .catch((error) => {
      this.commit('setSpinnerStatus', false);
      showMessage(error, 'error');
    });
  },

  selectTkYandex(context, data) {
    Object.keys(this.state.apiData.orders).forEach((index) => {
      this.commit('selectTkYandex', Object.assign({ index }, data));
    });
  },

  // todo dry refactor!
  selectDeliveryType(context, shippingData) {
    Object.keys(this.state.apiData.orders).forEach((index) => {
      this.commit('setDeliveryDataForOrder', {
        index,
        shippingData,
      });
    });
  },

  selectDeliveryTypeYandex(context, shippingData) {
    Object.keys(this.state.apiData.orders).forEach((index) => {
      this.commit('setDeliveryDataForOrderYandex', {
        index,
        shippingData,
      });
    });
  },

  setRecieverInfo(context, data) {
    this.commit('setRecieverInfo', data);
  },

  setBuyerInfoToOrders() {
    this.commit('setBuyerInfoToOrders');
  },

  setDeliveryData(context, data) {
    context.commit('setDeliveryDataForOrders', data);
    context.commit('setToShippingCompleteValidation', { key: 'shipping_type_detailed', done: true });
  },

  setDeliveryDataYandex(context, data) {
    context.commit('setDeliveryDataForOrdersYandex', data);
    context.commit('setToShippingCompleteValidationYandex', { key: 'shipping_type_detailed', done: true });
  },

  resetDeliveryData() {
    this.commit('setDeliveryDataForOrders', {});
  },

  setApiDataOrders(context, data) {
    this.commit('setApiDataOrders', data);
  },

  setResponseOrders(context, data) {
    this.commit('setResponseOrders', data);
  },

  // set list of companies
  setTransportCompanies(context, data) {
    this.commit('setTransportCompanies', data);
  },

  setTransportCompaniesYandex(context, data) {
    this.commit('setTransportCompaniesYandex', data);
  },

  cityOfNearestWarehouse(context, data) {
    this.commit('cityOfNearestWarehouse', data);
  },

  setTransportCompanyDataYandex(context, data) {
    Object.values(data.shipping_info.deliveries).forEach((company) => {
      this.commit('setTransportCompanyDataYandex', {
        shipping_info: {
          individual: data.shipping_info.individual,
        },
        type: data.type,
        order: data.order,
        id: Number(company.tk_id),
      });
    });
  },

  scrollTop(context, data) {
    if (data.parent) {
      data.parent.scrollTo({
        top: data.el.offsetTop,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: data.offsetTop - 80,
        behavior: 'smooth',
      });
    }
  },

  getPickpointInfo(context, data) {
    return Axios.post('/delivery/pp-info/', data)
      .then((response) => {
        if (response.data.success) {
          return response.data;
        }
        return response.data.success;
      });
  },

  addShippingValidation(context, { key, el }) {
    context.commit('addToShippingCompleteValidation', { key, el });
  },

  setShippingValidation(context, key) {
    context.commit('setToShippingCompleteValidation', { key, done: true });
  },
  
  setFalseShippingValidation(context, key) {
    context.commit('setToShippingCompleteValidation', { key, done: false });
  },

  unsetShippingValidation(context) {
    context.commit('unsetToShippingCompleteValidation');
  },

  // Use it for flush all u want
  unsetShipingData(context) {
    context.dispatch('unsetShippingValidation');
  },

  checkShippingValidation(context) {
    // console.log(context.state);

    Object.keys(context.state.shippingComplete).forEach((key) => {
      if (!context.state.shippingComplete[key].done) {
        context.commit('setToShippingCompleteValidation', { key, show: true });
      }
    });
    // return context.getters.getShippingCompleteValidation;
  },

  resetShippingValidationToBegin(context) {
    this.commit('saveFormData', {
      key: 'buyer_address',
      data: {},
    });
    Object.keys(context.state.shippingComplete).forEach((key) => {
      context.commit('setToShippingCompleteValidation', { key, show: false, done: false });
    });
  },

  removeOrder(context, key) {
    const paths = ['apiData', 'userData', 'transportCompaniesData'];

    paths.forEach((where) => {
      this.commit('removeOrder', {
        key,
        where,
      });
    });
  },

  removeOrders(context, key) {
    const paths = ['apiData', 'userData', 'transportCompaniesData'];

    paths.forEach((where) => {
      this.commit('removeOrders', {
        key,
        where,
      });
    });
  },

};