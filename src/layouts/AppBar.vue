<template>
  <v-app-bar app color="primary" dense dark>
    <div class="align-center d-flex">
      <v-img
        alt="Vuetify Logo"
        class="mr-2 shrink"
        contain
        src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
        transition="scale-transition"
        width="40"
      />

      <v-toolbar-title class="font-weight-bold text-uppercase">
        {{ title }}
      </v-toolbar-title>
    </div>

    <v-spacer />

    <v-btn text @click="loginViaGithub">
      <span class="mr-2">Войти</span>
      <v-icon>mdi-calendar-account-outline</v-icon>
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
      loginViaGithub() {
        console.log("attempting login...");
      },
    },
  };
</script>
