import Vue from "vue";
import Vuex from "vuex";

import api from "./modules/api";

Vue.use(Vuex);

const state = () => ({
  events: [],
});

const mutations = {
  addEvents(state, events) {
    events.forEach((event) => state.events.push(event));
  },
  updateEvents(state, events) {
    const updateEvent = state.events.splice;
    events.forEach(({ index, data }) => updateEvent(index, 1, data));
  },
  deleteEvents(state, eventsIndeces) {
    const deleteEvent = state.events.splice;
    eventsIndeces.forEach((index) => deleteEvent(index, 1));
  },
};

const actions = {
  findEventIndex({ state }, eventID) {
    return state.events.findIndex(({ id }) => id === eventID);
  },
};

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== "production",
  state,
  mutations,
  actions,
  modules: {
    api,
  },
});
