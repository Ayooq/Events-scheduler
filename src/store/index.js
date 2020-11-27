import Vue from "vue";
import Vuex from "vuex";

import api from "./modules/api";
import event from "./modules/event";

Vue.use(Vuex);

const state = () => ({
  events: [],
});

const mutations = {
  addEvents(state, events) {
    events.forEach((e) => state.events.push(e));
  },
  updateEvents(state, events) {
    const updateEvent = state.events.splice;
    events.forEach(({ index, data }) => {
      updateEvent(index, 1, data);
    });
  },
  deleteEvents(state, eventsIndeces) {
    const deleteEvent = state.events.splice;
    eventsIndeces.forEach((index) => {
      deleteEvent(index, 1);
    });
  },
};

const actions = {
  findEventIndex({ state }, eventId) {
    return state.events.findIndex(({ id }) => id === eventId);
  },
};

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== "production",
  state,
  mutations,
  actions,
  modules: {
    api,
    event,
  },
});
