export default {
  userGeo: (state) => {
    if (
      state.userData.user_info
      && state.userData.user_info.lat
      && state.userData.user_info.lng
    ) {
      return {
        lat: +state.userData.user_info.lat,
        lng: +state.userData.user_info.lng,
      };
    }
  },

  getEntity: state => (
    state.userData.entity
    || sessionStorage.getItem('ing-order__user-entity')
  ),

  getReceiverInfo: state => (index) => {
    if (typeof state.userData.orders[index] !== 'undefined') {
      return state.userData.orders[index].receiver_info;
    }

    return state.apiData.orders[index].receiver_contacts;
  },

  orderInfoForPpInfo: state => (index) => {
    const order = state.apiData.orders[index];

    return {
      cargo_weight: order.cargo_weight,
      warehouse_city_id: order.warehouse_city_id,
    };
  },

  getShippingPrice: (state) => {
    let res = 0;
    for (const order in state.apiData.orders) {
      if (state.apiData.orders[order].shipping_price == 'manual') {
        return 'manual';
      } if (state.apiData.orders[order].shipping_price) {
        res += +state.apiData.orders[order].shipping_price;
      }
    }
    return res;
  },

  getShippingFullPrice: (state) => {
    let res = 0;
    let manual = false;
    if (Object.keys(state.userData.shipping).length) {
      Object.values(state.userData.shipping.orders).forEach((order) => {
        if (order.individual) {
          manual = 'manual';
        }
        res += +order.price;
      });
    }
    return manual || res;
  },

  getWarehousesByCity: state => (city) => {
    const res = [];
    for (const wh in state.apiData.warehouses) {
      if (state.apiData.warehouses[wh].City === city) {
        res.push(state.apiData.warehouses[wh]);
      }
    }
    return res;
  },

  getWhShortCityForOrder: state => index => state.apiData.warehouses[index].City,

  getPointForOrder: state => (index) => {
    let code;

    if (state.userData.orders[index]) {
      // return state.apiData.orders[index].selectedPickpoint.pp
      code = state.userData.orders[index].code;
      for (const wh in state.apiData.warehouses) {
        if (code === state.apiData.warehouses[wh].Code) return state.apiData.warehouses[wh];
      }
      for (const pp in state.apiData.pickpoints) {
        if (code === state.apiData.pickpoints[pp].Code) return state.apiData.pickpoints[pp];
      }
    }
  },

  getPointCost: state => index => (state.userData.orders[index]
    ? state.userData.orders[index].cost
    : 0),

  getPointTk: state => index => state.userData.orders[index].tk,

  getPointDeliveryPeriod: state => index => (state.userData.orders[index]
    ? state.userData.orders[index].deliveryPeriod
    : 0),

  getOrder: state => index => (
    state.userData.orders[index] ? state.userData.orders[index] : null
  ),

  isCombined: (state) => {
    if (state.apiData.orders) {
      return Object.keys(state.apiData.orders).length > 1;
    }
  },

  getOrderWeight: state => index => state.apiData.orders[index].cargo_weight,

  firstOrderKey: (state) => {
    for (const key in state.apiData.orders) {
      if (state.apiData.orders.hasOwnProperty(key)) return key;
    }
  },

  getShippingCompleteValidationShow: state => (key) => {
    if (state.shippingComplete[key]) {
      return state.shippingComplete[key].show;
    }
    return false;
  },

  getShippingCompleteValidationDone: state => (key) => {
    if (state.shippingComplete[key]) {
      return state.shippingComplete[key].done;
    }
    return false;
  },

  // shipping new stuff
  transportCompaniesByType: state => type => state.apiData.transportCompaniesList[type].tk_list,

  transportCompaniesByTypeYandex: state => type => state.apiData.transportCompaniesYandexList[type],

  transportCompaniesDataByType: state => (type) => {
    const data = {};
    if (state.apiData.transportCompaniesData) {
      Object.values(state.apiData.transportCompaniesData).forEach((order) => {
        if (order[type]) {
          Object.keys(order[type]).forEach((company) => {
            if (!data[company]) {
              data[company] = {
                price: 0,
              };
            }

            data[company].price += +parseFloat(order[type][company].price).toFixed(2);
            if (!data[company].days
              || order[type][company].days > data[company].days) {
              data[company].days = order[type][company].days;
            }
          });
        }
      });
    }

    return data;
  },

  transportCompaniesDataByTypeYandex: state => (type) => {
    const data = {};
    if (state.apiData.transportCompaniesYandex) {
      Object.values(state.apiData.transportCompaniesYandex).forEach((order) => {
        if (order[type]) {
          Object.keys(order[type]).forEach((company) => {
            if (!data[company]) {
              data[company] = {
                price: 0,
              };
            }

            data[company].price += +parseFloat(order[type][company].price).toFixed(2);
            if (!data[company].days
              || order[type][company].days > data[company].days) {
              data[company].days = order[type][company].days;
            }
          });
        }
      });
    }

    return data;
  },

  getTransportCompaniesDataByType: state => (type, id) => {
    const data = {};
    const TKData = state.apiData.transportCompaniesData;

    Object.keys(TKData).forEach((key) => {
      data[key] = TKData[key][type][id];
    });

    return data;
  },

  getTransportCompaniesDataByTypeYandex: state => (type, id) => {
    const data = {};
    const TKData = state.apiData.transportCompaniesYandex;

    Object.keys(TKData).forEach((key) => {
      data[key] = TKData[key][type][id];
    });

    return data;
  },

  getUserDataShipping: (state) => {
    if (Object.keys(state.userData.shipping).length) {
      return state.userData.shipping;
    }
    return false;
  },

  isShippingComplete: (state) => {
    let res = true;
    Object.values(state.shippingComplete).forEach((item) => {
      if (!item.done) res = false;
    });
    return res;
  },

  getItemsPrice: (state) => {
    let summ = 0;

    if (state.response) {
      if (state.response.orders) {
        Object.values(state.response.orders).forEach((order) => {
          summ += +order.items_total_price_with_discount;
        });
      }
    }

    return summ;
  },
};