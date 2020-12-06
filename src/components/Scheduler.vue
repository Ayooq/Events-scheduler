<template>
  <v-container>
    <v-row class="fill-height">
      <v-col>
        <v-sheet height="64">
          <v-skeleton-loader v-if="pending" type="table-heading" />

          <v-toolbar v-else flat>
            <v-dialog v-model="eventCardOpened.new" max-width="550" persistent>
              <template #activator="{ on, attrs }">
                <v-btn
                  class="mr-4"
                  color="info"
                  depressed
                  v-bind="attrs"
                  v-on="on"
                  @click="showNewEventCard"
                >
                  <v-icon left> mdi-calendar-check-outline </v-icon>
                  Новое мероприятие
                </v-btn>
              </template>

              <EventCard
                v-bind="currentEvent"
                :on-error="onError"
                @close="eventCardOpened.new = false"
                @events:add="addNewEvent"
              />
            </v-dialog>

            <v-btn color="grey darken-2" fab small text @click="prev">
              <v-icon small> mdi-chevron-left </v-icon>
            </v-btn>
            <v-btn color="grey darken-2" fab small text @click="next">
              <v-icon small> mdi-chevron-right </v-icon>
            </v-btn>

            <v-toolbar-title v-if="$refs.calendar" class="ml-4">
              {{ $refs.calendar.title }}
            </v-toolbar-title>

            <v-spacer />

            <div class="d-inline-flex">
              <v-select
                v-model="rendering.currentMode"
                label="Наложение событий"
                dense
                hide-details
                outlined
                :items="rendering.modes"
              />
            </div>

            <v-btn
              class="mx-4"
              color="grey darken-2"
              outlined
              @click="focus = ''"
            >
              <v-icon v-once left> mdi-target-variant </v-icon>
              Сегодня
            </v-btn>

            <v-menu bottom right>
              <template #activator="{ on, attrs }">
                <v-btn color="grey darken-2" outlined v-bind="attrs" v-on="on">
                  <span>
                    {{ rendering.types[rendering.currentType.value] }}
                  </span>
                  <v-icon right> mdi-menu-down </v-icon>
                </v-btn>
              </template>

              <v-list flat>
                <v-list-item-group
                  v-model="rendering.currentType.id"
                  color="info"
                  mandatory
                >
                  <v-list-item
                    v-for="(type, key, index) in rendering.types"
                    :key="key"
                    @click="setCalendarType(index, key)"
                  >
                    <v-list-item-content v-once>
                      <v-list-item-title>{{ type }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-menu>
          </v-toolbar>
        </v-sheet>
        <v-sheet height="480">
          <v-skeleton-loader
            v-if="pending"
            type="table-tbody"
            :types="skeletonTypes"
          />
          <v-calendar
            v-show="!pending"
            ref="calendar"
            v-model="focus"
            color="info"
            event-more-text="Посмотреть все"
            locale="ru"
            locale-first-day-of-year="4"
            :events="events"
            :event-color="getEventColor"
            :event-overlap-mode="rendering.currentMode"
            :type="rendering.currentType.value"
            :weekdays="weekdaysOrder"
            @click:date="setFocusOnDate"
            @click:event.stop="showExistingEventCard"
            @click:more="setFocusOnDate"
          />

          <v-menu
            v-model="eventCardOpened.existing"
            max-width="550"
            open-delay="10"
            offset-x
            :activator="selectedElement"
            :close-on-content-click="false"
          >
            <EventCard
              v-bind="currentEvent"
              :on-error="onError"
              @close="eventCardOpened.existing = false"
              @events:update="updateExistingEvent"
              @events:delete="deleteExistingEvent"
            />
          </v-menu>
        </v-sheet>

        <ErrorAlertsList :alerts="alerts" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapMutations } from "vuex";

  import EventCard from "./EventCard.vue";
  import ErrorAlertsList from "./ErrorAlertsList.vue";

  export default {
    name: "Scheduler",

    components: {
      EventCard,
      ErrorAlertsList,
    },

    data: () => ({
      // pre-load
      pending: false,
      skeletonTypes: {
        "table-tbody": "table-row-divider@8",
        "table-row": "table-cell@7",
      },
      alerts: [],

      // header
      focus: "",
      rendering: {
        modes: [
          {
            text: "Включить",
            value: "stack",
          },
          {
            text: "Выключить",
            value: "column",
          },
        ],
        currentMode: "stack",
        types: {
          month: "Месяц",
          week: "Неделя",
          day: "День",
        },
        currentType: {
          id: 0,
          value: "month",
        },
      },

      // body
      weekdaysOrder: [1, 2, 3, 4, 5, 6, 0],
      defaultEvent: Object.freeze({
        name: null,
        dateRange: [],
        timeStart: null,
        timeEnd: null,
      }),
      currentEvent: {},
      selectedElement: null,

      // detached
      eventCardOpened: {
        new: false,
        existing: false,
      },
    }),

    computed: {
      // Vuex
      events() {
        return this.$store.state.events;
      },
    },

    created() {
      window.addEventListener("unhandledrejection", () => {
        const url = "https://help.example.com";
        const line1 = "Ошибка в приложении. Попробуйте перезагрузить страницу.";
        const line2 = "В случае повторной ошибки, пожалуйста, обратитесь в";
        const message = `${[line1, line2].join("\n")} `;
        const clickableText = "службу поддержки";
        const alert = {
          url,
          text: {
            message,
            clickableText,
          },
        };
        this.alerts = [alert];
      });
      // this.authenticateUser(userCredentials);
      this.getEvents();
    },

    methods: {
      // Vuex
      ...mapMutations(["addEvents", "updateEvents", "deleteEvents"]),

      findEventIndex(id) {
        return this.$store.dispatch("findEventIndex", id);
      },

      fetchData() {
        return this.$store.dispatch("api/fetchData");
      },

      // BACKEND

      // Requests
      async authenticateUser(userCredentials) {
        console.log(userCredentials);
        // await this.sendRequest(this.authEndpoint);
      },

      getEvents() {
        this.pending = true;
        this.fetchData()
          .then((response) => this.onResponseSuccess(response))
          .finally(() => {
            this.pending = false;
          })
          .catch((error) => this.onError(error));
      },

      // Callbacks
      onResponseSuccess(response) {
        if (this.alerts.length > 0) {
          this.alerts = [];
        }

        this.addEvents(response);
      },
      onError(error) {
        const message = "Ошибка на стороне сервера. Попробуйте позже.";
        this.alerts.push({ text: { message } });
        console.error(error);
      },

      // FRONTEND

      // Getters
      getEventColor({ color }) {
        return color || "secondary";
      },

      getFormattedEventData({ id, color, name, start, end }) {
        const [dateStart, timeStart] = start.trim().split(" ");
        const [dateEnd, timeEnd] = end.trim().split(" ");
        return {
          id,
          color,
          name,
          dateRange: [dateStart, dateEnd],
          timeStart,
          timeEnd,
        };
      },

      // Setters
      setCalendarType(index, key) {
        this.rendering.currentType = {
          id: index,
          value: key,
        };
      },

      setFocusOnDate({ date }) {
        this.focus = date;
        this.rendering.currentType = {
          id: 2,
          value: "day",
        };
      },

      // Handlers
      prev() {
        this.$refs.calendar.prev();
      },
      next() {
        this.$refs.calendar.next();
      },

      toggleEventVisibility(type) {
        this.eventCardOpened[type] = !this.eventCardOpened[type];
      },
      showNewEventCard() {
        const existing = "existing";

        if (this.eventCardOpened[existing]) {
          this.toggleEventVisibility(existing);
        }

        this.currentEvent = { ...this.defaultEvent };
        this.toggleEventVisibility("new");
      },
      showExistingEventCard({ event, nativeEvent }) {
        const existing = "existing";
        setTimeout(() => {
          this.toggleEventVisibility(existing);
        }, 10);

        if (this.eventCardOpened[existing]) {
          this.toggleEventVisibility(existing);
        }

        this.currentEvent = this.getFormattedEventData(event);
        this.selectedElement = nativeEvent.target;
      },

      addNewEvent(event) {
        this.addEvents([event]);
      },
      updateExistingEvent(data) {
        const index = this.findEventIndex(this.currentEvent.id);
        const event = { index, data };
        this.updateEvents([event]);
      },
      deleteExistingEvent() {
        const eventIndex = this.findEventIndex(this.currentEvent.id);
        this.deleteEvents([eventIndex]);
      },
    },
  };
</script>
