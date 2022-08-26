<template>
  <div class="position-relative">
    <div class="d-flex flex-column">
      <div class="floor-stack">
        <div
          v-for="(floor, index) in floorplans"
          :key="floor.id"
          class="d-flex justify-content-center"
        >
          <FloorstackItem
            :index="index"
            :floor="floor"
            :allFloors="floorplans"
            @handleFloorItemClick="handleFloorItemClick"
          ></FloorstackItem>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const axios = require("axios").default;
import { API_DOMAIN_MANIFERA } from "../../../constant.js";
import FloorstackItem from "./floorstack-item.vue";

export default {
  components: { FloorstackItem },
  props: {
    token: "",
    floors: {
      type: Object,
      default: null,
    },
  },

  watch: {
    floors(val) {
      this.floorplans = val;
    },
  },

  created() {},

  mounted() {
    this.floorplans = this.floors;
  },

  computed: {},

  data() {
    return {
      floorplans: null,
      groups: [],
      filterGroups: [],
      devices: [],
      files: [],
      selectedFile: null,
      selectedFileId: null,
    };
  },

  methods: {
    handleFloorItemClick(file) {
      this.selectedFile = file;
      this.selectedFileId = file.id;
      this.$emit("handleSelectedFloor", file);
    },
  },
};
</script>
