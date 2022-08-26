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
      groups_data: "[]"
    };
  },
  components: {
    LayoutStructure,
  },
  mounted() {},
  watch: {
    floors(val){
      this.floors = val;
      this.floors_data = val;
      console.log(val);
    }
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
    addDevice(data) {
      this.$emit("addDevice", data);
    },
  },
  created() {
    this.floors_data = document.getElementById("floors").textContent;
    this.devices_data = document.getElementById("devices").textContent;
    this.groups_data = document.getElementById("groups").textContent;

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
