<template>
  <div id="content">
    <!-- <img :src="vueImage.activeGroup" alt="aaaaa"> -->
    <LayoutStructure
      :buildings="myBuilding"
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
import { buildings } from "./dummy/dummy_building";
import { devices } from "./dummy/dummy_devices";
import { floors } from "./dummy/dummy_floors";
import { groups } from "./dummy/dummy_groups";

export default {
  props: ['msg', "vueImage"],
  data() {
    return {
      myBuilding: buildings,
      myDevices: devices,
      myFloors: floors,
      myGroups: groups,
    };
  },
  components: {
    LayoutStructure,
  },
  mounted() {
    console.log('this.vueImage :>> ', this.vueImage);
  },
};
</script>
