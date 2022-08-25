<template>
  <div class="layout-right">
    <div class="box-header">
      <div class="header d-flex">
        <div></div>
        <div class="bottom-header d-flex">
          <div>{{ this.title }}</div>
          <div>
            <button type="button" v-show="!buttonEdit" class="btn btn-primary">
              Edit structure
            </button>

            <button
              id="add-group"
              type="button"
              v-show="showBackButton"
              @click="handleBackButton"
              class="btn btn-primary"
            >
              Back to Edit mode
            </button>

            <!-- Start group mode function -->
            <button
              id="add-group"
              type="button"
              v-show="showCreateGroupButton"
              @click="handleCreateGroupButton"
              class="btn btn-primary"
            >
              Create Group
            </button>

            <!-- <button
              id="move-group"
              type="button"
              v-show="showMoveGroupButton"
              @click="handleMoveGroupButton"
              class="btn btn-primary"
            >
              Move Group
            </button> -->
            <!-- End group mode function -->

            <!-- Start device mode function -->
            <button
              id="add-device"
              type="button"
              v-show="showCreateDeviceButton"
              @click="handleCreateDeviceButton"
              class="btn btn-primary"
            >
              Create Device
            </button>
            <!-- End device mode function -->

            <!-- Start area mode function -->
            <button
              id="add-device"
              type="button"
              v-show="showDrawAreaButton"
              @click="handleDrawAreaButton"
              class="btn btn-primary"
            >
              Draw Area
            </button>

            <button
              id="add-device"
              type="button"
              v-show="showDrawPolygonAreaButton"
              @click="handleDrawPolygonAreaButton"
              class="btn btn-primary"
            >
              Draw Polygon Area
            </button>
            <!-- End area mode function -->

            <!-- Button mode -->
            <!-- <button
              id="add-area"
              type="button"
              v-show="showAreaModeButton"
              @click="handleAreaModeButton"
              class="btn btn-primary"
            >
              Area Mode
            </button> -->
            <!-- End button mode -->
          </div>
        </div>
      </div>
    </div>
    <LayoutRightViewer
      ref="LayoutRightViewer"
      :file="floor"
      :groups="groups"
      :devices="devices"
      :areas="areas"
      :needRefresh="needRefresh"
      :addGroup="addGroup"
      :addDevice="addDevice"
      :areaMode="areaMode"
      @duplicateObjects="duplicateObjects"
    ></LayoutRightViewer>
    <div v-show="isShowFloorStack" class="floor-stack-wrapper">
      <Floorstack
        :token="token"
        :floors="floors"
        @handleSelectedFloor="handleSelectedFloorStack"
      ></Floorstack>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { API_DOMAIN_MANIFERA } from "../../../constant.js";
import { store, storeFunctions, EventBus } from "../../../store.js";

import LayoutRightViewer from "./layout-right-viewer.vue";
import Floorstack from "../floorstack/floorstack.vue";

export default {
  components: { Floorstack, LayoutRightViewer },
  props: {
    token: "",
    title: "",
    groups: null,
    selectedFloor: null,
    devices: null,
    floors: null,
    viewMode: "",
  },

  created() {},

  mounted() {},

  updated() {},

  computed: {
    showFloorStack() {
      return store.isShowFloorStackSelector;
    },
  },

  watch: {
    async selectedFloor(val) {
      this.handleBackButton();
      if (val) {
        storeFunctions.setShowFloorStackSelector(false);

        let refresh = false;
        if ((this.floor && this.floor.id != val.id) || this.floor == null) {
          refresh = true;
        }
        this.floor = val;
        // this.showAddGroup = true;
        // this.showDeviceModeButton = true;
        // this.showAreaModeButton = true;
        // this.showGroupModeButton = true;

        this.selectedFileId = val.id;
        if (refresh && this.selectedFileId) {
          await this.getDevices(refresh);
          this.getGroups();
          this.getAreas();
        }
      }
    },

    viewMode(val) {
      if (val === "compact") {
        storeFunctions.setShowFloorStackSelector(true);
      } else {
        storeFunctions.setShowFloorStackSelector(false);
      }
    },

    showFloorStack(val) {
      this.isShowFloorStack = val;
    },
  },

  data() {
    return {
      showBackButton: false,
      // showGroupModeButton: false,
      // showDeviceModeButton: false,
      showAreaModeButton: false,
      showCreateGroupButton: false,
      showMoveGroupButton: false,
      showCreateDeviceButton: false,
      showDrawAreaButton: false,
      showDrawPolygonAreaButton: false,

      addGroup: false,
      addDevice: false,

      areaMode: false,
      addAreaMode: false,

      buttonEdit: true,
      floor: null,
      groups: [],
      devices: [],
      areas: [],
      selectedFileId: null,
      needRefresh: true,
      isShowFloorStack: true,
    };
  },

  methods: {
    handlePopupLayoutRightViwer() {
      this.$refs.LayoutRightViewer.isAddToGroupOpen = false;
      this.$refs.LayoutRightViewer.isAddDeviceOpen = false;
      this.$refs.LayoutRightViewer.isAddAreaOpen = false;
      storeFunctions.setPopup(false);
    },

    getGroups() {
      // axios
      //   .get(
      //     `${API_DOMAIN_MANIFERA}/api/v1/groups?file_id=${this.selectedFileId}`
      //   )
      //   .then((response) => {
      let responseGroups = this.groups.filter(
        (group) => group.file_id == this.selectedFileId
      );
      responseGroups.forEach((data1) => {
        responseGroups.forEach((data2) => {
          if (data2.group_ids.includes(data1.id)) {
            data1.parent_id = data2.id;
          }
        });
      });

      responseGroups.forEach((data) => {
        data.childrens = this.findChildrens(data, responseGroups);
        let device_childrens = [
          ...data.device_ids,
          ...this.findDeviceChildrens(data, responseGroups),
        ];

        data.controllable = false;

        let unscanDevices = this.devices.filter((device) => {
          return (
            device_childrens.includes(device.id) &&
            (!device.serial_number || device.serial_number.length < 3)
          );
        });

        data.controllable = unscanDevices.length == 0;
      });

      this.groups = responseGroups;
      //     // this.$root.$children[0].$children[0].$children[1].updateGroups(
      //     //   responseGroups
      //     // );
      //     // this.$root.$children[0].$children[0].$children[1].updateTreeNode(
      //     //   responseGroups
      //     // );
      EventBus.$emit("updateGroups", responseGroups);
      //     // EventBus.$emit("updateTreeNode", responseGroups);s
      //   })
      //   .catch((error) => {})
      //   .then((a) => {});
    },

    // recursion to append all children ids of a group
    findChildrens(group, groups) {
      let childrens = [];
      groups.forEach((data) => {
        if (data.parent_id == group.id) {
          childrens.push(data.id);
          childrens = childrens.concat(this.findChildrens(data, groups));
        }
      });
      return childrens;
    },

    findDeviceChildrens(group, groups) {
      let childrens = [];
      if (group.childrens && group.childrens.length > 0) {
        group.childrens.forEach((childId) => {
          let child = groups.find((group) => {
            return group.id == childId;
          });
          if (child) {
            childrens = [
              ...childrens,
              ...child.device_ids,
              ...this.findDeviceChildrens(child, groups),
            ];
          }
        });
      }
      return childrens;
    },

    async handleSelectedFloorStack(v) {
      EventBus.$emit("checkLayersForFloorplan", v);
      storeFunctions.setShowFloorStackSelector(false);
      storeFunctions.setCurrentNav("Floorplans");
      storeFunctions.setSelectedFloorplan(v);
      this.showAddGroup = true;
      this.showDeviceMode = true;
      this.showAreaMode = true;
      this.showGroupMode = true;
      this.selectedFileId = v.id;
      this.floor = v;
      await this.getDevices(true);
      this.getGroups();
      this.getAreas();
    },

    getDevices(refresh = true) {
      axios.defaults.headers.common["Authorization"] = this.token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      // axios
      //   .get(
      //     `${API_DOMAIN_MANIFERA}/api/v1/files/${this.selectedFileId}/devices`
      //   )
      //   .then((response) => {
      //     let responseData = response.data;
      //     // responseData.forEach((data1) => {
      //     //   this.groups.forEach((data2) => {
      //     //     if (data2.device_ids.includes(data1.id)) {
      //     //       data1.parent_id = data2.id;
      //     //     }
      //     //   });
      //     // });

      //     this.devices = responseData;
      //     this.needRefresh = refresh;
      //   })
      //   .catch((error) => {})
      //   .then((a) => {});
    },

    getAreas(refresh = true) {
      axios.defaults.headers.common["Authorization"] = this.token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      // axios
      //   .get(`${API_DOMAIN_MANIFERA}/api/v1/files/${this.selectedFileId}/areas`)
      //   .then((response) => {
      //     let responseData = response.data;
      //     this.areas = responseData;
      //   })
      //   .catch((error) => {})
      //   .then((a) => {});
    },

    handleBackButton() {
      this.showAreaModeButton = true;

      this.showCreateGroupButton = true;
      this.showCreateDeviceButton = true;
      this.showMoveGroupButton = true;
      this.showBackButton = false;
      this.showDrawAreaButton = false;
      this.showDrawPolygonAreaButton = false;

      this.addGroup = false;
      this.addDevice = false;

      this.areaMode = false;
    },

    handleAreaModeButton() {
      this.showDrawAreaButton = true;
      this.showDrawPolygonAreaButton = true;
      this.showBackButton = true;

      this.showCreateGroupButton = false;
      this.showCreateDeviceButton = false;
      this.showMoveGroupButton = false;

      this.areaMode = true;
      this.addGroup = false;
      this.addDevice = false;

      this.showAreaModeButton = false;
    },

    handleCreateGroupButton() {
      this.addGroup = true;
      // this.$parent.popup = true;
      // storeFunctions.setPopup(true);

      this.addDevice = false;
      this.areaMode = false;
      this.handlePopupLayoutRightViwer();
    },

    handleMoveGroupButton() {
      this.areaMode = false;

      this.addGroup = false;
      this.addDevice = false;
    },

    handleCreateDeviceButton() {
      this.addDevice = true;
      // this.$parent.popup = true;

      this.addGroup = false;
      this.areaMode = false;

      this.handlePopupLayoutRightViwer();
      // EventBus.$emit("onEnableCreateDevice");
    },

    handleDrawAreaButton() {
      EventBus.$emit("handleSwitchToDrawArea");
    },

    handleDrawPolygonAreaButton() {
      EventBus.$emit("handleSwitchToDrawPolygonArea");
    },
  },
  created() {
    EventBus.$on("getGroups", this.getGroups);
    EventBus.$on("getDevices", this.getDevices);
    EventBus.$on("getAreas", this.getAreas);
  },
  destroyed() {
    EventBus.$off("getGroups", this.getGroups);
    EventBus.$off("getDevices", this.getDevices);
    EventBus.$off("getAreas", this.getAreas);
  },
};
</script>
