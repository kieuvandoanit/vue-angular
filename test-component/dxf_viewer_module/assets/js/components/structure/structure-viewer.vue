<template>
  <div>
    <div class="container-dxfviewer">
      <div
        style="width: 100%; height: 95vh; position: relative; display: block"
        id="dxfviewer-container"
        ref="structureViewer"
      >
        <div v-show="file" id="contain-progress">
          <div style="text-align: center" id="progress-viewer"></div>
          <div id="progress-viewer-bar">
            <div id="progress-bar"></div>
          </div>
        </div>
        <div style="position: absolute; top: 10px; left: 10px; z-index: 1">
          <button
            @click="goBack"
            id="viewer-back-button"
            ref="viewerBackButton"
            class="btn btn-info"
            style="visibility: hidden"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { store } from "../../store";
import { Viewer } from "../../Viewer";

export default {
  props: {
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

    isToggle: false,
    needRefresh: true,

    areaMode: false,
    addAreaMode: false,
    addPolygonAreaMode: false,

    enableMoveGroup: false,
    enableMoveAllInGroup: false,

    deviceMode: false,
    addDeviceMode: false,
    enableMoveDevice: false,

    deletedDeviceId: 0,
    deletedAreaId: 0,
    deletedGroupId: 0,
  },

  mounted() {},

  computed: {
    propDevices() {
      return [this.devices, this.needRefresh];
    },

    showFloorStack() {
      return store.isShowFloorStackSelector;
    },
  },

  watch: {
    file(val, oldVal) {
      if (!val || !val.download_url || (oldVal && val.id === oldVal.id)) {
        return;
      }

      this.destroyViewer();
      this.createViewer(this.groups, this.devices);

      // console.log("leng group: ", this.groups.length)
      // this.viewer.setStructureMode(true);
      this.goBack();
      setTimeout(() => {
        this.viewer?.setSelectedGroup(null);
      }, 1000);
    },

    groups(val) {
      console.log('changeGroup', val);
      this.viewer?.updateGroupsData(val);
    },

    devices(val) {
      console.log('changeDev', val);
      this.viewer?.updateDevicesData(val);
    },

    areas(val) {
      this.viewer?.updateAreasData(val);
    },

    propDevices(val) {
      this.viewer?.updateDevicesData(val[0], val[1]);
    },

    areaMode(val) {
      this.viewer?.setAreaMode(val);
      // this.viewer?.setPolygonAreaMode(val);
    },

    deviceMode(val) {
      this.viewer?.setDeviceMode(val);
    },

    addAreaMode(val) {
      this.viewer?.addAreaObj(val);
    },

    addPolygonAreaMode(val) {
      this.viewer?.addPolygonAreaObj(val);
    },

    addDeviceMode(val) {
      this.viewer?.addDeviceObj(val);
    },

    enableMoveGroup(val) {
      this.viewer?.setGroupMode(val);
      this.viewer?.setEnableMovingGroup(val);
    },

    enableMoveAllInGroup(val) {
      this.viewer?.setMoveAllInGroupMode(val);
      this.viewer?.setEnableMovingAllInGroup(val);
    },

    enableMoveDevice(val) {
      this.viewer?.setDeviceMode(val);
      this.viewer?.setEnableMovingDevice(val);
    },

    deletedDeviceId(val) {
      this.viewer?.setDeletedDeviceId(val);
    },

    deletedAreaId(val) {
      this.viewer?.setDeletedAreaId(val);
    },

    deletedGroupId(val) {
      this.viewer?.setDeletedGroupId(val);
    },

    isToggle(val) {
      if (val) {
        this.viewer?.reloadViewer();
      }
    },

    showFloorStack(val) {
      if (val) {
        this.file = null;
        this.viewer?.clearViewer();
      }
      this.isShowFloorStack = val;
    },
  },

  created() {
    this.$parent.$on("handleSelectGroup", (data) => {
      this.handleSelectGroup(data);
    });

    this.$parent.$on("handleSetHistory", (data) => {
      this.handleSetHistory(data);
    });
  },

  data() {
    return {
      viewer: null,
      isShowFloorStack: false,
    };
  },

  methods: {
    createViewer(groups, devices) {
      if (this.viewer) {
        console.log("return 2");
        return;
      }

      this.viewer = new Viewer(
        this.$refs["structureViewer"],
        null,
        groups,
        devices,
        [],
        this.file,
        [],
        "#212C40",
        true
      );

      this.viewer.onClick = (e, selectedDevices, selectedGroups) => {
        this.$emit(
          "handleSingleClick",
          e,
          selectedDevices,
          selectedGroups,
          this.viewer.activeGroup
        );
      };
      this.viewer.dblClickCallback = (v) => {
        this.$emit("handleDoubleClick", v.activeGroup);
        this.$emit("visibleGroups", this.viewer.visibleGroups);
        if (v.activeGroup != null) {
          this.$refs.viewerBackButton.style.visibility = "visible";
        }
      };
      // this.viewer.viewerObjects = (objects) => {
      // console.log("viewerObjects", objects);
      // };
      this.viewer.Load(this.file.download_url);
    },

    handleDuplicateDevice: function () {},

    goBack() {
      this.viewer.onBack();
      this.$emit("handleFloorplanBackButton", this.viewer.activeGroup);
      this.$emit("visibleGroups", this.viewer.visibleGroups);
      if (this.viewer.activeGroup == null) {
        this.$refs.viewerBackButton.style.visibility = "hidden";
      }
    },

    destroyViewer() {
      if (!this.viewer) {
        return;
      }
      this.viewer = null;
      console.log("destroy in structure -viewer")
    },

    handleSelectGroup(group) {
      this.viewer?.setSelectedGroup(group);
      if (group != null) {
        this.$refs.viewerBackButton.style.visibility = "visible";
      }
    },

    handleSetHistory(history) {
      this.viewer?.setHistory(history);
    },
  },
};
</script>
