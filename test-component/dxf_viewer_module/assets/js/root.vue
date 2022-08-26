<template>
  <div id="content">
    <LayoutStructure
      :floors="JSON.parse(floors)"
      :groups="JSON.parse(groups)"
      :devices="JSON.parse(devices)"
    />
  </div>
</template>

<style>
@import "../scss/style.css";
</style>

<script>
import LayoutStructure from "./components/structure/layout-structure.vue";
// import { floors } from "./dummy/dummy_floors.js";
// import { devices } from "./dummy/dummy_devices.js";
// import { groups } from "./dummy/dummy_groups.js";
import { EventBus } from "./store.js";
export default {
  props: [],
  data() {
    return {
      floors: "[]",
      devices: "[]",
      groups: "[]"
    };
  },
  components: {
    LayoutStructure,
  },
  mounted() {},
  methods: {
    addGroup(data) {
      this.$emit("addGroup", data);
    },
    updateGroup(data) {
      this.$emit("updateGroup", data);
    },
    deleteGroup(data) {
      this.$emit("deleteGroup", data);
    },
    addDevice(data) {
      this.$emit("addDevice", data);
    },
  },
  created() {
    this.floors = document.getElementById("floors").textContent;
    this.devices = document.getElementById("devices").textContent;
    this.groups = document.getElementById("groups").textContent;

    EventBus.$on("addGroup", this.addGroup);
    EventBus.$on('updateGroup', this.updateGroup);
    EventBus.$on('deleteGroup', this.deleteGroup);
    EventBus.$on("addDevice", this.addDevice);
  },
  destroyed() {
    EventBus.$off("addGroup", this.addGroup);
    EventBus.$off('updateGroup', this.updateGroup);
    EventBus.$off('deleteGroup', this.deleteGroup);
    EventBus.$off("addDevice", this.addDevice);
  },
};
</script>
