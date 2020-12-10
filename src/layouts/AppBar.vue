<template>
  <v-app-bar color="primary" app dark dense>
    <v-btn to="/" color="primary" outlined>
      <v-img
        alt="Vuetify Logo"
        class="mr-2 shrink"
        src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
        transition="scale-transition"
        width="40"
        contain
      />
      <span class="d-none d-sm-inline text-h6 white--text">
        {{ title }}
      </span>
    </v-btn>

    <v-spacer />

    <v-btn text @click="login">
      <span v-once>Войти</span>
      <v-icon v-once right>{{ accountIcon }}</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import { mdiCalendarAccountOutline } from "@mdi/js";

export default {
  name: "AppBar",
  data: () => ({
    title: "Планировщик мероприятий",
    accountIcon: mdiCalendarAccountOutline,
  }),
  methods: {
    login() {
      console.log("attempting login...");
      setTimeout(() => {
        console.log("OK!");
      }, 1000);
    },
  },
};
</script>
