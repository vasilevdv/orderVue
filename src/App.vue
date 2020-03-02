<template>
  <div>
    <steps
      v-on:step="setStep"
      v-bind:currentStep="currentForm"/>
    <contacts-step
      v-if="currentForm == 1"
      />
    <shipping-step-new v-if="currentForm == 2"/>
    <confirm-step
      v-on:reset="setStep({form:1})"
      v-if="currentForm == 3"/>
    <spinner
      v-if="isSpinnerShow"
      :wrapperClassList="'global-spinner'"/>
  </div>
</template>

<script>
import shippingNew from './components/shipping/shipping-index.vue';

export default {
  name: 'app',
  components: {
    steps,
    'contacts-step': contacts,
    'shipping-step-new': shippingNew,
    'confirm-step': confirm,
    spinner,
    informer,
  },

  data() {
    return {
      isAuthorezed: false,
    };
  },

  created() {
    window.onpopstate = (event) => {
      this.$axios('/rest/v1/my/cart').then((response) => {});

      if (event.state) {
        this.$store.dispatch('setScreen', event.state.currentForm);
      } else {
        window.history.back();
      }
    };

    this.$store.commit('setToken', {
      csrf: window.getCookie('csrftoken'),
    });

    this.$bus.$on('shipping-check', (data) => {
      console.log('on shipping-check callback...');
      this.checkedShipping = data;

      alert('shipping selected!');
    });
  },

  computed: {
    isSpinnerShow() {
      return this.$store.state.apiData.isSpinnerShow;
    },
    currentForm() {
      return this.$store.state.currentScreen;
    },
  },

  watch: {
    currentForm() {
      window.scrollTo(0, 0);
      if (!this.currentForm >= 3) {
        sessionStorage.setItem('ing-order__step', this.currentForm);
      }
    },
  },

  mounted() {
    sessionStorage.setItem('ing-order__step', this.currentForm);
  },

  methods: {
    setStep(data) {
      this.$store.dispatch('setScreen', data.form);
    },
  },
};
</script>