<template>
  <div class="oi-grid" >
    <template v-if="delivery_cost">
      <div v-if="deliveryPeriod">
        <p>
          {{ type === 'terminal_warehouse_city_delivery' ? 'срок подвоза:' : 'срок доставки:'}}
        </p>
        <p class="oi-grid__days">
          {{ deliveryPeriod | declDays }}</p>
      </div>
      <div>
        <p>
          {{ type === 'terminal_warehouse_city_delivery' ? 'стоимость подвоза:' : 'стоимость:'}}
        </p>
        <p class="oi-grid__price">
          {{ deliveryCost | rur }} руб.</p>
      </div>
    </template>
    <template v-else>
      <p>Ручной расчёт доставки</p>
    </template>
  </div>
</template>
<script>

export default {
  name: 'detail-grid',
  props: ['deliveryPeriod', 'deliveryCost', 'type'],
  computed: {
    delivery_cost() {
      return this.deliveryCost || this.deliveryCost === 0;
    },
  },
};
</script>
