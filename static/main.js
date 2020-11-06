new Vue({
  el: '#app',
  vuetify: new Vuetify(),
})

const fetchInitOptions = {
  headers:{
    'Accept': 'application/json',
  },
};
const backendApi = "http://127.0.0.1:8000/api/v1/";
const backendEndpoints = {
  auth: 'login/',
  get: 'events/',
  post: 'create/',
};

// Vue.component('scheduler', {
//   data: () => ({
//     focus: '',
//     types: {
//       month: 'Месяц',
//       week: 'Неделя',
//       day: 'День',
//     },
//     currentType: 'month',
//     modes: [
//       {
//         text: 'Да',
//         value: 'stack',
//       },
//       {
//         text: 'Нет',
//         value: 'column',
//       },
//     ],
//     currentMode: 'stack',
//     weekdaysOrder: [1, 2, 3, 4, 5, 6, 0],
//     event: {
//       name: 'event',
//       details,
//       start: null,
//       end: null,
//       color: '#1976D2',
//     },
//     plannedEvents: [],
//     currentlyEditedEvent: null,
//     selectedEvent: {},
//     selectedElement: null,
//     selectedOpen: false,
//     dialog: false,
//     colors: ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1'],
//     names: ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party'],
//   }),
//   created() {
//     let userCredentials = this.getUserCredentials();
//     console.log(userCredentials);
//     // this.authenticateUser(userCredentials);
//     this.getData();
//   },
//   mounted() {
//     this.$refs.calendar.checkChange();
//   },
//   methods: {
//     checkForError(response) {
//       if (!response.ok) throw Error(response.statusText);
//       return response.json();
//     },
//     async sendRequest(endpoint, options) {
//       let url = backendApi + endpoint;
//       console.log(url);
//       await fetch(url, options)
//         .then(response => this.checkForError(response))
//         .then(data => console.log(data))
//         .catch(error => console.log(error));
//     },

//     getUserCredentials() {
//       return 'hello, world';
//     },
//     authenticateUser(userCredentials) {
//       let endpoint = backendEndpoints.auth + userCredentials;
//       let options = fetchInitOptions;
//       this.sendRequest(endpoint, options);
//     },
//     async getData() {
//       let endpoint = backendEndpoints.get;
//       console.log(endpoint);
//       let options = fetchInitOptions;
//       console.log(options);
//       await this.sendRequest(endpoint, options);
//     },
//     async postData(data) {
//       let endpoint = backendEndpoints.post;
//       let options = {...fetchInitOptions, ...fetchPostOptions};
//       options.body = JSON.stringify(data);
//       await this.sendRequest(endpoint, options);
//     },

//     viewDate({ date }) {
//       this.focus = date;
//       this.currentType = 'day';
//     },
//     getEventColor(event) {
//       return event.color;
//     },
//     setType(type) {
//       this.currentType = type;
//     },
//     prev() {
//       this.$refs.calendar.prev();
//     },
//     next() {
//       this.$refs.calendar.next();
//     },
//     showEvent({ nativeEvent, event }) {
//       const open = () => {
//         this.selectedEvent = event;
//         this.selectedElement = nativeEvent.target;
//         setTimeout(() => {
//           this.selectedOpen = true;
//         }, 10);
//       };

//       if (this.selectedOpen) {
//         this.selectedOpen = false;
//         setTimeout(open, 10);
//       } else {
//         open();
//       }

//       nativeEvent.stopPropagation();
//     },
//     updateRange({ start, end }) {
//       const events = [];

//       const min = new Date(`${start.date}T00:00:00`);
//       const max = new Date(`${end.date}T23:59:59`);
//       const days = (max.getTime() - min.getTime()) / 86400000;
//       const eventCount = this.rnd(days, days + 20);

//       for (let i = 0; i < eventCount; i++) {
//         const allDay = this.rnd(0, 3) === 0;
//         const firstTimestamp = this.rnd(min.getTime(), max.getTime());
//         const first = new Date(firstTimestamp - (firstTimestamp % 900000));
//         const secondTimestamp = this.rnd(2, allDay ? 288 : 8) * 900000;
//         const second = new Date(first.getTime() + secondTimestamp);

//         events.push({
//           name: this.names[this.rnd(0, this.names.length - 1)],
//           start: first,
//           end: second,
//           color: this.colors[this.rnd(0, this.colors.length - 1)],
//           timed: !allDay,
//         })
//       }

//       this.events = events;
//     },
//     rnd (a, b) {
//       return Math.floor((b - a + 1) * Math.random()) + a;
//     },
//   },