<template>
  <div class="position-relative">
    <div class="d-flex flex-column">
      <div class="floor-stack">
        <div
          v-for="(floor, index) in floors"
          :key="floor.id"
          class="d-flex justify-content-center"
        >
          <FloorstackItem
            :index="index"
            :floor="floor"
            :allFloors="floors"
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
      console.log("watch_building", val);
      this.floors = val;
    },
  },

  created() {},

  mounted() {},

  computed: {},

  data() {
    return {
      floorplans: [],
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
