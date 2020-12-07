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
      <span class="white--text text-h6">
        {{ title }}
      </span>
    </v-btn>

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
