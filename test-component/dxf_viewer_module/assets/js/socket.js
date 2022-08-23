import { io } from "socket.io-client";
import { SOCKET_DOMAIN_MANIFERA } from "./constant";

const socket = io(`ws://${window.location.host}`);
window.sio = socket;

// Socket of portal-api.summa.systems
const socket2 = io(SOCKET_DOMAIN_MANIFERA, {
  path: "/api/ws/socket.io",
  transports: ["websocket"],
});
window.sio2 = socket2;

socket.on("connect", () => {
  // console.log("connect", socket.id);
  // window.sio.emit('chart-date', 'hello22')
});

socket.on("disconnect", () => {
  // console.log("disconnect", socket.id);
});

socket.on("chart-date-people", (...args) => {
  window.Events.$emit("messages_date_people", args);
});

socket.on("chart-date-energy", (...args) => {
  window.Events.$emit("messages_date_energy", args);
});

// socket.on("chart-date", (...args) => {
//   console.log('chart-date', args);
//   window.Events.$emit('socket_messages', args);
// });

socket.on("chart-week-energy", (...args) => {
  // console.log('chart-week', args);
  window.Events.$emit("messages_week_energy", args);
});

socket.on("chart-week-people", (...args) => {
  // console.log('chart-week-p', args);
  window.Events.$emit("messages_week_people", args);
});

socket.on("chart-month-energy", (...args) => {
  // console.log('chart-month', args);
  window.Events.$emit("messages_month_energy", args);
});

socket.on("chart-month-people", (...args) => {
  // console.log('chart-month-p', args);
  window.Events.$emit("messages_month_people", args);
});

socket.on("chart-year-energy", (...args) => {
  // console.log('chart-year', args);
  window.Events.$emit("messages_year_energy", args);
});

socket.on("chart-year-people", (...args) => {
  // console.log('chart-year-p', args);
  window.Events.$emit("messages_year_people", args);
});

socket.on("current-people", (...args) => {
  window.Events.$emit("messages_current_people", args);
});

socket.on("current-energy", (...args) => {
  window.Events.$emit("messages_current_energy", args);
});

socket.on("data-viewer", (...args) => {
  window.Events.$emit("messages_data_viewer", args);
});

socket2.on("my_response", (...arg) => {
  window.Events.$emit("messages_data_group_floorplan", arg);
});
