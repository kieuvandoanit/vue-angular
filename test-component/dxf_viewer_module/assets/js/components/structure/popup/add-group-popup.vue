<template>
  <Popup
    :sidebarElementId="'add-device-popup'"
    :sidebarOpen="addGroup"
    @handleCloseSidebar="handleCloseSidebar"
  >
    <div class="content-item" style="border-bottom: 1px solid gray">
      <div class="title-name">
        <p>Create Group</p>
      </div>
    </div>
    <div class="content-item">
      <div class="title">
        <span>Name</span>
      </div>
      <input type="text" v-model="groupName" />
    </div>
    <div class="content-item" style="border-top: 1px solid gray; bottom: 0; display: block">
      <button class="btn btn-primary" style="float: right" @click="handleAddGroup">
        <span>Create</span>
      </button>
    </div>
  </Popup>
</template>

<script>
import axios from "axios";
import { EventBus } from "../../../store.js";
import Popup from "./right-popup.vue";

export default {
  components: {
    Popup,
  },
  props: {
    addGroup: false,
    selectedFile: {
      default() {
        return {};
      },
    },
    token: {
      type: String,
      default: "",
    },
  },
  mounted() { },

  watch: {
    // group(val) {
    //   this.group = val;
    // }
  },

  created() { },

  data() {
    return {
      groupName: "",
    };
  },
  computed: {
  },

  methods: {
    handleAddGroup() {
      let groupData = {
          name: this.groupName,
          file_id: this.selectedFile.id,
          building_id: this.selectedFile.building_id,
          project_id: this.selectedFile.project_id,
      };
      EventBus.$emit("addGroup", groupData);
      this.handleCloseSidebar();
    },
    handleCloseSidebar() {
      this.groupName = "";
      this.$emit("handleClosePopup");
    },
  },
};
</script>

<style></style>
