<template>
  <div class="shipping-step">
    <div class="shipping-step--section">

      <div class="card-box ">
        <h1>Выберите город получения</h1>
        <div
          class="shipping-step--section--suggestion-wrapper">

          <custom-suggestions
            :data="destination_city"
            @status="citySuggestionStatusChecker"
            v-debounce="selectCityWithCheckForSuggestions"
            @select="selectCity"/>

            <div
              v-if="last_delivery_list.length && is_last_delivery_list_show"
              class="shipping-step--section--suggestion-wrapper--hint">
            <h4 class="shipping-step--section--suggestion-wrapper--hint--h">Вы вводили ранее</h4>
            <ul class="shipping-step--section--suggestion-wrapper--hint--list">
              <li
                v-for="(last_delivery, index) in last_delivery_list"
                :key="index"
                class="shipping-step--section--suggestion-wrapper--hint--list--i">
                  <button @click="setCityByHint(last_delivery)"
                          class="shipping-step--section--suggestion-wrapper--hint--list--button">
                    {{ last_delivery.delivery_address || last_delivery.delivery_city }}
                  </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <order-aside/>

  </div>
</template>
<script>
import orderAside from './aside/aside-index.vue';

export default {
  name: '',
  components: {
    orderAside,
  },
  data() {
    return {
      destination_city: {
        input: {
          label: '',
          value: '',
          id: '',
          errorMsg: '',
        },
      },
      search_city: '',
      search_city_data: null,
      index: '',
      show_step_two: false,
      delivery_types: null,
      selected_delivery_type: '',
      is_last_delivery_list_show: true,
      citySuggestionShow: false,
    };
  },
  computed: {
    orders() {
      return this.$store.state.apiData.orders;
    },

    first_order_value() {
      return Object.values(this.orders)[0];
    },

    first_order_id() {
      return Object.keys(this.orders)[0];
    },

    ready() {
      return this.$store.state.userData.shipping;
    },

    user_type() {
      return this.$store.state.userData.user_type;
    },

    destination_city_error() {
      if (this.$store.getters.getShippingCompleteValidationShow('shipping_city')) {
        return 'Необходимо выбрать город получения';
      }
      return '';
    },

    last_delivery_list() {
      return this.$store.getters.lastDeliveryList;
    },

    user_info() {
      return this.$store.state.response.user_info || false;
    },

    show_step_three() {
      if (this.$store.getters.getShippingCompleteValidationDone('shipping_type_detailed')) {
        return true;
      }
      return false;
    },

    is_pickpoints_aviable() {
      return this.selected_delivery_type === 'pickup'
        && this.delivery_types.pickup.enabled;
    },

  },
  watch: {
    destination_city_error(val) {
      this.$set(this.destination_city.input, 'errorMsg', val);
    },
  },

  mounted() {
    this.$store.dispatch('unsetShipingData');
    this.$store.dispatch('setHistory', 2);
    this.$store.commit('setSpinnerStatus', false);
    this.$store.dispatch('addShippingValidation', {
      key: 'shipping_city',
      el: this.$el,
    });
  },

  beforeDestroy() {
    this.$store.dispatch('setRecieverInfo', null);
  },

  methods: {
    setCityByHint(event) {
      this.$set(this.destination_city.input, 'value', event.delivery_city || event.delivery_dest_city);

      this.selectCity({
        name: event.delivery_city || event.delivery_dest_city,
        pk: event.delivery_city_id || event.delivery_dest_city_id,
      });

      this.$store.dispatch('saveFormData', {
        key: 'buyer_address',
        data: event,
      });

      this.is_last_delivery_list_show = false;
    },

    selectCity(event) {
      if (event) {
        this.$store.commit('setLocalDeliveryCityData', event);
        const data = {};

        if (typeof event === 'string') {
          data.city_name = event;
        } else if (event.pk) {
          data.city_id = event.pk;
        } else {
          data.city_name = event.target.value;
        }

        this.$axios.post('/delivery/set-delivery/', data).then((response) => {
          this.$store.dispatch('setApiDataOrders', response.data.orders);
          this.$store.dispatch('setTransportCompanies', response.data.delivery_types);        

          this.delivery_types = response.data.delivery_types;
          this.setSelectedDeliveryType();

          this.search_city = event.name;
          this.search_city_data = event;
          this.show_step_two = true;
        });
      }
    },

    setSelectedDeliveryType() {
      this.selected_delivery_type = this.delivery_types.pickup.enabled ? 'pickup' : 'buyer-address';
    },

    selectDeliveryTypes(event) {
      this.selected_delivery_type = event;
    },

    citySuggestionStatusChecker({ val }) {
      this.citySuggestionShow = val;
    },

    selectCityWithCheckForSuggestions() {
      if (!this.citySuggestionShow) this.selectCity();
    },
  },
};
</script>