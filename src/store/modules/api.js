const state = () => ({
  hosts: { localhost: "http://127.0.0.1:8000" },
  paths: {
    base: "api/v1",
    auth: "auth",
    events: "events",
  },
  options: {
    credentials: "include",
    headers: new Headers({ Accept: "application/json" }),
  },
});

const getters = {
  authURL: (state) => {
    const url = [
      state.hosts.localhost,
      state.paths.base,
      state.paths.auth,
    ].join("/");

    return `${url}/`;
  },
  eventsURL: (state) => {
    const url = [
      state.hosts.localhost,
      state.paths.base,
      state.paths.events,
    ].join("/");

    return `${url}/`;
  },
};

const actions = {
  // Utilities
  async checkResponse(context, response) {
    console.log(response);
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    try {
      return response.json();
    } catch (error) {
      return response.status;
    }
  },

  async getToken(name) {
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      const token = cookies.find((cookie) => {
        cookie.trim().substring(0, name.length + 1) === `${name}`;
      });

      if (token) {
        return decodeURIComponent(token.substring(name.length + 1));
      } else {
        throw new Error("no token found");
      }
    }
    throw new Error("no cookies found");
  },

  // Requests
  async sendRequest({ dispatch }, request) {
    dispatch("getToken", "csrftoken")
      .then((token) => {
        request.options.headers.append("X-CSRFToken", token);
      })
      .catch((error) => console.error(error));

    return fetch(request.url, request.options).then((response) => {
      return dispatch("checkResponse", response);
    });
  },
  async fetchData({ state, getters, dispatch }) {
    const url = getters.eventsURL;
    const options = { ...state.options };
    const request = { url, options };
    console.log(request);

    return dispatch("sendRequest", request);
  },
  async sendData({ state, rootState, getters, dispatch }, payload) {
    const endpoint = payload.method === "POST" ? "" : `${rootState.event.id}/`;
    const url = getters.eventsURL + endpoint;
    const options = { ...state.options };
    options.headers.append("Content-Type", "application/json;charset=UTF-8");
    options.method = payload.method;

    if (payload.body) {
      options.body = JSON.stringify(payload.body);
    }

    const request = { url, options };
    console.log(request);

    return dispatch("sendRequest", request);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
};
