<template>

  <div class="custom-form--label__tk-select-row">
    <div
      v-for="(tk, i) in types" :key="i">
      <label
        v-if="tk.tk_id != 7"
        class="custom-form--label__tk-mod-grid">

        <spinner
          v-if="!prices[tk.tk_id]"
          :classList="'vue-spinner--mini'"
          :wrapperClassList="'vue-spinner--wrapper--center'"/>

        <detail-grid
          v-if="prices[tk.tk_id]"
          :type="type"
          :deliveryPeriod="prices[tk.tk_id].days"
          :deliveryCost="prices[tk.tk_id].price"/>

        <div
          v-if="tk.tk_id === CUSTOM_TK"
          class="custom-form--label__tk-mod">
          <label class="custom-form--label"></label>
          <textarea
            class="custom-form--textarea form--input"
            v-model="comment"
            placeholder="Информация о ТК"
            @focus="comment_novalid = false"
            @blur="editComment(prices[CUSTOM_TK].price)"></textarea>

          <p
            v-if="comment_novalid && comment_field_visible"
            class="error">
            Укажите информацию о ТК</p>
        </div>
      </label>
    </div>
  </div>
</template>

<script>

import detailGrid from './detail-grid.vue';

export default {
  name: 'tk-select',
  components: {
    spinner,
    detailGrid,
  },
  props: ['type'],
  data() {
    return {
      comment_field_visible: false,
      is_custom_tk_selected: false,
      comment_novalid: true,
      comment: '',
      CUSTOM_TK: 99,
      selected_tk: null,
      selected_btn: false,
      selected_delivery: {},
      tk_img: {
        1495: 'trans-logo-bb.png',
        1516: 'trans-logo-sdek.png',
        3390: 'trans-logo-pochta.png',
        3937: 'trans-logo-dpd.png',
      },
      timeout: () => {},
      // calcsDone: false,
    };
  },

  computed: {
    orders() {
      return this.$store.state.apiData.orders;
    },
    types() {
      return this.$store.getters.transportCompaniesByType(this.type);
    },
    typesYandex() {
      return this.$store.getters.transportCompaniesByTypeYandex(this.type);
    },
    prices() {
      return this.$store.getters.transportCompaniesDataByType(this.type);
    },
    pricesYandex() {
      return this.$store.getters.transportCompaniesDataByTypeYandex(this.type);
    },

    is_custom_tk() {
      return this.CUSTOM_TK === this.selected_tk.tk_id;
    },
  },

  watch: {
    types() {
      this.trigReCalc();
    },
    orders() {
      this.trigReCalc();
    },
    comment(newVal) {
      clearTimeout(this.timeout);
      if (newVal.length) {
        this.timeout = setTimeout(() => {
          this.setDeliveryData();
          this.setDeliveryDataYandex();
          this.is_custom_tk_selected = false;
        }, 500);
      } else {
        clearTimeout(this.timeout);
        this.is_custom_tk_selected = true;
        this.$store.dispatch('setFalseShippingValidation', 'shipping_type_detailed');
      }
    },
  },

  mounted() {
    if (this.type === 'terminal_warehouse_city_delivery'
    || this.type === 'buyer_city_terminal') {
      this.calculateTk();
    }
  },

  beforeMount() {
    if (Object.keys(this.prices).length === 0 && this.prices.constructor === Object) {
      this.$store.commit('resetTransportCompaniesData');
    }
    this.types;
  },

  methods: {
    trigReCalc() {
      this.comment_field_visible = false;
      this.comment_novalid = false;
      this.calculateTk();
    },

    selectTkYandex(tk) {
      this.selected_tk = tk;
      this.is_custom_tk_selected = (this.is_custom_tk && !this.comment.length);

      this.selected_delivery = {
        tk_id: tk.tk_id,
        tk_current: tk.tk_id,
        tk_name: tk.tk_name,
        price: this.pricesYandex[tk.tk_id].price || 'manual',
        custom: (tk.tk_id === this.CUSTOM_TK),
        comment: this.comment || null,
        type_shipping: this.type,
      };

      if (!(this.comment_novalid && this.is_custom_tk)) {
        this.setDeliveryDataYandex();
      } else {
        this.$store.dispatch('setFalseShippingValidation', 'shipping_type_detailed');
      }

      this.comment_field_visible = (tk.tk_id === this.CUSTOM_TK);

      this.$store.dispatch('selectTkYandex', this.selected_delivery);
      this.$emit('selected', this.selected_delivery);
    },

    editComment() {
      this.$set(this.selected_delivery, 'comment', this.comment);

      if (!this.comment.length) this.comment_novalid = true;

      this.$emit('selected', this.selected_delivery);
    },

    setDeliveryDataYandex() {
      this.$store.dispatch('setDeliveryDataYandex', {
        shipping_type: this.type,
        city: this.$store.state.userData.delivery_city_data.name,
        name: this.selected_tk.tk_name,
        tk: 7,
        tk_current: this.selected_tk.tk_id,
        tk_name: this.selected_tk.tk_name,
        orders: this.$store.getters.getTransportCompaniesDataByTypeYandex(this.type, this.selected_tk.tk_id),
      });
    },
  },
};
</script>