<template>
  <v-container>
    <v-row class="fill-height">
      <v-col>
        <v-sheet height="64">
          <v-skeleton-loader
            v-if="pending"
            type="table-heading"
          />

          <v-toolbar
            v-else
            flat
          >
            <v-dialog
              max-width="550px"
              persistent
              :value="eventShow.new"
            >
              <template #activator="{ on, attrs }">
                <v-btn
                  class="mr-4"
                  color="info"
                  depressed
                  v-bind="attrs"
                  v-on="on"
                  @click="showNewEvent"
                >
                  <v-icon left>
                    mdi-calendar-check-outline
                  </v-icon>
                  Новое мероприятие
                </v-btn>
              </template>

              <EventCard
                :new-event="true"
                :rejection-callback="onResponseFailure"
              />
            </v-dialog>

            <v-btn
              color="grey darken-2"
              fab
              small
              text
              @click="prev"
            >
              <v-icon small>
                mdi-chevron-left
              </v-icon>
            </v-btn>
            <v-btn
              color="grey darken-2"
              fab
              small
              text
              @click="next"
            >
              <v-icon small>
                mdi-chevron-right
              </v-icon>
            </v-btn>

            <v-toolbar-title
              v-if="$refs.calendar"
              class="ml-4"
            >
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
              <v-icon
                v-once
                left
              >
                mdi-target-variant
              </v-icon>
              Сегодня
            </v-btn>

            <v-menu
              bottom
              right
            >
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
                  <v-icon right>
                    mdi-menu-down
                  </v-icon>
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
            @click:event="showExistingEvent"
            @click:more="setFocusOnDate"
          />

          <v-menu
            max-width="550"
            offset-x
            :activator="selectedElement"
            :close-on-content-click="false"
            :value="eventShow.existing"
          >
            <EventCard
              :current-event="currentEvent"
              :rejection-callback="onResponseFailure"
            />
          </v-menu>
        </v-sheet>

        <ErrorAlertsList :alerts="alerts" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
import EventCard from './EventCard.vue';
import ErrorAlertsList from './ErrorAlertsList.vue';

const {
  mapState: mapEventState,
  mapMutations: mapEventMutations,
  mapActions: mapEventActions,
} = createNamespacedHelpers('event');

export default {
  name: 'Scheduler',

  components: {
    EventCard,
    ErrorAlertsList,
  },

  data: () => ({
    // pre-load
    pending: true,
    skeletonTypes: {
      'table-tbody': 'table-row-divider@8',
      'table-row': 'table-cell@7',
    },
    alerts: [],
    // header
    focus: '',
    rendering: {
      modes: [
        {
          text: 'Включить',
          value: 'stack',
        },
        {
          text: 'Выключить',
          value: 'column',
        },
      ],
      currentMode: 'stack',
      types: {
        month: 'Месяц',
        week: 'Неделя',
        day: 'День',
      },
      currentType: {
        id: 0,
        value: 'month',
      },
    },
    // body
    weekdaysOrder: [1, 2, 3, 4, 5, 6, 0],
    currentEvent: {},
    selectedElement: null,
  }),

  computed: {
    // Vuex
    events() {
      return this.$store.state.events;
    },
    ...mapEventState({
      eventShow: (state) => state.show,
    }),
  },

  created() {
    window.addEventListener('unhandledrejection', () => {
      const url = 'https://help.example.com';
      const message = 'Ошибка в приложении. Попробуйте перезагрузить страницу. '
                    + 'В случае повторной ошибки, пожалуйста, обратитесь в ';
      const clickableText = 'службу поддержки';
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
    addEvents(events) {
      this.$store.commit('addEvents', events);
    },
    fetchData() {
      return this.$store.dispatch('api/fetchData');
    },
    ...mapEventMutations([
      'changeEventVisibility',
    ]),
    ...mapEventActions([
      'showEvent',
      'dismissEvent',
      'setEventData',
      'setEventCardData',
    ]),

    // BACKEND

    // Requests
    async authenticateUser(userCredentials) {
      console.log(userCredentials);
      await this.sendRequest(this.authEndpoint);
    },

    getEvents() {
      this.fetchData()
        .then((response) => this.onGetSuccess(response))
        .catch((error) => this.onResponseFailure(error));
    },

    // Callbacks
    onGetSuccess(response) {
      if (this.alerts.length) {
        this.alerts = [];
      }
      this.addEvents(response);
      this.pending = false;
    },
    onResponseFailure(error) {
      const message = 'Ошибка на стороне сервера. Попробуйте позже.';
      this.alerts.push({ text: { message } });
      console.error(error);
    },

    // FRONTEND

    // Getters
    getEventColor(event) {
      return event.color;
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
        value: 'day',
      };
    },

    setEventDateTime(event) {
      const [
        dateStart,
        timeStart,
      ] = event.start.trim().split(' ');
      const [
        dateEnd,
        timeEnd,
      ] = event.end.trim().split(' ');
      const eventDateTime = {
        dateRange: [
          dateStart,
          dateEnd,
        ],
        time: {
          start: timeStart,
          end: timeEnd,
        },
      };
      Object.assign(event, eventDateTime);
      console.log(event);
    },

    // Handlers
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },

    showNewEvent() {
      if (this.eventShow.existing) {
        this.dismissEvent('existing');
      }
      this.showEvent('new');
    },
    showExistingEvent({ event, nativeEvent }) {
      const type = 'existing';

      if (this.eventShow.existing) {
        this.dismissEvent(type);
      }
      this.setEventDateTime(event);
      this.currentEvent = {
        color: event.color,
        name: event.name,
        dateRange: event.dateRange,
        timeStart: event.time.start,
        timeEnd: event.time.end,
      };
      this.setEventData(event).finally(() => {
        this.showEvent(type);
      });

      this.selectedElement = nativeEvent.target;
      nativeEvent.stopPropagation();
    },
  },
};
</script>
