<template>
  <v-alert
    transition="scroll-y-reverse-transition"
    type="error"
    dense
    outlined
    text
    prominent
    :value="alerts.length > 0"
  >
    <v-list disabled flat>
      <v-list-item v-for="(alert, index) of alerts" :key="index">
        <v-list-item-content>
          <v-row no-gutters justify-start>
            <v-col
              v-for="(line, number) of alert"
              :key="number"
              class="pr-1"
              cols="auto"
            >
              {{ line.message }}
              <a
                v-if="line.url"
                class="font-weight-medium primary--text text-decoration-none"
                target="_blank"
                :href="line.url"
              >
                {{ line.linkText }}
                <v-icon v-once class="primary--text" small>
                  {{ linkIcon }}
                </v-icon>
              </a>
            </v-col>
          </v-row>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-alert>
</template>

<script>
import { mdiOpenInNew } from "@mdi/js";

export default {
  name: "ErrorAlertsList",

  props: {
    alerts: {
      type: Array,
      required: true,
    },
  },

  created() {
    this.linkIcon = mdiOpenInNew;
  },
};
</script>
