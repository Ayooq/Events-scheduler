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
  parseResponse(_, response) {
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

  getToken(_, name) {
    if (document.cookie !== "") {
      const cookies = document.cookie.split(";");
      const token = cookies.find((cookie) => {
        return cookie.trim().substring(0, name.length + 1) === `${name}=`;
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
  async sendRequest({ dispatch }, { url, options }) {
    try {
      const token = dispatch("getToken", "csrftoken");
      options.headers.append("X-CSRFToken", token);
    } catch (error) {
      console.error(error);
    }

    return fetch(url, options).then((response) => {
      return dispatch("parseResponse", response);
    });
  },
  async fetchData({ state, getters, dispatch }) {
    const url = getters.eventsURL;
    const options = { ...state.options };
    const request = { url, options };
    console.log(request);

    return dispatch("sendRequest", request);
  },
  async sendData({ state, getters, dispatch }, { method, body }) {
    const endpoint = method === "POST" ? "" : `${body.id}/`;
    const url = getters.eventsURL + endpoint;
    const options = { ...state.options };
    options.method = method;
    options.headers.append("Content-Type", "application/json;charset=UTF-8");

    if (method !== "DELETE") {
      options.body = JSON.stringify(body);
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
