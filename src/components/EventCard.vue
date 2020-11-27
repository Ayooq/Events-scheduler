<template>
  <v-card>
    <v-card-title v-if="isNew">
      <span v-once class="headline">Запланировать мероприятие</span>
    </v-card-title>

    <v-toolbar v-else dark :color="color">
      <v-toolbar-title v-once>{{ name }}</v-toolbar-title>

      <v-spacer />

      <v-dialog v-model="deleteDialog" width="350px">
        <template #activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon v-once>mdi-delete</v-icon>
          </v-btn>
        </template>

        <v-card>
          <v-card-title v-once class="error white--text"
            >Удалить мероприятие?</v-card-title
          >

          <v-divider />

          <v-card-actions>
            <v-spacer />

            <v-btn
              color="error"
              text
              :loading="pending.delete"
              @click="deleteRequest"
            >
              <v-icon v-once left>mdi-delete-forever-outline</v-icon>
              <span v-once>Да</span>
            </v-btn>
            <v-btn color="info" text @click="deleteDialog = false">
              <v-icon v-once left>mdi-delete-restore</v-icon>
              <span v-once>Нет</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>

    <v-card-text>
      <v-container>
        <ErrorAlertsList :alerts="alerts" />

        <v-form v-model="formIsValid">
          <v-row justify="space-around">
            <v-col cols="12" sm="11">
              <v-text-field
                v-model.lazy.trim="name"
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
              cols="12"
              :key="index"
              :sm="picker.colSizeSm"
            >
              <v-menu
                :ref="type"
                v-model="picker.show"
                min-width="290px"
                nudge-right="15"
                origin="bottom left"
                transition="scale-transition"
                offset-y
                top
                :close-on-content-click="false"
                :return-value.sync="[type]"
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
                    :rules="rules"
                    :validate-on-blur="true"
                    :value="dateFormatted"
                    v-bind="attrs"
                    @input.prevent
                    v-on="on"
                  >
                    <template #append>
                      <v-tooltip top>
                        <template #activator="{ on: at, attrs: bindings }">
                          <v-icon v-bind="bindings" v-on="at"
                            >mdi-help-circle-outline</v-icon
                          >
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
                    v-model="[type]"
                    readonly
                    :label="picker.label"
                    :prepend-icon="picker.icon"
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-date-picker
                  v-if="type === 'dateRange'"
                  v-model=".dateRange"
                  first-day-of-week="1"
                  locale="ru"
                  locale-first-day-of-year="4"
                  no-title
                  range
                  scrollable
                  :events="events"
                >
                  <v-spacer />

                  <v-btn color="info" text @click="applyPickerState(type)"
                    >OK</v-btn
                  >
                  <v-btn color="error" text @click="picker.show = false"
                    >Отмена</v-btn
                  >
                </v-date-picker>

                <v-time-picker
                  v-else
                  v-model="[type]"
                  format="24hr"
                  full-width
                  scrollable
                  :color="picker.color"
                >
                  <v-spacer />

                  <v-btn color="info" text @click="applyPickerState(type)"
                    >OK</v-btn
                  >
                  <v-btn color="error" text @click="picker.show = false"
                    >Отмена</v-btn
                  >
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
        color="success"
        text
        :disabled="!formIsValid"
        :loading="pending.submit"
        @click="submitRequest"
        >Сохранить</v-btn
      >
      <v-btn color="error" text @click="cancelFormEditing">Отмена</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
import ErrorAlertsList from './ErrorAlertsList.vue';

const {
  mapState: mapEventState,
  mapMutations: mapEventMutations,
  mapActions: mapEventActions,
} = createNamespacedHelpers('event');

export default {
  name: 'EventCard',

  components: {
    ErrorAlertsList,
  },

  props: {
    isNew: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: 'secondary',
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
    rejectionCallback: {
      type: Function,
      required: true,
    },
  },

  data: () => ({
    deleteDialog: false,
    pending: {
      delete: false,
      submit: false,
    },
    alerts: [],
    colors: [
      'blue',
      'indigo',
      'deep-purple',
      'cyan',
      'green',
      'orange',
      'red',
      'grey darken-1',
    ],
    pickers: {
      dateRange: {
        colSizeSm: 11,
        icon: 'mdi-calendar',
        label: 'Дата',
        hint: 'Выберите диапазон',
        show: false,
      },
      timeStart: {
        colSizeSm: 5,
        icon: 'mdi-clock-outline',
        label: 'Время начала',
        color: 'primary',
        show: false,
      },
      timeEnd: {
        colSizeSm: 5,
        icon: 'mdi-clock',
        label: 'Время окончания',
        color: 'error',
        show: false,
      },
    },
    rules: [ state => state !== null && !!state.length || 'Обязательное поле' ],
    today: new Date().toISOString().substring(0, 10),
  }),

  computed: {
    // Vuex
    events() {
      return this.$store.state.events;
    },
    ...mapEventState({
      eventIsValid: 'formIsValid',
      eventColor: 'color',
      eventName: 'name',
      eventDateRange: 'dateRange',
      eventTime: 'time',
    }),

    // Local
    formIsValid: {
      get() {
        return this.eventIsValid;
      },
      set(state) {
        this.invalidateEvent(state);
      },
    },
    dateFormatted() {
      if (this..dateRange.length) {
        return this..dateRange.map(date => {
          return this.formatDate(date);
        }).join(' ~ ');
      }
      return [];
    },
  },

  methods: {
    // Vuex
    addEvents(events) {
      this.$store.commit('addEvents', events);
    },
    sendData(payload) {
      return this.$store.dispatch('api/sendData', payload);
    },
    ...mapEventMutations([
      'invalidateEvent',
    ]),
    ...mapEventActions([
      'dismissEvent',
      'updateEvent',
      'deleteEvent',
    ]),

    // BACKEND

    // Requests
    submitRequest() {
      console.log('submitting form...');
      this.alerts = [];

      if (!this.isNew && this.hasNoChanges()) {
        const message = 'Для сохранения необходимо внести изменения.';
        this.alerts.push({ text: { message } });
        this.formIsValid = false;
        return;
      } else if (this.isInvalidEventSchedule(...this.normalizeRanges())) {
        return;
      }
      const callbackType = this.isNew ? 'Post' : 'Put';
      const successCallback = `on${callbackType}Success`;
      const method = callbackType.toUpperCase();
      const body = this.formPayload();
      const payload = { method, body };

      this.pending.submit = true;
      this.sendData(payload)
        .then(response => this[successCallback](response))
        .finally(() => {
          if (this.isNew) {
            this.$emit('update:');
          }
          this.pending.submit = false;
        })
        .catch(error => this.rejectionCallback(error));
    },
    deleteRequest() {
      console.log('deleting event...');
      const method = 'DELETE';
      const payload = { method };

      this.pending.delete = true;
      this.sendData(payload)
        .then(response => this.onDeleteSuccess(response))
        .finally(() => {
          this.pending.delete = false;
          this.deleteDialog = false;
        })
        .catch(error => this.rejectionCallback(error));
    },

    // Callbacks
    async onPostSuccess(response) {
      this.addEvents([ response ]);
      this.dismissEvent('new');
    },
    async onPutSuccess(response) {
      this.updateEvent(response);
      this.dismissEvent({ type: 'existing' });
    },
    async onDeleteSuccess(response) {
      this.deleteEvent(response);
      this.dismissEvent('existing');
    },

    // FRONTEND

    // Utilities
    formatDate(date) {
      const [ year, month, day ] = date.split('-');
      return `${day}.${month}.${year.substring(2)}`;
    },

    normalizeRanges() {
      if (this..dateRange.length === 1) {
        this..dateRange.push(this..dateRange[0]);
      }
      const dateRangeSorted = this..dateRange.sort();
      const startTime = this..timeStart ?? '00:00';
      const endTime = this..timeEnd ?? '23:59';

      return [ dateRangeSorted, [ startTime, endTime ] ];
    },

    formPayload() {
      let payload = {
        color: this..color,
        name: this..name,
        start: [
          this..dateRange[0],
          this..timeStart,
        ].join(' '),
        end: [
          this..dateRange[1],
          this..timeEnd,
        ].join(' '),
      };
      if (!this.isNew) {
        payload.id = this..id;
      }
      return payload;
    },

    // Validators
    hasNoChanges() {
      if (this..dateRange.length !== this.eventDateRange.length ||
          this..color !== this.eventColor ||
          this..name !== this.eventName ||
          this..dateRange[0] !== this.eventDateRange[0] ||
          this..dateRange[1] !== this.eventDateRange[1] ||
          this..timeStart !== this.eventTime.start ||
          this..timeEnd !== this.eventTime.end) {
        return false;
      }
      return true;
    },

    isInvalidEventSchedule(dateRange, timeRange) {
      let message;

      if (dateRange[0] < this.today) {
        message = 'Дата начала не может быть меньше текущей.';
        this.alerts.push({ text: { message } });
      }
      if (dateRange[0] === dateRange[1] && timeRange[0] >= timeRange[1]) {
        message = 'Время установлено некорректно.';
        this.alerts.push({ text: { message } });
      }
      this.formIsValid = !this.alerts.length;
      return !this.formIsValid;
    },

    // Handlers
    applyPickerState(type) {
      const ref = this.$refs[type];

      if (Array.isArray(ref)) {
        ref[0].save(this.[type]);
      } else {
        ref.save(this.[type]);
      }
    },

    cancelFormEditing() {
      const type = this.isNew ? 'new' : 'existing';
      console.log('cancelling event type: ' + type);
      this.dismissEvent(type);

      if (type === 'new') {
        this.$emit('update:current-event');
      }
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