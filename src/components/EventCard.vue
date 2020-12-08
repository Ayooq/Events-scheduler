<template>
  <v-card>
    <v-card-title v-if="!id">
      <span
        v-once
        class="headline"
      >
        Запланировать мероприятие
      </span>
    </v-card-title>

    <v-toolbar
      v-else
      dark
      :color="form.color"
    >
      <v-toolbar-title v-once>{{ name }}</v-toolbar-title>

      <v-spacer />

      <v-dialog
        v-model="confirmDelete"
        width="350"
      >
        <template #activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-icon v-once>mdi-delete</v-icon>
          </v-btn>
        </template>

        <v-card>
          <v-card-title
            v-once
            class="error white--text"
          >
            Удалить мероприятие?
          </v-card-title>

          <v-divider />

          <v-card-actions>
            <v-spacer />

            <v-btn
              color="error"
              text
              :loading="pending.delete"
              @click="deleteEvent"
            >
              <v-icon
                v-once
                left
              >
                mdi-delete-forever-outline
              </v-icon>
              <span v-once>Да</span>
            </v-btn>
            <v-btn
              color="info"
              text
              @click="confirmDelete = false"
            >
              <v-icon
                v-once
                left
              >
                mdi-delete-restore
              </v-icon>
              <span v-once>Нет</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>

    <v-card-text>
      <v-container>
        <ErrorAlertsList :alerts="alerts" />

        <v-form v-model="form.isValid">
          <v-row justify="space-around">
            <v-col
              cols="12"
              sm="11"
            >
              <v-text-field
                v-model.lazy.trim="form.name"
                label="Название"
                prepend-icon="mdi-rename-box"
                clearable
                required
                :rules="rules.name"
                :validate-on-blur="true"
              />
            </v-col>
            <v-col
              v-for="(picker, type, index) in pickers"
              :key="index"
              cols="12"
              :sm="picker.colSizeSm"
            >
              <v-menu
                :ref="type"
                v-model="picker.show"
                min-width="290"
                nudge-right="15"
                origin="bottom left"
                transition="scale-transition"
                offset-y
                top
                :close-on-content-click="false"
                :return-value.sync="form[type]"
              >
                <template #activator="{ on, attrs }">
                  <v-text-field
                    v-if="type === 'dateRange'"
                    persistent-hint
                    readonly
                    required
                    :hint="picker.hint"
                    :label="picker.label"
                    :prepend-icon="picker.icon"
                    :rules="rules.dateRange"
                    :validate-on-blur="true"
                    :value="formattedDates"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <template #append>
                      <v-tooltip
                        open-delay="10"
                        top
                      >
                        <template #activator="{ on: tipOn, attrs: tipAttrs }">
                          <v-icon
                            v-bind="{ ...tipAttrs }"
                            v-on="{ ...tipOn }"
                          >
                            mdi-help-circle-outline
                          </v-icon>
                        </template>
                        <span v-once>
                          После выбора начальной даты Вы можете выбрать дату
                          окончания, кликнув на другой день
                        </span>
                      </v-tooltip>
                    </template>
                  </v-text-field>
                  <v-text-field
                    v-else
                    v-model="form[type]"
                    readonly
                    :label="picker.label"
                    :prepend-icon="picker.icon"
                    :rules="rules[type]"
                    :validate-on-blur="true"
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-date-picker
                  v-if="type === 'dateRange'"
                  v-model="form.dateRange"
                  first-day-of-week="1"
                  locale="ru"
                  locale-first-day-of-year="4"
                  no-title
                  range
                  scrollable
                  :events="events"
                >
                  <v-spacer />

                  <v-btn
                    color="info"
                    text
                    @click="applyPickerState(type)"
                  >
                    OK
                  </v-btn>
                  <v-btn
                    color="error"
                    text
                    @click="picker.show = false"
                  >
                    Отмена
                  </v-btn>
                </v-date-picker>

                <v-time-picker
                  v-else
                  v-model="form[type]"
                  format="24hr"
                  full-width
                  scrollable
                  :color="picker.color"
                >
                  <v-spacer />

                  <v-btn
                    color="info"
                    text
                    @click="applyPickerState(type)"
                  >
                    OK
                  </v-btn>
                  <v-btn
                    color="error"
                    text
                    @click="picker.show = false"
                  >
                    Отмена
                  </v-btn>
                </v-time-picker>
              </v-menu>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </v-card-text>

    <v-card-actions>
      <v-spacer />

      <v-btn
        color="info"
        text
        :disabled="!form.isValid"
        :loading="pending.submit"
        @click="submitForm"
      >
        OK
      </v-btn>
      <v-btn
        color="error"
        text
        @click="close"
      >Отмена</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  import ErrorAlertsList from "./ErrorAlertsList.vue";

  export default {
    name: "EventCard",

    components: {
      ErrorAlertsList,
    },

    props: {
      // Event
      id: {
        type: [String, Number],
        default: null,
      },
      color: {
        type: String,
        default: "secondary",
      },
      name: {
        type: String,
        required: true,
      },
      dateRange: {
        type: Array,
        required: true,
      },
      timeStart: {
        type: String,
        required: true,
      },
      timeEnd: {
        type: String,
        required: true,
      },

      // Request callback
      onError: {
        type: Function,
        required: true,
      },
    },

    data() {
      return {
        today: new Date().toISOString().substring(0, 10),
        form: {
          isValid: false,
          color: this.color,
          name: this.name,
          dateRange: this.dateRange,
          timeStart: this.timeStart,
          timeEnd: this.timeEnd,
        },
        confirmDelete: false,
        pending: {
          delete: false,
          submit: false,
        },
        alerts: [],
        colors: [
          "blue",
          "indigo",
          "deep-purple",
          "cyan",
          "green",
          "orange",
          "red",
          "grey darken-1",
        ],
        pickers: {
          dateRange: {
            colSizeSm: 11,
            icon: "mdi-calendar",
            label: "Дата",
            hint: "Выберите диапазон",
            show: false,
          },
          timeStart: {
            colSizeSm: 5,
            icon: "mdi-clock-outline",
            label: "Время начала",
            color: "primary",
            show: false,
          },
          timeEnd: {
            colSizeSm: 5,
            icon: "mdi-clock",
            label: "Время окончания",
            color: "error",
            show: false,
          },
        },
        rules: {
          alerts: {
            requiredField: "Обязательное поле",
            todayThreshold: "Дата начала не может быть меньше текущей",
            negativeTimeInterval: "Время установлено некорректно",
          },
          name: [(value) => !!value || this.rules.alerts.requiredField],
          dateRange: [
            (range) => range.length > 0 || this.rules.alerts.requiredField,
            (range) => {
              const isValid = range.every((date) => (date >= this.today));
              return isValid || this.rules.alerts.todayThreshold;
            },
          ],
          timeStart: [(value) => this.validateTime(value)],
          timeEnd: [(value) => this.validateTime(value, false)],
        },
      };
    },

    computed: {
      // Vuex
      events() {
        return this.$store.state.events;
      },

      // Local
      selectedDates() {
        return this.form.dateRange.length;
      },
      formattedDates() {
        switch (this.selectedDates) {
          case 0:
            return [];
          case 1:
            return this.formatDate(this.form.dateRange[0]);
        }

        return this.form.dateRange
          .map((date) => this.formatDate(date))
          .join(" — ");
      },
    },

    mounted() {
      this.$nextTick(() => {
        console.log(this.$el);
        console.log(this.$refs);
        console.log(this.$parent);
        console.log(this.$children);
        console.log(this.$props);
        console.log(this.$data);
      });
    },

    methods: {
      // Vuex
      sendData(payload) {
        return this.$store.dispatch("api/sendData", payload);
      },

      // BACKEND

      // Requests
      async submitForm() {
        console.log("submitting form...");
        this.alerts = [];

        if (this.id && this.hasNoChanges()) {
          const message = "Для сохранения необходимо внести изменения.";
          this.alerts.push({ text: { message } });
          this.form.isValid = false;
          return;
        }

        const callbackType = this.id ? "Put" : "Post";
        const successCallback = `on${callbackType}Success`;
        const method = callbackType.toUpperCase();
        const body = this.getPayloadBody();
        const payload = { method, body };

        this.pending.submit = true;

        try {
          const response = await this.sendData(payload);
          this[successCallback](response);
          this.close();
        } catch (error) {
          this.onError(error);
        }

        this.pending.submit = false;
      },
      async deleteEvent() {
        console.log("deleting event...");
        const method = "DELETE";
        const body = { id: this.id };
        const payload = { method, body };

        this.pending.delete = true;

        try {
          await this.sendData(payload);
          this.onDeleteSuccess();
          this.close();
        } catch (error) {
          this.onError(error);
        }

        this.pending.delete = false;
        this.confirmDelete = false;
      },

      // Callbacks
      onPostSuccess(response) {
        this.$emit("events:add", response);
      },
      onPutSuccess(response) {
        this.$emit("events:update", response);
      },
      onDeleteSuccess() {
        this.$emit("events:delete");
      },

      // FRONTEND

      // Utilities
      formatDate(date) {
        const [year, month, day] = date.split("-");
        return `${day}.${month}.${year.substring(2)}`;
      },

      // Validators
      validateTime(value, isStartType = true) {
        if (this.selectedDates === 0) return true;

        const [dateStart, dateEnd] = this.form.dateRange;
        if (dateStart !== dateEnd) return true;

        let isValid;

        if (isStartType) {
          isValid = value <= this.form.timeEnd;
        } else {
          isValid = value >= this.form.timeStart;
        }

        return isValid || this.rules.alerts.negativeTimeInterval;
      },

      hasNoChanges() {
        return (
          this.selectedDates === this.dateRange.length
          && this.form.color === this.color
          && this.form.name === this.name
          && this.form.dateRange[0] === this.dateRange[0]
          && this.form.dateRange[1] === this.dateRange[1]
          && this.form.timeStart === this.timeStart
          && this.form.timeEnd === this.timeEnd
        );
      },

      // Getters
      getFormWithNormalizedRanges() {
        const dateRange = this.form.dateRange;
        const timeStart = this.form.timeStart;
        const timeEnd = this.form.timeEnd;

        if (this.selectedDates === 1) {
          dateRange.push(dateRange[0]);
        }

        dateRange.sort();
        this.form.timeStart = timeStart ? timeStart : timeEnd || "00:00";
        this.form.timeEnd = timeEnd ? timeEnd : timeStart || "23:59";

        return this.form;
      },

      getPayloadBody() {
        const form = this.getFormWithNormalizedRanges();
        console.log("form is:");
        console.log(form);

        const payloadBody = {
          color: form.color,
          name: form.name,
          start: [form.dateRange[0], form.timeStart].join(" "),
          end: [form.dateRange[1], form.timeEnd].join(" "),
        };

        if (this.id) {
          payloadBody.id = this.id;
        }

        return payloadBody;
      },

      // Handlers
      applyPickerState(type) {
        const ref = this.$refs[type];

        if (Array.isArray(ref)) {
          ref[0].save(this.form[type]);
        } else {
          ref.save(this.form[type]);
        }
      },

      close() {
        this.$emit("close");
      },
    },
  };
</script>

<style scoped>
  @-moz-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-webkit-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-o-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
