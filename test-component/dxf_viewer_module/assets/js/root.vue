<template>
  <div id="content">
    <!-- <img :src="vueImage.activeGroup" alt="aaaaa"> -->
    <LayoutStructure
      :floors="myFloors"
      :groups="myGroups"
      :devices="myDevices"
    />
  </div>
</template>

<style>
@import "../scss/style.css";
</style>

<script>
import LayoutStructure from "./components/structure/layout-structure.vue";
import { devices } from "./dummy/dummy_devices";
import { floors } from "./dummy/dummy_floors";
import { groups } from "./dummy/dummy_groups";

export default {
  props: ["msg", "vueImage"],
  data() {
    return {
      myDevices: JSON.parse(devices),
      myFloors: JSON.parse(floors),
      myGroups: JSON.parse(groups),
    };
  },
  components: {
    LayoutStructure,
  },
  mounted() {},
};
</script>
