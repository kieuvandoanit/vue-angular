<template>
  <div class="row container-structure">
    <div v-bind:class="colLeft" class="padding-0">
      <LayoutLeft
        ref="layoutLeft"
        :token="this.token"
        :buildings_json="this.buildings"
        :groups_json="this.groups"
        :devices_json="this.devices"
        :floors_json="this.floors"
        :project="this.project"
        @handleSelectBuilding="handleSelectBuilding"
        @handleExpandedView="handleExpandedView"
        @handleCompactView="handleCompactView"
        @handleGroup="handleGroup"
        @changeExpanded="changeExpanded"
        @editBuilding="editBuilding"
        @handleItemClick="handleItemClick"
        @handleClickFloor="handleClickFloor"
        @handleFloorsChange="handleFloorsChange"
      ></LayoutLeft>
    </div>
    <div v-bind:class="colRight" class="padding-0">
      <LayoutRight
        ref="layoutRight"
        :token="this.token"
        :title="this.title"
        :groups="this.groups"
        :floors="this.floors"
        :devices="this.devices"
        :currentFloors="floors"
        :viewMode="viewMode"
        @editBuilding="editBuilding"
      ></LayoutRight>
    </div>

    <!-- <Modal
      v-if="floorData"
      :show="showModalEditFloorplan"
      header="Floor plan configuration is not finished."
      body="Layers are not defined. Please click Edit floorplan below to define."
      :loading="loading"
      :error="errorMessage"
      buttonText="Edit floorplan"
      @action="handleActionEditFloorplanModal"
    >
    </Modal> -->
  </div>
</template>

<script>
import { getParentGroup } from "../../Helper/GroupHelper.js";
import { store, storeFunctions, EventBus } from "../../store.js";
import LayoutLeft from "./layout-left/layout-left.vue";
import LayoutRight from "./layout-right/layout-right.vue";
import Modal from "./popup/modal.vue";

export default {
  components: { LayoutLeft, LayoutRight, Modal },
  props: {
    buildings: {
      default() {
        return "[]";
      },
    },
    project: {
      default() {
        return {};
      },
    },
    groups: {
      default() {
        return "[]";
      },
    },
    floors: null,
    devices: {
      default() {
        return "[]";
      },
    },
    token: "",
  },

  mounted() {
    //JSON.parse(this.buildings); nho parse du lieu
  },

  computed: {
    selectedFloorplan() {
      return store.selectedFloorplan;
    },
    selectedGroup() {
      return store.selectedGroup;
    },
  },

  watch: {
    selectedFloorplan(val) {
      if (val) {
        this.floorData = val;
        this.title = val.full_name;
      } else {
        this.title = "";
      }
    },
  },

  created() {},

  data() {
    return {
      colLeft: "col-4",
      colRight: "col-8",
      title: "",
      // popup: false,
      // data: {},
      floorData: null,
      currentFloors: null,
      currentNavigation: "",
      viewMode: "",
      loading: false,
      errorMessage: "",
      newGroups: [],
    };
  },

  methods: {
    // handleSelectBuilding(v) {
    //   console.log("handleSelectBuilding", v);
    //   this.currentFloors = v;
    // },

    handleExpandedView() {
      this.colLeft = "col-12";
      this.colRight = "col-0 d-none";
      this.viewMode = "expand";
    },

    handleCompactView() {
      this.colLeft = "col-4";
      this.colRight = "col-8";
      this.viewMode = "compact";
    },

    handleGroup(obj) {
      this.title = obj.name;
    },

    changeExpanded(status) {
      if (status == false) {
        this.colLeft = "col-4";
        this.colRight = "col-8";
      } else {
        this.colLeft = "col-12";
        this.colRight = "col-0";
      }
    },

    editBuilding(obj) {
      this.$refs.layoutLeft.$children[1].expandedClick();
      this.$refs.layoutLeft.handleEditBuilding();
    },

    resetActions() {
      // this.popup = false;
      storeFunctions.setPopup(false);
      // this.data = {};
      storeFunctions.setSelectedGroup(null);
    },

    handlePopupLayOutRight() {
      this.$refs.layoutRight.addGroup = false;
      this.$refs.layoutRight.areaMode = false;
      this.$refs.layoutRight.addDevice = false;
      this.$refs.layoutRight.$children[0].isAddAreaOpen = false;
      this.$refs.layoutRight.$children[0].isAddDeviceOpen = false;
      this.$refs.layoutRight.$children[0].isAddToGroupOpen = false;
    },

    // This groups data has parent_id key in the children group
    getNewGroups(data) {
      this.newGroups = data;
    },

    handleItemClick(obj, selectedFloor = null) {
      this.handlePopupLayOutRight();
      storeFunctions.setCurrentNav("Floorplans");
      if (obj.type == "Group") {
        storeFunctions.setSelectedGroup(obj);
        // EventBus.$emit("getScenarios", obj);
        storeFunctions.setPopup(true);

        // This parentGroups is considered as a "history" of the groups when user click on the children group
        const parentGroups = getParentGroup(this.newGroups, obj.id);

        this.$refs.layoutRight.$children[0].$emit("handleSelectGroup", obj);
        this.$refs.layoutRight.$children[0].$emit(
          "handleSetHistory",
          parentGroups
        );

        if (selectedFloor && this.floorData.id != selectedFloor.id) {
          this.floorData = selectedFloor;
          this.title = selectedFloor.full_name;
        }
        // this.data = obj;
      } else if (obj.type == "Floorplan") {
        // this.checkLayersForFloorplan(obj);
        this.title = obj.full_name;
        // this.popup = false;
        storeFunctions.setPopup(false);
        if (!this.floorData || this.floorData.id != obj.id) {
          this.floorData = obj;
          storeFunctions.setSelectedFloorplan(this.floorData);
        }
      }
    },

    handleClickFloor(v) {
      console.log("handleClickFloor", v);
      // this.data = v;
      storeFunctions.setSelectedFloorplan(v);
    },

    // checkLayersForFloorplan(floor) {
    //   if (
    //     floor.floor_layer_name == "" ||
    //     floor.fixture_layer_name == "" ||
    //     floor.sensor_layer_name == ""
    //   ) {
    //     this.showModalEditFloorplan = true;
    //   }
    // },

    // handleActionEditFloorplanModal() {
    //   this.showModalEditFloorplan = false;
    //   EventBus.$emit("handleEditFloor", this.floorData);
    // },

    handleFloorsChange(floors) {
      console.log("handleFloorsChange", floors);
      this.currentFloors = floors;
    },
  },
  created() {
    EventBus.$on("resetActions", this.resetActions);
    EventBus.$on("handleItemClick", this.handleItemClick);
    EventBus.$on("updateGroups", this.getNewGroups);
  },
  destroyed() {
    EventBus.$off("resetActions", this.resetActions);
    EventBus.$off("handleItemClick", this.handleItemClick);
  },
};
</script>
