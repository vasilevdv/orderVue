<template>
  <div class="shipping-step--aside" id="shipping-aside">
    <div
      class="shipping-step--aside--inner"
      :class="{fixed: isFixed}"
      :style="styles">

      <h2>Ваш заказ</h2>
      <div v-if="orders">
        <div
          v-for="(order, index) in orders"
          class="shipping-step__detailed-order"
          :key="index">

          <div
            class="shipping-step__detailed-order__item"
            v-for="(item, i) in order.items"
            :key="i">
            <p
              class="shipping-step__detailed-order__item__name"
              :title="item.item_name">
              {{item.item_name}}</p>
            <p class="shipping-step__detailed-order__item__info">
              {{item.item_count}} {{item.item_unit}} /
              {{item.item_price_with_discount | rur}} руб</p>
          </div>

          <div
            v-if="shipping_data"
            class="shipping-step__detailed-order__bottom">

            <template v-if="shipping_data.shipping_type === 'pickup'">
              <div class="shipping-step__detailed-order__bottom__row">
                <span>
                  Стоимость самовывоза</span>
                <b v-if="!is_manual">
                  {{ shipping_data.orders[index].price | rur}} руб.</b>
                <b v-else>
                  Ручной расчет</b>
              </div>

              <div
                v-if="!is_manual"
                class="shipping-step__detailed-order__bottom__row">
                <span>
                  Доступен к выдаче:</span>
                <b>
                  через 
                  {{shipping_data.orders[index].days | declDays}}</b>
              </div>
            </template>

            <template v-else>
              <div class="shipping-step__detailed-order__bottom__row">
                <span>
                  Стоимость доставки</span>
                <b v-if="!is_manual">
                  {{ shipping_data.orders[index].price | rur}} руб.</b>
                <b v-else>
                  Ручной расчет</b>
              </div>

              <div
                v-if="!is_manual"
                class="shipping-step__detailed-order__bottom__row">
                <span>
                  Доставим</span>
                <b>
                  через
                  {{shipping_data.orders[index].days | declDays}}</b>
              </div>
            </template>
            <!-- else MOVING-->
          </div>
        </div>
      </div>

      <delivery-info/>

    </div>

    <div class="shipping-step__checkout" ref="checkout">

      <div class="shipping-step__checkout__info">
        <span>Товары ({{items.count}})</span>
        <span class="shipping-step__checkout__info__price">{{items.price | rur}} руб.</span>
      </div>

      <div class="shipping-step__checkout__info">
        <span>Доставка</span>
        <span class="shipping-step__checkout__info__price">
          <template v-if="is_manual">Ручной расчет</template>
          <template v-else>
            <template v-if="shipping_price !== false">
              {{shipping_price | rur}} руб.</template>
            <template v-else> -- </template>
          </template>
        </span>
      </div>

      <div class="shipping-step__checkout__full-price">
        <span>
          Итого: </span>
        <span class="shipping-step__checkout__full-price__price">
          <template v-if="is_manual">Ручной расчет</template>
          <template v-else>
            <template v-if="full_price !== false">
              {{full_price | rur}} руб.</template>
            <template v-else> -- </template>
          </template>
        </span>
      </div>

      <button
        :class="{'disabled': !ready}"
        class="my-btn my-btn--flat yellow my-btn--boxed"
        @click="completeShipping($event)">

        <span class="my-btn__text">
         Перейти к оплате</span>
      </button>
    </div>
  </div>
</template>

<script>

import deliveryInfo from './delivery-info.vue';

export default {
  name: 'order-aside',
  props: [],
  components: {
    deliveryInfo,
  },

  data() {
    return {
      isFixed: false,
      el_sizes: {},
      parent_offset: {},
      styles: {},
      el_top: 0,
    };
  },

  computed: {
    orders() {
      if (this.$store.state.apiData.orders !== undefined) {
        if (Object.keys(this.$store.state.apiData.orders).length) {
          return this.$store.state.apiData.orders;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },

    first_order_value() {
      return Object.values(this.orders)[0];
    },

    first_order_id() {
      return Object.keys(this.orders)[0];
    },

    selected_orders() {
      return this.$store.state.userData.orders;
    },

    shipping_data() {
      if (Object.keys(this.$store.state.userData.shipping).length) {
        return this.$store.state.userData.shipping;
      }
      return false;
    },

    full_price() {
      if (this.shipping_data) {
        return this.items.price + this.shipping_price;
      }
      return false;
    },

    ready() {
      return this.$store.getters.isShippingComplete;
    },

    shipping_price() {
      if (this.shipping_data) {
        if (!this.is_manual) {
          return this.$store.getters.getShippingFullPrice;
        }
      }
      return false;
    },

    is_manual() {
      return this.$store.getters.getShippingFullPrice === 'manual';
    },

    items() {
      let count = 0;
      let price = 0;

      if (Object.values(this.orders).length) {
        Object.values(this.orders).forEach((order) => {
          count += +order.items.length;
          price += +order.items_total_price;
        });
      }

      return {
        count,
        price,
      };
    },
  },

  methods: {
    completeShipping() {
      if (this.ready) {
        this.$store.commit('setSpinnerStatus', true);
        this.$store.dispatch('setBuyerInfoToOrders');

        this.$axios.post('api/delivery/', this.$store.state.userData.orders)
          .then((response) => {
            if (!response.data.success) {
              throw 'delivery error';
            }
          })
          .then(() => {
            this.$axios('api/payment/')
              .then((response) => {
                if (response.data.success) {

                  this.$store.commit('setOrders', response.data.orders);
                  this.$store.commit('setPaymentTypes', response.data.payment_types);
                  this.$store.dispatch('nextScreen');

                  this.$store.dispatch('metricsReachGoal',
                    `order-${this.shipping_data.shipping_type}`);
                  this.$store.dispatch('metricsReachGoal',
                    `order-${this.shipping_data.shipping_type}-${this.shipping_data.tk}`);

                  let googleData = {
                    'event': 'order_payment',
                    'category': 'order',
                    'label': 'send',
                  };

                  this.$store.dispatch('googleReachGoal', googleData);

                  window.Metrics.stepShippingDone();
                }
              });
          })
          .catch(error => alert(error));
      } else {
        this.$store.dispatch('checkShippingValidation');
      }
    },

    updateOnScroll() {
      this.setParentOffsets();

      const headerHeight = document.getElementById('stick').offsetHeight;
      const footer = document.getElementsByClassName('footer')[0];

      this.isFixed = (this.el_top < window.pageYOffset + headerHeight);
      if (this.isFixed) {
        const elmPosition = this.$el.offsetHeight + window.pageYOffset + headerHeight + 40;

        if (elmPosition > footer.offsetTop) {
          this.el_sizes.top = -(elmPosition - footer.offsetTop) + headerHeight + 'px';
        } else {
          this.el_sizes.top = headerHeight + 'px';
        }

        this.styles = this.el_sizes;
      }
    },

    setParentOffsets() {
      const parent = this.$el.parentNode;
      this.parent_offset = {
        width: parent.offsetWidth,
        left: parent.offsetLeft,
      };
    },

    removeOrder(id) {
      this.$store.dispatch('removeOrder', id);
    },
  },

  watch: {},

  mounted() {
    this.setParentOffsets();

    this.el_top = this.$el.offsetTop;
    this.el_sizes = {
      left: `${this.parent_offset.left}px`,
      width: `${this.parent_offset.width}px`,
      top: `${document.getElementById('stick').offsetHeight}px`,
    };

  },
};
</script>