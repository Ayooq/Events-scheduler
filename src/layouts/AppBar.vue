<template>
  <v-app-bar color="primary" app dark dense>
    <router-link to="/">
      <v-img
        alt="Vuetify Logo"
        class="mr-2 shrink"
        src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
        transition="scale-transition"
        width="40"
        contain
      />

      <v-toolbar-title class="font-weight-bold text-uppercase">
        {{ title }}
      </v-toolbar-title>
    </router-link>

    <v-spacer />

    <v-btn text @click="login">
      <span v-once class="mr-2">Войти</span>
      <v-icon v-once>mdi-calendar-account-outline</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
  export default {
    name: "AppBar",
    data: () => ({
      title: "Планировщик мероприятий",
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
