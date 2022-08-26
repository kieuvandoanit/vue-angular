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
import {floors} from "./dummy/dummy_floors.js";
import {devices} from "./dummy/dummy_devices.js";
import {groups} from "./dummy/dummy_groups.js";
export default {
  props: ["msg"],
  data() {
    return {
      floors: floors,
      devices: devices,
      groups: groups
    };
  },
  components: {
    LayoutStructure,
  },
  created() {},
  mounted() {
  },
  methods: {
    // addGroup(data) {
    //   this.$emit("addGroup", data);
    // },
  },
};
</script>
