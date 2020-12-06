const state = () => ({
  id: null,
  show: {
    new: false,
    existing: false,
  },
  isValid: false,
  color: "secondary",
  name: null,
  dateRange: [],
  timeStart: null,
  timeEnd: null,
});

const mutations = {
  toggleEventVisibility(state, type) {
    console.log(`${type} state before: ${state.show[type]}`);
    state.show[type] = !state.show[type];
    console.log(`${type} state after: ${state.show[type]}`);
  },

  changeEventProperty(state, [key, value]) {
    console.log(`${key} value before: ${value}`);
    state[key] = value;
    console.log(`${key} value after: ${value}`);
  },
};

const actions = {
  showEvent({ state, commit }, type) {
    if (state.isValid) {
      commit("changeEventProperty", { key: "isValid", value: false });
    }

    setTimeout(() => {
      commit("toggleEventVisibility", type);
    }, 10);
  },
  dismissEvent({ state, commit }, type) {
    if (state.show[type]) {
      commit("toggleEventVisibility", type);
    }
  },

  setEventData({ commit }, event) {
    Object.entries(event).forEach((entry) => {
      commit("changeEventProperty", entry);
    });
  },

  updateEvent({ dispatch, commit }, eventData) {
    const index = dispatch("findEventIndex", eventData.id, { root: true });
    const event = {
      index,
      data: eventData,
    };
    commit("updateEvents", [event], { root: true });
  },
  deleteEvent({ dispatch, commit }, eventId) {
    const eventIndex = dispatch("findEventIndex", eventId, { root: true });
    commit("deleteEvents", [eventIndex], { root: true });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
