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

  created(){
    this.floors = document.getElementById("floors").textContent;
    this.devices = document.getElementById("devices").textContent;
    this.groups = document.getElementById("groups").textContent;
  },

  mounted() {
    

  },
};
</script>
