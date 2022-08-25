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
  props: ["msg", "floors", "devices", "groups"],
  data() {
    return {
    };
  },
  components: {
    LayoutStructure,
  },
  mounted() {
    // this.$emit("abc", {detail: "data ne"});

  },
};
</script>
