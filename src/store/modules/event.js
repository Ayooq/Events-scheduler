const state = {
  id: null,
  isValid: false,
  show: {
    new: false,
    existing: false,
  },
  color: 'secondary',
  name: null,
  dateRange: [],
  time: {
    start: null,
    end: null,
  },
};

const mutations = {
  invalidateEvent(state, value) {
    state.isValid = value;
  },

  changeEventVisibility(state, { type, value }) {
    console.log(`${type} state before: ${state.show[type]}`);
    state.show[type] = value;
    console.log(`${type} state after: ${state.show[type]}`);
  },

  setEventID(state, value) {
    state.id = value;
  },
  setEventColor(state, value) {
    state.color = value;
  },
  setEventName(state, value) {
    state.name = value;
  },
  setEventDateRange(state, range) {
    state.dateRange = range;
  },
  setEventTimeStart(state, value) {
    state.time.start = value;
  },
  setEventTimeEnd(state, value) {
    state.time.end = value;
  },
};

const actions = {
  showEvent({ state, commit }, type) {
    if (state.isValid) {
      commit('invalidateEvent', false);
    }
    setTimeout(() => {
      commit('changeEventVisibility', { type, value: true });
    }, 10);
  },
  dismissEvent({ commit }, type) {
    commit('changeEventVisibility', { type, value: false });
  },

  async setEventData({ commit, dispatch }, event) {
    commit('setEventID', event.id);
    return dispatch('setEventCardData', event);
  },
  async setEventCardData({ commit }, event) {
    commit('setEventColor', event.color);
    commit('setEventName', event.name);
    commit('setEventDateRange', event.dateRange);
    commit('setEventTimeStart', event.time.start);
    commit('setEventTimeEnd', event.time.end);
    return event;
  },

  updateEvent({ dispatch, commit }, event) {
    const index = dispatch('findEventIndex', event.id, { root: true });
    const payload = {
      index,
      data: event,
    };
    commit('updateEvents', [payload], { root: true });
  },
  deleteEvent({ dispatch, commit }, eventId) {
    const eventIndex = dispatch('findEventIndex', eventId, { root: true });
    commit('deleteEvents', [eventIndex], { root: true });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
