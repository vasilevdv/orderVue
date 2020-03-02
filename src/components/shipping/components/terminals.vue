<template>
  <div>
    <spinner
      class="alignt-center"
      v-if="isSpinnerShown"/>

    <tk-select
      v-if="!tkSelectHidden && suggestions.input.value"
      :prices="prices"
      @selected="selectTk($event)"/>
  </div>
</template>
<script>
import tkSelect from './tk-select.vue';
import spinner from '../../helpers/spinner.vue';

export default {
  name: 'terminals',

  components: {
    tkSelect,
    spinner,
  },

  props: [
    'deliveryData',
    'order',
    'index',
    'tk_img',
    'destinationCity',
    'types',
    'prices',
  ],

  data() {
    return {
      suggestions: {
        target: 'address',
        set: 'city_address',
        city_id: null,
        input: {
          label: 'Город',
          value: null,
        },
      },
      tkSelectHidden: false,
      shipping_price: 0,
      selected_delivery: {},
      showPriceResult: false,
      isSearched: false,
      isSpinnerShown: false,
    };
  },

  computed: {
    local_data() {
      return this.$store.state.userData[this.index] || false;
    },
    selected_city() {
      if (this.local_data) return this.local_data['selected-city'];

      return false;
    },
  },

  watch: {},

  mounted() {
    if (this.selected_city) {
      this.pickLocation(this.selected_city);
      this.$set(this.suggestions.input, 'value', this.selected_city.header);
    }
  },

  methods: {
    pickLocation(data) {
      if (this.citiesEqual(this.order.warehouse_city, data.data.city)) {
        this.suggestions.input.value = '';
        this.suggestions.city_id = null;

        this.suggestions.input.errorMsg = 'Город доставки не должен совпадать с городом отправки.';
      } else {
        this.suggestions.input.errorMsg = null;
        this.isSpinnerShown = true;

        this.$store
          .dispatch('changeDeliveryDestination', {
            address: data.header,
            index: this.index,
            type: this.deliveryData.type_shipping,
          })
          .then(() => {
            console.warn('changeDeliveryDestination', data.header);
            this.tkSelectHidden = false;
            this.isSearched = true;
            this.deliveryData.city_search.value = data.header;
            this.citySuggestionsShow = false;
            this.isSpinnerShown = false;
          })
          .catch(() => {
            console.error('Ошибка!');
            this.suggestions.input.value = this.deliveryData.city_search.value;
            window.showMessage('Не удалось измененить адрес', 'error');
          });
      }
    },

    tkCalcsHide() {
      this.tkSelectHidden = true;
      this.$emit('select', false);
    },

    citiesEqual(a, b) {
      return a.indexOf(b) >= 0 || b.indexOf(a) >= 0;
    },

    selectTk(data) {
      if (!data) this.showPriceResult = false;
      if (data.custom) this.showPriceResult = data.comment;
      if (!data.custom) this.showPriceResult = true;
      this.setShippingPrice(data.price);
      if (data.custom && !data.comment) this.$emit('select', false);
    },

    setShippingPrice(price) {
      this.shipping_price = price;
      this.$emit('set-shipping-price', price);
      this.$emit('select', true);
    },
  },
};
</script>