<template>
  <div id="content">
    <LayoutStructure
      :floors="JSON.parse(floors_data)"
      :groups="JSON.parse(groups_data)"
      :devices="JSON.parse(devices_data)"
    />
  </div>
</template>

<style>
@import "../scss/style.css";
</style>

<script>
import LayoutStructure from "./components/structure/layout-structure.vue";
import { EventBus } from "./store.js";
export default {
  props: ["groups", "floors", "devices"],
  data() {
    return {
      floors_data: "[]",
      devices_data: "[]",
      groups_data: "[]",
    };
  },

  components: {
    LayoutStructure,
  },

  mounted() {
    const floorplan = document.getElementById("summa-floorplan");
    this.floors_data = floorplan.getAttribute("floors");
    this.devices_data = floorplan.getAttribute("devices");
    this.groups_data = floorplan.getAttribute("groups");
  },

  watch: {
    floors(val) {
      this.floors_data = val;
    },
    groups(val) {
      this.groups_data = val;
    },
    devices(val) {
      this.devices_data = val;
    },
  },

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
    moveAllInGroup(data) {
      this.$emit("moveAllInGroup", data);
    },
    duplicateObject(data) {
      this.$emit("duplicateObject", data);
    },
    addDevice(data) {
      this.$emit("addDevice", data);
    },
    updateDevice(data) {
      this.$emit("updateDevice", data);
    },
    deleteDevice(data) {
      this.$emit("deleteDevice", data);
    },
    addToGroup(data) {
      this.$emit("addToGroup", data);
    },
  },
  created() {
    EventBus.$on("addGroup", this.addGroup);
    EventBus.$on("updateGroup", this.updateGroup);
    EventBus.$on("deleteGroup", this.deleteGroup);
    EventBus.$on("moveAllInGroup", this.moveAllInGroup);
    EventBus.$on("duplicateObject", this.duplicateObject);
    EventBus.$on("addDevice", this.addDevice);
    EventBus.$on("updateDevice", this.updateDevice);
    EventBus.$on("deleteDevice", this.deleteDevice);
    EventBus.$on("addToGroup", this.addToGroup);
  },
  destroyed() {
    EventBus.$off("addGroup", this.addGroup);
    EventBus.$off("updateGroup", this.updateGroup);
    EventBus.$off("deleteGroup", this.deleteGroup);
    EventBus.$off("moveAllInGroup", this.moveAllInGroup);
    EventBus.$off("duplicateObject", this.duplicateObject);
    EventBus.$off("addDevice", this.addDevice);
    EventBus.$off("updateDevice", this.updateDevice);
    EventBus.$off("deleteDevice", this.deleteDevice);
    EventBus.$off("addToGroup", this.addToGroup);
  },
};
</script>
