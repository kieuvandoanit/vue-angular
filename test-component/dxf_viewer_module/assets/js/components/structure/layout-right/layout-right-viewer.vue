<template>
  <div class>
    <StructureViewer
      :file="file || selectedFile"
      :devices="devices"
      :groups="groups"
      :areas="areaData"
      :needRefresh="needRefresh"
      :deviceMode="addDevice"
      :areaMode="areaMode"
      :enableMoveDevice="enableMoveDevice"
      :enableMoveGroup="enableMoveGroup"
      :enableMoveAllInGroup="enableMoveAllInGroup"
      :addDeviceMode="addDevice"
      :addAreaMode="addAreaMode"
      :addPolygonAreaMode="addPolygonAreaMode"
      :deletedAreaId="deletedAreaId"
      :deletedDeviceId="deletedDeviceId"
      :deletedGroupId="deletedGroupId"
      :isToggle="allPopupClosed"
      @handleSingleClick="handleIconSingleClick"
      @handleDoubleClick="handleIconDoubleClick"
      @handleFloorplanBackButton="handleFloorplanBackButton"
      @visibleGroups="handleVisibleGroups"
    ></StructureViewer>

    <AddGroupPopup
      :addGroup="addGroup"
      :token="token"
      :selectedFile="selectedFile"
      @handleClosePopup="handleCloseAddGroup"
    ></AddGroupPopup>

    <DetailGroupPopup
      :data="data"
      :scenes="scenes"
      :token="token"
      :parentGroups="parentGroups"
      :isOpen="isToggle"
      @handleEnableMoveGroup="handleEnableMoveGroup"
      @handleAddToGroup="handleAddToGroup"
      @handleUpdateGroup="handleUpdateGroup"
      @handleDeleteGroup="handleDeleteGroup"
      @handleCloseSidebar="handleCloseSidebar"
    ></DetailGroupPopup>

    <AddToGroupPopup
      :token="token"
      :isOpen="isAddToGroupOpen"
      :devices="selectedDevices"
      :groups="selectedGroups"
      :parentGroups="parentGroups"
      :clickType="clickType"
      :isMoveDevice="enableMoveDevice"
      :errorUpdateDeviceMessage="errorUpdateDevice"
      :isLoading="isLoading"
      :isDuplicating="isDuplicating"
      @handleAddToGroup="handleAddToGroup"
      @handleUpdateGroup="handleUpdateGroup"
      @handleUpdateObjects="handleUpdateObjects"
      @handleUpdateDevice="handleUpdateDevice"
      @handleDeleteDevice="handleDeleteDevice"
      @handleDeleteGroup="handleDeleteGroup"
      @handleEnableMoveGroup="handleEnableMoveGroup"
      @handleEnableMoveAllInGroup="handleEnableMoveAllInGroup"
      @handleEnableMoveDevice="handleEnableMoveDevice"
      @handleClosePopup="handleCloseAddToGroupPopup"
      @handleDuplicateObject="handleDuplicateObject"
    ></AddToGroupPopup>

    <AddDevicePopup
      :isOpen="addDevice"
      :file="file || selectedFile"
      :device="selectedNewDevice"
      :isMoveDevice="enableMoveDevice"
      :errorUpdateDeviceMessage="errorUpdateDevice"
      @handleCreateDevice="handleCreateDevice"
      @handleUpdateDevice="handleUpdateDevice"
      @handleEnableCreateDevice="handleEnableCreateDevice"
      @handleEnableMoveDevice="handleEnableMoveDevice"
      @handleClosePopup="handleCloseAddDevicePopup"
    ></AddDevicePopup>

    <AddAreaPopup
      :isOpen="isAddAreaOpen"
      :area="selectedArea"
      @handleCreateArea="handleCreateArea"
      @handleUpdateArea="handleUpdateArea"
      @handleDeleteArea="handleDeleteArea"
      @handleClosePopup="handleCloseAddAreaPopup"
    ></AddAreaPopup>
  </div>
</template>

<script>
import axios from "axios";
import { API_DOMAIN_MANIFERA } from "../../../constant.js";
import Popup from "../popup/right-popup.vue";
import Segment from "../popup/segment.vue";
import StructureViewer from "../structure-viewer.vue";
import AddToGroupPopup from "../popup/add-to-group-popup.vue";
import AddDevicePopup from "../popup/add-device-popup.vue";
import AddAreaPopup from "../popup/add-area-popup.vue";
import AddGroupPopup from "../popup/add-group-popup.vue";
import DetailGroupPopup from "../popup/detail-group-popup.vue";
import { EventBus, store, storeFunctions } from "../../../store.js";

export default {
  components: {
    Popup,
    Segment,
    StructureViewer,
    AddToGroupPopup,
    AddDevicePopup,
    AddAreaPopup,
    AddGroupPopup,
    DetailGroupPopup,
  },
  props: {
    popup: {
      type: Boolean,
      default: false,
    },
    file: {
      default() {
        return {};
      },
    },
    groups: {
      default() {
        return [];
      },
    },
    devices: {
      default() {
        return [];
      },
    },
    areas: {
      default() {
        return [];
      },
    },
    needRefresh: {
      type: Boolean,
      default: true,
    },
    addGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      default: "",
    },
    addDevice: {
      type: Boolean,
      default: false,
    },
    areaMode: {
      type: Boolean,
      default: false,
    },
  },

  mounted() {},

  created() {
    EventBus.$on("handleSwitchToDrawArea", this.handleSwitchToDrawArea);
    EventBus.$on(
      "handleSwitchToDrawPolygonArea",
      this.handleSwitchToDrawPolygonArea
    );
    EventBus.$on("getScenarios", this.getScenarios);
  },

  destroyed() {
    EventBus.$off("handleSwitchToDrawArea", this.handleSwitchToDrawArea);
    EventBus.$off("getScenarios", this.getScenarios);
  },

  watch: {
    file(val) {
      this.selectedFile = val;
    },
    areas(val) {
      this.areaData = val;
    },
    selectedGroups(val) {
      // console.log("Vao day ne: ", this.groups)
      let selectedIds = [];

      val.forEach((item) => {
        selectedIds.push(item.id);
      });

      // filter selectedIds and its childrens id
      selectedIds.forEach((selectedId) => {
        let parent = this.groups.find((item) => item.id === selectedId);
        if (parent) {
          selectedIds = selectedIds.concat(parent.childrens);
        }
      });

      // exclude filter groups
      this.parentGroups = this.groups.filter((group) => {
        return !selectedIds.includes(group.id);
      });
    },
    areaMode(val) {
      this.areaMode = val;
      if (!val) {
        this.handleCloseAddAreaPopup();
      } else {
        this.isAddToGroupOpen = false;
        this.isToggle = false;
      }
    },
  },

  data() {
    return {
      sidebarOpen: false,
      lightValue: 0,
      intensityValue: 0,
      xValue: 0,
      yValue: 0,
      scenes: [],
      group: null,
      loading: false,
      sidebarData: null,
      areaData: null,
      timerClick: 0,
      paramLightValue: null,
      paramIntensityValue: null,
      paramXValue: null,
      paramYValue: null,
      turnOnOff: false,
      selectedFile: null,
      isAddToGroupOpen: false,
      isLoading: false,
      selectedGroups: [],
      selectedDevices: [],
      selectedObjects: [],
      editName: false,
      clickType: "",
      isAddAreaOpen: false,
      addAreaMode: false,
      addPolygonAreaMode: false,
      selectedArea: null,
      // isAddDeviceOpen: false,
      // deviceMode: false,
      // addDeviceMode: false,
      isDuplicate: false,
      selectedNewDevice: null,
      enableMoveDevice: false,
      deletedAreaId: 0,
      deletedDeviceId: 0,
      isShowBackButton: false,
      deletedGroupId: 0,
      enableMoveGroup: false,
      enableMoveAllInGroup: false,
      errorUpdateDevice: "",
    };
  },

  computed: {
    isToggle: {
      get() {
        return store.popup;
      },
      set(newVal) {
        storeFunctions.setPopup(newVal);
      },
    },
    data() {
      if (store.selectedGroup) {
        this.selectedGroups = [];
        this.selectedDevices = [];
        this.selectedGroups.push(store.selectedGroup);
        this.selectedDevices.push(store.selectedGroup);
      }
      return store.selectedGroup;
    },
    token: {
      get() {
        return this.$root.$children[0].token || "";
      },
      set(value) {
        this.$root.$children[0].token = value;
      },
    },
    allPopupClosed() {
      return (
        !this.isToggle &&
        !this.isAddToGroupOpen &&
        !this.isAddAreaOpen &&
        !this.addDevice
      );
    },
  },

  methods: {
    handleCloseSidebar() {
      EventBus.$emit("resetActions");
    },
    handlePopupLayoutRight() {
      // this.$parent.addArea = false;
      // this.$parent.addDevice = false;
      this.$parent.addGroup = false;
    },
    handlePopupLayoutLeft() {
      // this.$root.$children[0].popup = false;
      storeFunctions.setPopup(false);
    },

    handleDuplicateObject(val, needRefresh = true) {
      // Duplicate object
      axios.defaults.headers.common["Authorization"] = this.token;
      axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
      axios
        .post(`${API_DOMAIN_MANIFERA}/api/v1/files/duplicate_object`, val)
        .then((response) => {
          const data = response.data;
          
          if(needRefresh) {
            EventBus.$emit("getGroups");
            EventBus.$emit("getDevices")
          }
        })
        .catch((error) => {
          console.log(error)
        }).then(() => {
          this.isDuplicating = false;
        })
    },

    handleIconSingleClick(type, devices, groups, activeGroup) {
      // console.log(
      //   "handleIconSingleClick ~ type, devices, groups",
      //   type,
      //   devices,
      //   groups
      // );
      this.handlePopupLayoutLeft();
      this.handlePopupLayoutRight();
      storeFunctions.setSelectedGroup(null);
      if (type === "single") {
        if (devices) {
          if (devices.type === "Group") {
            storeFunctions.setSelectedGroup(devices);
            if (this.addDevice) {
              this.$parent.addDevice = false;
              return;
            }
            this.selectedGroups = [devices];
            this.selectedDevices = [devices];
            this.clickType = "single";
            this.isAddToGroupOpen = true;
            this.isAddAreaOpen = false;
            // EventBus.$emit("updateSelectedGroup", this.selectedGroups, this.selectedFile);
          } else if (devices.type === "area" || devices.type === "polygon-area") {
            this.selectedArea = devices;
            this.isAddAreaOpen = true;
            // EventBus.$emit("updateSelectedGroup", activeGroup ? [activeGroup] : [], this.selectedFile);
          } else if (devices.type === "fixture" || devices.type === "sensor") {
            if (this.addDevice) {
              this.selectedNewDevice = devices;
              // this.isAddDeviceOpen = true;
              this.isAddToGroupOpen = false;
              this.isAddAreaOpen = false;
            } else {
              this.selectedDevices = [devices];
              this.selectedGroups = [];
              this.clickType = "single";
              this.isAddToGroupOpen = true;
              this.isAddAreaOpen = false;
            }
            // EventBus.$emit("updateSelectedGroup", activeGroup ? [activeGroup] : [], this.selectedFile);
          }else if(devices.length > 0){
            storeFunctions.setSelectedObjects(devices);
            
            this.selectedObjects = devices;
            this.clickType = "single";
            this.isAddToGroupOpen = true;
            this.isAddAreaOpen = false;
          }
          // else if (
          //   (devices.type === "fixture" || devices.type === "sensor") &&
          //   devices.hasOwnProperty("is_new")
          // ) {
          //   this.selectedNewDevice = devices;
          //   this.isAddToGroupOpen = false;
          //   this.isAddAreaOpen = false;
          // }
        } else {
          if (!this.addDevice) {
            this.clickType = "empty";
            this.selectedDevices = [];
            this.selectedGroups = [];
            this.selectedArea = null;
            this.selectedNewDevice = null;
            this.isAddToGroupOpen = false;
            // this.isAddDeviceOpen = false;
            this.isAddAreaOpen = false;
            this.addAreaMode = false;
            this.addPolygonAreaMode = false;
            this.enableMoveDevice = false;
            this.enableMoveGroup = false;
            this.enableMoveAllInGroup = false;
            // this.isToggle = false;
            // EventBus.$emit("updateSelectedGroup", activeGroup ? [activeGroup] : [], this.selectedFile);
          }
        }
      } else if (type === "multi") {
        this.selectedDevices = devices;
        this.selectedGroups = groups;
        this.clickType = "multi";
        this.enableMoveDevice = false;
        this.enableMoveGroup = false;
        this.enableMoveAllInGroup = false;
        this.isAddToGroupOpen = true;
        // this.groupMode = false;
        // this.deviceMode = false;
        // EventBus.$emit("updateSelectedGroup", this.selectedGroups, this.selectedFile);
      }
      // if (v && v.type === "Group") {
      //   this.data = v;
      //   this.isToggle = true;
      // }
    },

    handleUpdateGroup(v, needRefresh = true) {
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      const params = {
        name: v.name,
        x: v.x,
        y: v.y,
      };

      axios
        .put(`${API_DOMAIN_MANIFERA}/api/v1/groups/${v.id}`, params)
        .then((response) => {
          const data = response.data;
          this.clickType = "single";
          this.selectedDevices = [data];
          this.enableMoveGroup = false;
          // this.$parent.getGroups();
          // this.$parent.getDevices(false);
          if (needRefresh) {
            EventBus.$emit("getGroups");
            EventBus.$emit("getDevices", false);
          }
          this.isAddToGroupOpen = false;
          this.isToggle = false;
        })
        .catch((error) => {
          // handle error
          console.log(error);
        })
        .then();
    },

    handleUpdateObjects(v, needRefresh = true) {
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      let params = [];
      if(v.length > 0){
        v.map((item) => {
          params.push({
            id: item.id,
            x: `${item.x}`,
            y: `${item.y}`,
            type: item.type
          })
        })
      }
      this.isLoading = true;
      axios
        .put(`${API_DOMAIN_MANIFERA}/api/v1/groups/move_group_content`, params)
        .then((response) => {
          const data = response.data;
          this.clickType = "single";
          this.enableMoveAllInGroup = false;
          if (needRefresh) {
            EventBus.$emit("getGroups");
            EventBus.$emit("getDevices", false);
          }
          this.isAddToGroupOpen = false;
          this.isLoading = false;
          this.isToggle = false;
        })
        .catch((error) => {
          // handle error
          console.log(error);
        })
        .then();
    },

    handleUpdateDevice(v, needRefresh = true) {
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      const params = {
        block_name: v.name,
        x: v.x,
        y: v.y,
        channels: v.channel ? [v.channel] : [],
        old_parent_id: "",
        selected_cells: [],
        serial_number: v.serialNumber,
        type: v.type,
        mac_address: v.mac_address,
        angle: v.angle,
        ceil_height: v.ceilHeight,
        rotation: v.rotation,
      };

      this.errorUpdateDevice = "";
      axios
        .put(`${API_DOMAIN_MANIFERA}/api/v1/devices/${v.id}`, params)
        .then((response) => {
          const data = response.data;
          this.clickType = "single";
          this.selectedDevices = [data];
          this.enableMoveDevice = false;
          this.isAddToGroupOpen = false;
          // this.$parent.getGroups();
          // this.$parent.getDevices(false);
          if (needRefresh) {
            EventBus.$emit("getDevices", false);
            EventBus.$emit("getGroups");
          }
        })
        .catch((error) => {
          // handle error
          if (error.response.status == 422) {
            this.errorUpdateDevice = error.response.data.detail;
          }
        })
        .then();
    },

    handleDeleteDevice(v) {
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      axios
        .delete(`${API_DOMAIN_MANIFERA}/api/v1/devices/${v}`)
        .then(() => {
          this.clickType = "empty";
          this.selectedDevices = [];
          this.isAddToGroupOpen = false;
          this.deletedDeviceId = v;
          // this.$parent.getGroups();
          // this.$parent.getDevices(false);
          EventBus.$emit("getDevices", false);
          EventBus.$emit("getGroups");
        })
        .catch((error) => {
          // handle error
          console.log(error);
        })
        .then();
    },

    handleCreateArea(v) {
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      const params = {
        file_id: this.selectedFile.id,
        name: v.name,
        x: v.x,
        y: v.y,
        width: v.width,
        height: v.height,
        positions: v.positions,
      };

      axios
        .post(`${API_DOMAIN_MANIFERA}/api/v1/floor_areas/`, params)
        .then((response) => {
          const data = response.data;
          this.selectedArea = null;
          EventBus.$emit("getGroups");
          EventBus.$emit("getDevices", false);
          EventBus.$emit("getAreas", false);
          this.handleCloseAddAreaPopup();
        })
        .catch((error) => {
          console.log(error);
        })
        .then();
    },

    handleUpdateArea(v) {
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      const params = {
        id: v.id,
        file_id: this.selectedFile.id,
        name: v.name,
        x: v.x,
        y: v.y,
        width: v.width,
        height: v.height,
        positions: v.positions,
      };

      axios
        .put(`${API_DOMAIN_MANIFERA}/api/v1/floor_areas/${v.id}`, params)
        .then((response) => {
          const data = response.data;
          this.selectedArea = data;
          // this.$parent.getGroups();
          // this.$parent.getDevices(false);
          // this.$parent.getAreas();
          EventBus.$emit("getGroups");
          EventBus.$emit("getDevices", false);
          EventBus.$emit("getAreas", false);
          this.handleCloseAddAreaPopup();
        })
        .catch((error) => {
          console.log(error);
        })
        .then();
    },

    handleDeleteArea(v) {
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      axios
        .delete(`${API_DOMAIN_MANIFERA}/api/v1/floor_areas/${v}`)
        .then(() => {
          this.deletedAreaId = v;
          this.isAddAreaOpen = false;
          // this.$parent.getGroups();
          // this.$parent.getDevices(false);
          // this.$parent.getAreas();
          EventBus.$emit("getGroups");
          EventBus.$emit("getDevices", false);
          EventBus.$emit("getAreas", false);
        })
        .catch((error) => {
          // handle error
          console.log(error);
        })
        .then();
    },

    handleAddGroup() {
      axios.defaults.headers.common["Authorization"] = this.token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      axios
        .post(`${API_DOMAIN_MANIFERA}/api/v1/groups/`, {
          name: this.groupName,
          file_id: this.selectedFile.id,
          building_id: this.selectedFile.building_id,
          project_id: this.selectedFile.project_id,
        })
        .then((response) => {
          // this.$parent.getGroups();
          EventBus.$emit("getGroups");
        })
        .catch((error) => {})
        .then((a) => {});
    },

    handleCloseAddToGroupPopup() {
      this.errorUpdateDevice = "";
      this.isAddToGroupOpen = false;
      this.enableMoveGroup = false;
      // this.$root.$children[0].popup = false;
      storeFunctions.setPopup(false);
    },

    handleCloseAddGroup() {
      this.$parent.addGroup = false;
    },

    handleCloseAddAreaPopup() {
      this.isAddAreaOpen = false;
      this.addAreaMode = false;
      this.addPolygonAreaMode = false;
    },

    handleCloseAddDevicePopup() {
      // this.isAddDeviceOpen = false;
      // this.deviceMode = false;
      // this.addDeviceMode = false;
      this.errorUpdateDevice = "";
      this.enableMoveDevice = false;
      this.$parent.addDevice = false;
      // this.$parent.addDevice = false;
    },

    handleDeleteGroup(group) {
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      axios
        .delete(`${API_DOMAIN_MANIFERA}/api/v1/groups/${group.id}`)
        .then(() => {
          this.selectedDevices = [];
          this.selectedGroups = [];
          this.selectedArea = null;
          this.selectedNewDevice = null;
          this.isAddToGroupOpen = false;
          this.clickType = "empty";
          this.deletedGroupId = group.id;
          // this.$root.$children[0].data = {};
          storeFunctions.setSelectedGroup(null);
          // this.$root.$children[0].popup = false;
          storeFunctions.setPopup(false);
          this.sidebarData = {};
          // this.$parent.getGroups();
          EventBus.$emit("getDevices", false);
          EventBus.$emit("getGroups");
        })
        .catch((error) => {
          // handle error
          console.log(error);
        });
    },

    async handleAddToGroup(parentGroup, groups, devices) {
      axios.defaults.headers.common["Authorization"] = this.token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      let oldParentGroups = [];
      let oldParentDevices = [];

      let group_ids = [];
      let device_ids = [];
      groups.forEach((group) => {
        if (
          group.hasOwnProperty("parent_id") &&
          group.parent_id &&
          !oldParentGroups.includes(group.parent_id)
        ) {
          oldParentGroups.push(group.parent_id);
        }
        if (group.id) {
          group_ids.push(group.id);
        }
      });
      devices.forEach((device) => {
        this.groups.forEach((group) => {
          if (group.device_ids.includes(device.id)) {
            device.parent_id = group.id;
          }
        });
      });

      devices.forEach((device) => {
        if (
          device.hasOwnProperty("parent_id") &&
          device.parent_id &&
          !oldParentDevices.includes(device.parent_id)
        ) {
          oldParentDevices.push(device.parent_id);
        }
        if (device.id) {
          device_ids.push(device.id);
        }
      });

      let needRefresh = false;
      if (parseInt(parentGroup)) {
        // group entities
        await axios
          .post(`${API_DOMAIN_MANIFERA}/api/v1/groups/${parentGroup}`, {
            group_ids: group_ids,
            device_ids: device_ids,
          })
          .then((response) => {
            this.handleCloseAddToGroupPopup();
          })
          .catch((error) => {});
        needRefresh = true;
      }

      // if move/update entities
      if (oldParentDevices.length > 0 || oldParentGroups.length > 0) {
        let deviceParams = {
          data: {
            device_ids: device_ids,
          },
        };
        let groupParams = {
          data: {
            group_ids: group_ids,
          },
        };

        for (let i = 0; i < oldParentDevices.length; i++) {
          await axios
            .delete(
              `${API_DOMAIN_MANIFERA}/api/v1/groups/${oldParentDevices[i]}/entities`,
              deviceParams
            )
            .then((response) => {})
            .catch((error) => {});
        }

        for (let i = 0; i < oldParentGroups.length; i++) {
          await axios
            .delete(
              `${API_DOMAIN_MANIFERA}/api/v1/groups/${oldParentGroups[i]}/entities`,
              groupParams
            )
            .then((response) => {})
            .catch((error) => {});
        }
        needRefresh = true;
      }
      if (needRefresh) {
        this.handleCloseAddToGroupPopup();
        // this.$parent.getGroups();
        // this.$parent.getDevices(false);
        EventBus.$emit("getGroups");
        EventBus.$emit("getDevices", false);
      }
    },

    handleCreateDevice(v) {
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      const params = {
        block_name: v.name,
        x: v.x,
        y: v.y,
        width: 0,
        height: 0,
        serial_number: v.serial_number,
        channels: v.channel && v.channel.length ? [v.channel] : [],
        type: v.type,
        status: false,
        mac_address: null,
        selected_cells: [],
        ceil_height: 0,
        angle: 0,
        rotation: 0,
        file_id: this.selectedFile.id,
        layer:
          v.type === "fixture"
            ? this.selectedFile.fixture_layer_name
            : this.selectedFile.sensor_layer_name,
      };

      axios
        .post(`${API_DOMAIN_MANIFERA}/api/v1/devices/`, params)
        .then((response) => {
          const data = response.data;
          // this.$parent.getGroups();
          // this.$parent.getDevices(false);
          this.$parent.addDevice = false;
          EventBus.$emit("getGroups");
          EventBus.$emit("getDevices", false);
        })
        .catch((error) => {
          console.log(error);
        })
        .then();
    },

    handleSwitchToDrawArea() {
      this.isAddAreaOpen = true;
      this.selectedArea = null;
      this.addAreaMode = true;
      this.addPolygonAreaMode = false;
      EventBus.$emit("onSwitchToDrawArea");
    },

    handleSwitchToDrawPolygonArea() {
      this.isAddAreaOpen = true;
      this.selectedArea = null;
      this.addAreaMode = false;
      this.addPolygonAreaMode = true;
      EventBus.$emit("onSwitchToDrawPolygonArea");
    },

    // handleEnableCreateDevice() {
    // this.addDeviceMode = true;
    // },

    handleEnableMoveDevice(v) {
      this.enableMoveDevice = v;
      this.enableMoveGroup = !v;
      this.enableMoveAllInGroup = !v;
    },

    handleEnableMoveGroup(v) {
      if(v){
        this.enableMoveAllInGroup = !v;
        this.enableMoveGroup = v;
        this.enableMoveDevice = !v;
        
      }else{
        this.enableMoveGroup = v;
        this.enableMoveDevice = !v;
        this.enableMoveAllInGroup = !v;
      }
    },

    handleEnableMoveAllInGroup(v){
      if(v){
        this.enableMoveAllInGroup = v;
        this.enableMoveDevice = !v;
        this.enableMoveGroup = !v;
      }else{
        this.enableMoveAllInGroup = v;
        this.enableMoveDevice = false;
        this.enableMoveGroup = false;
      }
      
    },

    handleIconDoubleClick(v) {
      this.emitSelectGroups(v);
    },

    handleFloorplanBackButton(v) {
      this.isAddToGroupOpen = false;
      this.isToggle = false;
      this.emitSelectGroups(v);
    },

    emitSelectGroups(v) {
      let selectGroups = [];
      if (v) {
        selectGroups.push(v);
      }
      EventBus.$emit("updateSelectedGroup", selectGroups, this.selectedFile);
    },

    handleVisibleGroups(v) {},

    clickEditName() {
      this.editName = true;
    },

    getScenarios(group) {
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      axios
        .get(`${API_DOMAIN_MANIFERA}/api/v1/scenes?group_id=${group.id}`)
        .then((response) => {
          const data = response.data;
          this.scenes = data;
        })
        .catch((error) => {
          // handle error
          console.log(error);
        })
        .then(function (a) {});
    },
  },
};
</script>
