<template>
  <div class="layout-left" v-bind:style="paddingRight">
    <div class="box-header">
      <div class="header d-flex">
        <div class="top-header" @click="back()" v-if="navigator != 'Dashboard'">
          <i class="fa-solid fa-left-long"></i> {{ navigator }}
        </div>
        <div
          class="bottom-header d-flex"
          style="justify-content: space-between"
        >
          <!-- <div class="d-flex">
            <template v-if="navigator == 'Dashboard'">
              <i class="fa-solid fa-building"></i>
            </template>
            <template v-else-if="navigator == 'Floorplans'">
              <i class="fa-solid fa-layer-group"></i>
            </template>
             <h2 v-show="!addBuilding" class="title-building">
              {{ titleSelect }}
            </h2> 
            <NavSelect
              ref="navSelect"
              v-show="!addBuilding"
              :data="selectNav"
              @selectBuilding="selectBuilding"
            ></NavSelect>
          </div>
          <template
            v-if="
              this.selectedBuilding &&
              Object.keys(this.selectedBuilding).length > 0
            "
          >
            <div
              v-if="
                (editBuilding ||
                  addGroup ||
                  addFloor ||
                  editFloor ||
                  addBuilding) &&
                expanded
              "
            >
              <button class="btn btn-secondary" @click="back()">Cancel</button>
              <button class="btn btn-primary" @click="submit()">Save</button>
            </div>

            <div
              v-if="
                !(
                  editBuilding ||
                  addGroup ||
                  addFloor ||
                  editFloor ||
                  addBuilding
                ) && expanded
              "
            >
              <button
                type="button"
                class="btn btn-primary"
                @click="showBuildingModal = true"
              >
                Remove building
              </button>

              <button
                type="button"
                class="btn btn-primary"
                @click="handleAddBuilding"
              >
                Create building
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="handleEditBuilding"
              >
                Edit building
              </button>
            </div>
          </template> -->
        </div>
      </div>
    </div>
    <FloorplanList
      v-show="visibleFloor"
      :groups="groups"
      :floors="floors"
      :expanded="expanded"
      :token="token"
      @compactClick="handleCompactClick"
      @expandedClick="handleExpandedClick"
      @layoutGroup="handleGroup"
      @handleClickFloorName="handleClickFloorName"
      @onFloorsChange="handleFloorsChange"
    ></FloorplanList>
    <!-- <AddGroup
      v-show="addGroup"
      :token="token"
      :floorplan="selectedFloor"
      @back="back"
    ></AddGroup> -->
  </div>
</template>

<script>
import { EventBus, store, storeFunctions } from "../../../store.js";

import Modal from "../popup/modal.vue";
import FloorplanList from "./layout-left-list.vue";
import NavSelect from "../nav-select.vue";

export default {
  components: {
    FloorplanList,
    NavSelect,
    Modal,
  },
  props: {
    project: {
      default() {
        return {};
      },
    },
    buildings_json: {
      default() {
        return "[]";
      },
    },
    token: "",
    groups_json: {
      default() {
        return "[]";
      },
    },
    devices_json: {
      default() {
        return "[]";
      },
    },
    floors_json: {
      default() {
        return "[]";
      },
    },
  },

  mounted() {
    // this.buildings = JSON.parse(this.buildings_json);
    this.floors = this.floors_json;
    // this.selectNav = JSON.parse(this.buildings_json);
    this.groups = this.groups_json;
    this.devices = this.devices_json;
    // this.selectBuilding(this.buildings[0]);
    // this.titleSelect = this.buildings[0].name;
    // this.projectData = JSON.parse(this.project);
  },

  created() {},

  data() {
    return {
      errorMessage: "",
      loading: false,
      // showBuildingModal: false,
      // buildings: {},
      paddingRight: {},
      // selectedBuilding: {},
      editSelectedFloor: {},
      expanded: false,
      visibleGroup: false,
      visibleFloor: true,
      navigator: "Dashboard",
      // selectNav: {},
      // titleSelect: "",
      selectedFloor: {},
      groups: [],
      // filteredGroups: [],
      // filteredFloors: [],
      devices: [],
      floors: [],
      // editBuilding: false,
      // addGroup: false,
      // addFloor: false,
      // editFloor: false,
      // addBuilding: false,
      projectData: {},
    };
  },

  computed: {
    currentNav() {
      return store.currentNav;
    },
  },

  watch: {
    currentNav(val) {
      this.navigator = val;
    },
    floors_json(val) {
      this.floors = val;
    },
    groups_json(val) {
      this.groups = val;
    },
    devices_json(val) {
      this.devices = val;
    },
  },

  methods: {
    resetActions() {
      this.visibleGroup = false;
      this.visibleFloor = true;
      // this.editBuilding = false;
      // this.addGroup = false;
      this.expanded = false;
      // this.addFloor = false;
      // this.editFloor = false;
      // this.addBuilding = false;
      this.navigator = "Dashboard";
      this.loading = false;
      this.errorMessage = "";
      storeFunctions.setSelectedGroup(null);
    },
    handleClickFloorName(v) {
      this.$emit("handleClickFloor", v);
    },
    // selectBuilding(building) {
    //   this.$emit("handleSelectBuilding", building);
    //   this.selectedBuilding = building;
    //   if (this.navigator == "Dashboard") {
    //     this.titleSelect = building.name;
    //     this.filteredGroups = this.groups.filter(
    //       (group) => group.building_id == building.id
    //     );

    //     this.filteredFloors = this.floors.filter(
    //       (floor) => floor.building_id == building.id
    //     );
    //   } else if (this.navigator == "Floorplans") {
    //     this.titleSelect = building.full_name;
    //     this.selectedFloor = building;

    //     this.filteredGroups = this.groups.filter(
    //       (group) => group.file_id == building.id
    //     );

    //     this.filteredFloors = this.floors.filter(
    //       (floor) => floor.file_id == building.id
    //     );

    //     // axios.defaults.headers.common["Authorization"] = this.token;
    //     // axios.defaults.headers.post["Content-Type"] =
    //     //   "application/x-www-form-urlencoded";
    //     // axios
    //     //   .get(
    //     //     `${API_DOMAIN_MANIFERA}/api/v1/groups?file_id=${building.id}&is_active=false`
    //     //   )
    //     //   .then((response) => {
    //     //     this.groupData = response.data;
    //     //   })
    //     //   .catch((error) => {});
    //   }
    // },
    back() {
      if (this.navigator == "Dashboard") {
      } else if (
        this.navigator == "Floorplans" ||
        this.navigator == "Edit Building" ||
        this.navigator == "Add Group" ||
        this.navigator == "Add Floor" ||
        this.navigator == "Edit Floor" ||
        this.navigator == "Add Building"
      ) {
        this.resetActions();
        // this.selectNav = this.buildings;
        // this.titleSelect = this.buildings[0].name;
        this.navigator = "Dashboard";
        // this.selectedBuilding = this.buildings[0];
        // this.filteredFloors = this.floors.filter(
        //   (floor) => floor.building_id == this.selectedBuilding.id
        // );
        // this.filteredGroups = this.groups.filter(
        //   (group) => group.building_id == this.selectedBuilding.id
        // );
        this.$emit("changeExpanded", false);
        this.paddingRight = { padding: "0 0 0 50px" };
        storeFunctions.setShowFloorStackSelector(true);
        storeFunctions.setCurrentNav("Dashboard");
        storeFunctions.setSelectedFloorplan(null);
        storeFunctions.setPopup(false);
        EventBus.$emit("compactClick");
        this.$emit("closeButtonCreate");
      }
    },
    handleExpandedClick() {
      this.$emit("handleExpandedView");
      this.paddingRight = { padding: "0 50px" };
      this.expanded = true;
    },

    handleCompactClick() {
      this.$emit("handleCompactView");
      this.paddingRight = { padding: "0 0 0 50px" };
      this.expanded = false;
    },
    // handleRefreshBuilding() {
    //   this.back();
    //   axios.defaults.headers.common["Authorization"] = this.token;
    //   axios.defaults.headers.post["Content-Type"] =
    //     "application/x-www-form-urlencoded";
    //   this.loading = true;
    //   axios
    //     .get(
    //       `${API_DOMAIN_MANIFERA}/api/v1/buildings?project_id=${this.projectData.id}`
    //     )
    //     .then((response) => {
    //       this.buildings = response.data;
    //       let selectedBuilding = {};
    //       for (let i = 0; i < this.buildings.length; i++) {
    //         if (this.buildings[i].id == this.selectedBuilding.id) {
    //           selectedBuilding = this.buildings[i];
    //           break;
    //         }
    //       }
    //       if (Object.keys(selectedBuilding).length > 0) {
    //         this.selectBuilding(selectedBuilding);
    //       } else {
    //         if (this.buildings && this.buildings.length > 0) {
    //           this.selectBuilding(this.buildings[0]);
    //         } else {
    //           this.selectedBuilding = {};
    //           this.titleSelect = "";
    //         }
    //       }
    //       this.selectNav = this.buildings;
    //       this.loading = false;
    //     })
    //     .catch((error) => {});
    // },

    handleGroup(obj) {
      this.selectNav = this.selectedBuilding.floorplans;
      // this.titleSelect = obj.full_name;
      this.selectedFloor = obj;
      this.$emit("handleGroup", obj);
      this.navigator = "Floorplans";
      this.visibleFloor = false;
      this.visibleGroup = true;

      // this.filteredGroups = this.groups.filter(
      //   (group) => group.file_id == obj.id
      // );

      // axios.defaults.headers.common["Authorization"] = this.token;
      // axios.defaults.headers.post["Content-Type"] =
      //   "application/x-www-form-urlencoded";
      // axios
      //   .get(
      //     `${API_DOMAIN_MANIFERA}/api/v1/groups?file_id=${obj.id}&is_active=false`
      //   )
      //   .then((response) => {
      //     this.groupData = response.data;
      //   })
      //   .catch((error) => {});
    },
    // handleEditBuilding() {
    //   this.resetActions();
    //   this.visibleFloor = false;
    //   this.expanded = true;
    //   this.editBuilding = true;
    //   this.navigator = "Edit Building";
    // },
    // handleAddBuilding() {
    //   this.resetActions();
    //   this.visibleFloor = false;
    //   this.expanded = true;
    //   this.addBuilding = true;
    //   this.navigator = "Add Building";
    // },
    // handleAddGroup(floor) {
    //   this.resetActions();
    //   this.visibleFloor = false;
    //   this.expanded = true;
    //   this.addGroup = true;
    //   this.selectedFloor = floor;
    //   this.navigator = "Add Group";
    // },
    // handleAddFloor() {
    //   this.resetActions();
    //   this.$refs.listLayer.expandedClick();
    //   this.visibleFloor = false;
    //   this.expanded = true;
    //   this.addFloor = true;
    //   this.navigator = "Add Floor";
    // },
    // handleEditFloor(floor) {
    //   this.resetActions();
    //   this.$refs.listLayer.expandedClick();
    //   this.visibleFloor = false;
    //   this.expanded = true;
    //   this.editFloor = true;
    //   this.navigator = "Edit Floor";
    //   this.editSelectedFloor = floor;
    // },
    // async handleDeleteBuilding() {
    //   this.resetActions();
    //   axios.defaults.headers.common["Authorization"] = this.token;
    //   this.loading = true;
    //   await axios
    //     .delete(
    //       `${API_DOMAIN_MANIFERA}/api/v1/buildings/${this.selectedBuilding.id}`
    //     )
    //     .then((response) => {
    //       this.handleRefreshBuilding();
    //       this.showBuildingModal = false;
    //       this.$refs.listLayer.compactClick();
    //     })
    //     .catch((error) => {
    //       this.errorMessage = "Unable to delete building";
    //     });
    //   this.loading = false;
    // },
    // submit() {
    //   if (this.addGroup) {
    //     this.$emit("add_group", this.selectedFloor);
    //   }
    // },

    handleFloorsChange(floors) {
      this.$emit("handleFloorsChange", floors);
    },
  },

  created() {
    // EventBus.$on("handleEditFloor", this.handleEditFloor);
  },
  destroyed() {
    // EventBus.$off("handleEditFloor", this.handleEditFloor);
  },
};
</script>
