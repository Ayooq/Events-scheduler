<template>
  <v-alert
    transition="scroll-y-reverse-transition"
    type="error"
    dense
    outlined
    prominent
    text
    :value="!!alerts.length"
  >
    <v-list>
      <v-list-item v-for="(alert, index) of alerts" :key="index">
        <span>
          {{ alert.text.message }}
          <a
            v-if="alert.url"
            class="font-weight-medium primary--text text-decoration-none"
            target="_blank"
            :href="alert.url"
          >
            {{ alert.text.clickableText }}
            <v-icon v-once class="primary--text" small>
              mdi-open-in-new
            </v-icon>
          </a>
        </span>
      </v-list-item>
    </v-list>
  </v-alert>
</template>

<script>
export default {
  name: "ErrorAlertsList",

  props: {
    alerts: {
      type: Array,
      required: true,
    },
  },
};
</script>
