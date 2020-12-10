<template>
  <v-container>
    <v-row class="fill-height">
      <v-col>
        <ErrorAlertsList v-show="alerts.length > 0" :alerts="alerts" />

        <v-sheet v-show="alerts.length === 0" height="64">
          <v-skeleton-loader v-if="pending" type="table-heading" />

          <v-toolbar v-else class="d-flex" flat>
            <v-slide-x-transition>
              <v-btn
                v-show="!isMobile"
                id="activator-inline"
                color="info"
                depressed
                @click.stop="showNewEventCard"
              >
                <v-icon left>{{ icons.newEventInline }}</v-icon>
                Новое мероприятие
              </v-btn>
            </v-slide-x-transition>

            <v-row class="flex-nowrap" no-gutters>
              <v-col>
                <v-btn color="grey darken-2" fab small text @click="prev">
                  <v-icon>{{ icons.prev }}</v-icon>
                </v-btn>
              </v-col>

              <v-col cols="auto">
                <v-toolbar-title v-if="$refs.calendar" class="mx-4">
                  {{ $refs.calendar.title }}
                </v-toolbar-title>
              </v-col>

              <v-col>
                <v-btn color="grey darken-2" fab small text @click="next">
                  <v-icon>{{ icons.next }}</v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row class="flex-nowrap ml-4" justify="end" no-gutters>
              <v-col cols="auto">
                <v-select
                  v-model="rendering.currentMode"
                  class="flex-grow-0 flex-shrink-1"
                  label="Наложение событий"
                  dense
                  hide-details
                  outlined
                  :items="rendering.modes"
                />
              </v-col>

              <v-col cols="auto">
                <v-btn
                  class="mx-4"
                  color="grey darken-2"
                  outlined
                  @click="focus = ''"
                >
                  <v-icon v-once>{{ icons.today }}</v-icon>
                  <span class="ml-2">Сегодня</span>
                </v-btn>
              </v-col>

              <v-col cols="auto">
                <v-menu bottom right>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      color="grey darken-2"
                      outlined
                      v-bind="attrs"
                      v-on="on"
                    >
                      <span>
                        {{ rendering.types[rendering.currentType.value] }}
                      </span>
                      <v-icon v-once right>{{ icons.dropdownMenu }}</v-icon>
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
              </v-col>
            </v-row>
          </v-toolbar>
        </v-sheet>
        <v-sheet class="mb-3" height="480">
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

          <v-fab-transition>
            <v-btn
              v-show="isMobile"
              id="activator-fab"
              class="mt-n12"
              color="info"
              absolute
              fab
              dark
              right
            >
              <v-icon>{{ icons.newEventFab }}</v-icon>
            </v-btn>
          </v-fab-transition>

          <v-dialog
            v-model="eventCardOpened.new"
            max-width="550"
            persistent
            :activator="dialogActivator"
          >
            <EventCard
              v-bind="currentEvent"
              :on-error="onError"
              @close="eventCardOpened.new = false"
              @events:add="addNewEvent"
            />
          </v-dialog>

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
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {
  mdiCalendarCheckOutline,
  mdiChevronLeftCircleOutline,
  mdiChevronRightCircleOutline,
  mdiMenuDown,
  mdiPlus,
  mdiTargetVariant,
} from "@mdi/js";
import { mapMutations } from "vuex";

import EventCard from "./EventCard.vue";
import ErrorAlertsList from "./ErrorAlertsList.vue";

export default {
  name: "Scheduler",

  components: {
    EventCard,
    ErrorAlertsList,
  },

  data() {
    return {
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
        name: "",
        dateRange: [],
        timeStart: "",
        timeEnd: "",
      }),
      currentEvent: {},
      selectedElement: null,

      // detached
      eventCardOpened: {
        new: false,
        existing: false,
      },
    };
  },

  computed: {
    // Vuex
    events() {
      return this.$store.state.events;
    },

    // Local
    isMobile() {
      return this.$vuetify.breakpoint.mobile;
    },

    dialogActivator() {
      const type = this.isMobile ? "fab" : "inline";
      return `activator-${type}`;
    },
  },

  created() {
    window.addEventListener("unhandledrejection", () => {
      const line1 = {
        message: "Ошибка в приложении. Попробуйте перезагрузить страницу.",
      };
      const line2 = {
        message: "В случае повторной ошибки, пожалуйста, обратитесь в",
        url: "https://help.example.com",
        linkText: "службу поддержки",
      };
      const alert = [line1, line2];
      this.alerts.push(alert);
    });

    this.icons = {
      newEventInline: mdiCalendarCheckOutline,
      newEventFab: mdiPlus,
      prev: mdiChevronLeftCircleOutline,
      next: mdiChevronRightCircleOutline,
      today: mdiTargetVariant,
      dropdownMenu: mdiMenuDown,
    };

    console.log(this.defaultEvent);
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
      const line1 = {
        message: "Ошибка на стороне сервера.",
      };
      const line2 = {
        message: "Попробуйте позже.",
      };
      const alert = [line1, line2];
      this.alerts.push(alert);
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
      console.log("showing new event...");
      const existing = "existing";

      if (this.eventCardOpened[existing]) {
        this.toggleEventVisibility(existing);
      }

      this.currentEvent = { ...this.defaultEvent };
      console.log("new event:");
      console.log(this.currentEvent);
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
