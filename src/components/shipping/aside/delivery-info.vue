<template>
  <div class="shipping-step__detailed-shipping">

    <template v-if="shipping_data.shipping_type === 'pickup'">
      <p class="shipping-step__detailed-shipping__item">
          Самовывоз
          {{pickpoint_name[shipping_data.tk]}}
          по адресу: <br>
          <b>{{shipping_data.address}}</b></p>
    </template>

    <template v-if="shipping_data.shipping_type === 'buyer_address'">
      <p class="shipping-step__detailed-shipping__item">
        Доставка до адреса: {{shipping_data.city}},
        {{street_data.delivery_street}},
        д. {{street_data.delivery_building}}
          <br>
        <span v-if="street_data.delivery_apartment">
          кв. {{street_data.delivery_apartment}}
        </span>
        <span v-if="street_data.delivery_floor">
          этаж {{street_data.delivery_floor}}
        </span>
      </p>
    </template>

    <template v-if="shipping_data.shipping_type === 'terminal_warehouse_city_delivery'">
      <p class="shipping-step__detailed-shipping__item">
        Подвоз до терминала транспортной компании
        <b>"{{shipping_data.name}}"</b></p>
    </template>

    <template v-if="shipping_data.shipping_type === 'buyer_city_terminal'">
      <p class="shipping-step__detailed-shipping__item">
        Доставка до терминала в городе
        <b>{{shipping_data.city}}</b>
        транспортной компании <b>"{{shipping_data.name}}"</b>
      </p>
    </template>
  </div>
</template>

<script>

export default {
  name: '',
  props: [],
  components: {},
  data() {
    return {
      pickpoint_name: {
        0: 'со склада Стоинг',
        4: 'из пункта выдачи посылок BoxBerry',
      },
    };
  },

  computed: {
    shipping_data() {
      if (Object.keys(this.$store.state.userData.shipping).length) {
        return this.$store.state.userData.shipping;
      }
      return false;
    },

    street_data() {
      if (Object.keys(this.$store.state.userData.buyerAddressForm).length > 0) {
        return this.$store.state.userData.buyerAddressForm;
      }
      return false;
    },
  },
  
  methods: {},
  watch: {},
  mounted() {},
};
</script>