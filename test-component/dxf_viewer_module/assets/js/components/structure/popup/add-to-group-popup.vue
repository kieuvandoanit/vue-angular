<template>
  <div class="">
    <Popup
      :sidebarElementId="'add-to-group-popup'"
      :sidebarOpen="isOpen && isSelecting"
      :hasBackButton="isShowBackButton"
      @handleCloseSidebar="handleCloseSidebar"
      @handleBackSidebar="handleBackSidebar"
    >
      <div v-if="clickType === 'single'">
        <div
          v-if="!lightControl"
          class="content-item d-flex justify-content-between"
        >
          <div class="title-name">
            <p>
              Edit
              {{
                devices && devices.length > 0
                  ? devices[0].type === "Group"
                    ? "Group"
                    : "Device"
                  : "Group"
              }}
            </p>
          </div>
          <button
            v-if="devices[0].type === 'Group' && devices[0].controllable"
            class="btn"
            @click="onEnableLightControl"
            style="background-color: #f97316"
          >
            Light Control
          </button>
        </div>

        <div
          v-if="!lightControl"
          class="content-item d-flex justify-content-between pt-0"
        >
          <div class="title-name">
            <button
              :class="{ btn: 1, disabled: isDuplicating }"
              style="background-color: hwb(208deg 0% 9%)"
              @click="onEnableDuplicate"
            >
              Duplicate
              {{
                devices && devices.length > 0
                  ? devices[0].type === "Group"
                    ? "Group"
                    : "Device"
                  : "Group"
              }}

              <div
                class="spinner-border"
                role="status"
                style="font-size: 10px; width: 15px; height: 15px"
                v-if="this.isDuplicating"
              >
                <span class="sr-only">Loading...</span>
              </div>
            </button>
          </div>
        </div>

        <div v-if="!lightControl">
          <!-- Start checkbox move object section -->
          <div
            class="align-items-center pb-2"
            v-if="devices && devices[0].type === 'Group'"
          >
            <div
              class="align-items-center"
              v-if="devices && devices[0].type === 'Group'"
            >
              <input
                id="move-group"
                type="checkbox"
                style="cursor: pointer"
                v-model="moveGroup"
                @click="() => !moveGroup"
              />
              <label for="move-group" class="m-0 ps-1" style="cursor: pointer"
                >Move Group</label
              >

              <div class="align-items-center pb-2 ml-4" v-if="this.moveGroup">
                <input
                  type="radio"
                  name="moveGroup"
                  id="moveOnlyGroup"
                  style="cursor: pointer"
                  v-model="isMoveGroup"
                  @click="onEnableMoveGroup"
                />
                <label for="moveOnlyGroup" class="m-1 ps-1"
                  >Move Only Group</label
                >
                <br />
                <input
                  type="radio"
                  name="moveGroup"
                  id="moveAllInGroup"
                  style="cursor: pointer"
                  v-model="isMoveAllInGroup"
                  @click="onEnableMoveAllInGroup"
                />
                <label for="moveAllInGroup" class="m-1 ps-1"
                  >Move All In Group</label
                >
              </div>
            </div>
          </div>

          <div v-else class="d-flex align-items-center pb-2">
            <input
              id="move-device"
              type="checkbox"
              style="cursor: pointer"
              v-model="isMoveDevice"
              @click="onEnableMoveDevice"
            />
            <label for="move-device" class="m-0 ps-1" style="cursor: pointer"
              >Move Device</label
            >
          </div>
          <!-- End checkbox move object section -->

          <!-- Start checkbox advance view section -->
          <div class="d-flex align-items-center pb-2">
            <input
              id="advanced-view"
              type="checkbox"
              style="cursor: pointer"
              v-model="isAdvancedView"
              @click="onEnableAdvancedView"
            />
            <label for="advanced-view" class="m-0 ps-1" style="cursor: pointer"
              >Advanced View</label
            >
          </div>
          <!-- End checkbox advance view section -->

          <!-- Start group section -->
          <div v-if="devices && devices[0].type === 'Group'">
            <div v-if="isAdvancedView">
              <p class="m-0">ID</p>
              <input readonly class="mb-2 w-100" v-model="groupIdValue" />
            </div>

            <p class="m-0">Name</p>
            <input
              class="mb-2 w-100"
              v-model="groupNameValue"
              @change="onChangeGroupName"
            />

            <template v-if="isMoveGroup">
              <p class="m-0">X</p>
              <input
                class="mb-2 w-100"
                type="number"
                readonly
                v-model="groupXValue"
                @change="onChangeGroupX"
              />

              <p class="m-0">Y</p>
              <input
                class="mb-2 w-100"
                type="number"
                readonly
                v-model="groupYValue"
                @change="onChangeGroupY"
              />
            </template>
            <div class="content-item">
              <p class="m-0">Select a parent group</p>
            </div>

            <select v-model="groupId" class="form-select form-select-lg mb-3">
              <option value="0">-- No parent --</option>
              <option
                v-for="group in parentGroups"
                :key="group.id"
                :value="group.id"
              >
                {{ group.name }}
              </option>
            </select>

            <div class="d-flex justify-content-between" v-if="!this.isLoading">
              <button
                class="btn btn-danger my-3"
                @click="
                  showDeleteGroupModal = true;
                  group = devices[0];
                "
              >
                <span>Delete</span>
              </button>
              <button class="btn btn-primary my-3" @click="onUpdateGroup">
                <span>Save</span>
              </button>
            </div>
            <div class="d-flex justify-content-center" v-if="this.isLoading">
              <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>
          </div>
          <!-- End group section -->

          <!-- Start device section -->
          <div v-else>
            <div v-if="isAdvancedView">
              <p class="m-0">ID</p>
              <input readonly class="mb-2 w-100" v-model="deviceIdValue" />
            </div>

            <p class="m-0">Name</p>
            <input
              class="mb-2 w-100"
              v-model="deviceNameValue"
              @change="onChangeDeviceName"
            />

            <div v-if="isMoveDevice">
              <div>
                <p class="m-0">X</p>
                <input
                  class="mb-2 w-100"
                  type="number"
                  v-model="deviceXValue"
                  @change="onChangeDeviceX"
                />
              </div>

              <div>
                <p class="m-0">Y</p>
                <input
                  class="mb-2 w-100"
                  type="number"
                  v-model="deviceYValue"
                  @change="onChangeDeviceY"
                />
              </div>
            </div>

            <div v-else>
              <p class="m-0">Serial number</p>
              <input
                class="mb-2 w-100"
                v-model="deviceSerialNumberValue"
                @change="onChangeDeviceSN"
              />

              <p class="m-0">Channels</p>
              <select
                v-model="deviceChannelValue"
                class="form-select form-select-lg mb-2"
                @change="onChangeDeviceChannel"
              >
                <option value="" disabled>-- Select channels --</option>
                <option
                  v-for="channel in listChannels"
                  :key="channel"
                  :value="channel"
                >
                  {{ channel }}
                </option>
              </select>

              <p class="m-0">Types</p>
              <select
                v-model="deviceTypeValue"
                class="form-select form-select-lg mb-2"
                @change="onChangeDeviceType"
              >
                <option value="" disabled>-- Select device type --</option>
                <option
                  v-for="dType in deviceTypes"
                  :key="dType"
                  :value="dType"
                >
                  {{ dType }}
                </option>
              </select>

              <div v-if="deviceTypeValue === 'sensor'">
                <p class="m-0">Ceil height</p>
                <input
                  class="mb-2 w-100"
                  v-model="deviceCeilHeightValue"
                  @change="onChangeDeviceCeilHeight"
                />

                <p class="m-0">Angle</p>
                <input
                  class="mb-2 w-100"
                  v-model="deviceAngleValue"
                  @change="onChangeDeviceAngle"
                />

                <p class="m-0">Rotation</p>
                <input
                  class="mb-2 w-100"
                  v-model="deviceRotationValue"
                  @change="onChangeDeviceRotation"
                />
              </div>

              <div class="content-item">
                <p class="m-0">Select a parent group</p>
              </div>

              <select v-model="groupId" class="form-select form-select-lg mb-3">
                <option value="0">-- No parent --</option>
                <option
                  v-for="group in parentGroups"
                  :key="group.id"
                  :value="group.id"
                >
                  {{ group.name }}
                </option>
              </select>
            </div>

            <div class="d-flex justify-content-between">
              <button
                class="btn btn-danger my-3"
                @click="
                  showDeleteDeviceModal = true;
                  device = devices[0];
                "
              >
                <span>Delete</span>
              </button>

              <button class="btn btn-primary my-3" @click="onUpdateDevice">
                <span>Save</span>
              </button>
            </div>
          </div>
          <!-- End device section -->
        </div>

        <div v-if="lightControl">
          <DetailGroup
            :data="groupData"
            :scenes="scenes"
            :selectedScene="selectedScene"
            :lightControl="lightControl"
            :token="token"
            :isShowBackButton="isShowBackButton"
            @handleBackSidebar="handleBackSidebar"
          >
          </DetailGroup>
        </div>
      </div>
      <div v-else-if="clickType === 'multi'">
        <div class="content-item">
          <div class="title-name">
            <p>Add to group</p>
          </div>
        </div>
        <div
          class="content-item"
          style="border-top: 1px solid gray; bottom: 0; display: block"
        >
          <div class="content-item">
            <p class="m-0">Select a parent group</p>
          </div>

          <select v-model="groupId" class="form-select form-select-lg mb-3">
            <option value="0">-- No parent --</option>
            <option
              v-for="group in parentGroups"
              :key="group.id"
              :value="group.id"
            >
              {{ group.name }}
            </option>
          </select>

          <button
            class="btn btn-primary"
            style="float: right"
            @click="handleAddToGroup"
          >
            <span>Save</span>
          </button>
        </div>
      </div>
    </Popup>

    <Modal
      :show="showDeleteDeviceModal"
      header="Remove Device"
      :body="`Are you sure you want to remove device <b>${
        this.device ? this.device.block_name : ''
      }</b> ?`"
      :loading="loading"
      :error="errorMessage"
      @no="showDeleteDeviceModal = false"
      @yes="onDeleteDevice"
    >
    </Modal>

    <Modal
      :show="showDeleteGroupModal"
      header="Remove Group"
      :body="`Are you sure you want to remove group <b>${
        this.group ? this.group.name : ''
      }</b> ?`"
      :loading="loading"
      :error="errorMessage"
      @no="showDeleteGroupModal = false"
      @yes="onDeleteGroup"
    >
    </Modal>
  </div>
</template>

<script>
import axios from "axios";
import { EventBus, store, storeFunctions } from "../../../store.js";
import Modal from "./modal.vue";
import DetailGroup from "./detail-group.vue";
import Popup from "./right-popup.vue";

export default {
  components: {
    Popup,
    Modal,
    DetailGroup,
  },
  props: {
    isDuplicating: false,
    token: {
      type: String,
      default: "",
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
    devices: {
      type: Array,
      default: [],
    },
    groups: {
      type: Array,
      default: [],
    },
    parentGroups: {
      type: Array,
      default: [],
    },
    clickType: {
      type: String,
      default: "",
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },

  mounted() {},

  created() {},

  watch: {
    devices(val) {
      this.devices = val;
    },

    groups(val) {
      this.groupId = 0;
      this.groups = val;
    },

    parentGroups(val) {
      this.parentGroups = val;
    },

    selectedObject(val) {
      if (val.type === "single") {
        const object = val.selectedDevices[0];
        if (object.type === "Group") {
          this.selectedGroup = object;
          this.selectedDevice = {};
          this.groupIdValue = object.id;
          this.groupNameValue = object.name;
          this.groupId = object.parent_id ?? 0;
          this.groupXValue = object.x;
          this.groupYValue = object.y;
          this.duplicateObject = [{ id: this.groupIdValue, type: "group" }];
        } else {
          this.selectedDevice = object;
          this.selectedGroup = {};
          this.deviceIdValue = object.id;
          this.deviceNameValue = object.block_name;
          this.deviceXValue = object.x;
          this.deviceYValue = object.y;
          this.deviceSerialNumberValue = object.serial_number;
          this.deviceChannelValue = object.channels ? object.channels[0] : null;
          this.deviceTypeValue = object.type;
          this.deviceCeilHeightValue = object.ceil_height;
          this.deviceAngleValue = object.angle;
          this.deviceRotationValue = object.rotation;
          this.groupId =
            object.groups && object.groups.length > 0 ? object.groups[0].id : 0;
          this.duplicateObject = [{ id: this.deviceIdValue, type: "device" }];
        }
      } else if (val.type === "multi") {
        this.selectedDevice = {};
        this.selectedGroup = {};
      } else if (val.type === "empty") {
        this.isMoveDevice = false;
        // this.isMoveGroup = false;
        storeFunctions.setIsMoveGroup(false);
        storeFunctions.setIsMoveAllInGroup(false);
      }
    },
  },

  computed: {
    isSelecting() {
      return this.devices.length > 0 || this.groups.length > 0;
    },

    selectedObject() {
      return {
        type: this.clickType || "single",
        selectedDevices: this.devices,
        selectedGroups: this.groups,
      };
    },

    selectedScene() {
      return store.selectedScene;
    },

    groupData() {
      // // console.log("store group: ", store.selectedGroup);
      return store.selectedGroup;
    },
    isMoveGroup() {
      return store.isMoveGroup;
    },
    isMoveAllInGroup() {
      return store.isMoveAllInGroup;
    },
  },

  data() {
    return {
      listChannels: ["ch1", "ch2", "ch3", "fusion"],
      deviceTypes: ["fixture", "sensor"],
      groupId: null,
      groupIdValue: 0,
      groupNameValue: "",
      groupXValue: 0,
      groupYValue: 0,
      deviceIdValue: 0,
      deviceNameValue: "",
      deviceXValue: "",
      deviceYValue: "",
      deviceSerialNumberValue: 0,
      deviceChannelValue: "",
      deviceTypeValue: "",
      deviceCeilHeightValue: 0,
      deviceAngleValue: 0,
      deviceRotationValue: 0,
      isAdvancedView: false,

      selectedDevice: {},
      selectedGroup: {},
      showDeleteDeviceModal: false,
      showDeleteGroupModal: false,

      isMoveDevice: false,
      // isMoveGroup: false,
      duplicateObject: [],

      lightControl: false,
      isShowBackButton: false,
      scenes: [],
      needRefresh: false,

      moveGroup: false,
    };
  },

  methods: {
    handleCloseSidebar() {
      this.isMoveDevice = false;
      // this.isMoveGroup = false;
      storeFunctions.setIsMoveGroup(false);
      this.$emit("handleClosePopup", this.isOpen);
    },
    onEnableDuplicate(e) {
      this.isDuplicating = true;
      // this.needRefresh = true;
      this.$emit("handleDuplicateObject", this.duplicateObject);
    },

    handleAddToGroup() {
      this.needRefresh = true;
      if (Object.keys(this.selectedGroup).length) {
        if (this.groupId != this.selectedGroup.parent_id) {
          this.$emit(
            "handleAddToGroup",
            this.groupId,
            [this.selectedGroup],
            [this.selectedDevice]
          );
          if (this.groupId) {
            this.needRefresh = false;
          }
        }
      } else if (Object.keys(this.selectedDevice).length) {
        let parentDeviceId = this.selectedDevice.group_id || 0;
        if (this.groupId != parentDeviceId) {
          this.$emit(
            "handleAddToGroup",
            this.groupId,
            [this.selectedGroup],
            [this.selectedDevice]
          );
          this.needRefresh = false;
        }
      } else {
        this.$emit("handleAddToGroup", this.groupId, this.groups, this.devices);
        this.needRefresh = false;
      }
    },
    onChangeGroupName(e) {
      const { value } = e.target;
      this.groupNameValue = value;
    },
    onChangeGroupX(e) {
      const { value } = e.target;
      this.groupXValue = value;
    },
    onChangeGroupY(e) {
      const { value } = e.target;
      this.groupYValue = value;
    },
    onChangeDeviceName(e) {
      const { value } = e.target;
      this.deviceNameValue = value;
    },
    onChangeDeviceX(e) {
      const { value } = e.target;
      this.deviceXValue = value;
    },
    onChangeDeviceY(e) {
      const { value } = e.target;
      this.deviceYValue = value;
    },
    onChangeDeviceSN(e) {
      const { value } = e.target;
      this.deviceSerialNumberValue = value;
    },
    onChangeDeviceChannel(e) {
      const { value } = e.target;
      this.deviceChannelValue = value;
    },
    onChangeDeviceType(e) {
      const { value } = e.target;
      this.deviceTypeValue = value;
    },

    onChangeDeviceCeilHeight(e) {
      const { value } = e.target;
      this.deviceCeilHeightValue = value;
    },
    onChangeDeviceAngle(e) {
      const { value } = e.target;
      this.deviceAngleValue = value;
    },
    onChangeDeviceRotation(e) {
      const { value } = e.target;
      this.deviceRotationValue = value;
    },

    onUpdateGroup() {
      if (this.isMoveAllInGroup) {
        storeFunctions.setIsMoveAllInGroup(false);
        this.$emit("handleUpdateObjects", store.setSelectedObjects);
      } else if (this.isMoveGroup) {
        this.handleAddToGroup();
        storeFunctions.setIsMoveGroup(false);
        this.$emit(
          "handleUpdateGroup",
          {
            id: this.groupIdValue,
            name: this.groupNameValue,
            x: this.groupXValue,
            y: this.groupYValue,
          },
          this.needRefresh
        );
      }
    },
    onUpdateDevice() {
      this.handleAddToGroup();
      this.$emit(
        "handleUpdateDevice",
        {
          id: this.deviceIdValue,
          name: this.deviceNameValue,
          x: this.deviceXValue,
          y: this.deviceYValue,
          serialNumber: this.deviceSerialNumberValue,
          channel: this.deviceChannelValue,
          type: this.deviceTypeValue,
          ceilHeight: this.deviceCeilHeightValue,
          angle: this.deviceAngleValue,
          rotation: this.deviceRotationValue,
        },
        this.needRefresh
      );
    },

    onDeleteDevice() {
      this.$emit("handleDeleteDevice", this.deviceIdValue);
      this.showDeleteDeviceModal = false;
    },

    onDeleteGroup() {
      this.$emit("handleDeleteGroup", this.selectedGroup);
      this.showDeleteGroupModal = false;
    },

    onEnableMoveGroup(e) {
      const { checked } = e.target;
      // this.isMoveGroup = checked;
      storeFunctions.setIsMoveGroup(checked);
      this.$emit("handleEnableMoveGroup", checked);
    },

    onEnableMoveAllInGroup(e) {
      const { checked } = e.target;
      storeFunctions.setIsMoveAllInGroup(checked);
      this.$emit("handleEnableMoveAllInGroup", checked);
    },

    onEnableMoveDevice(e) {
      const { checked } = e.target;
      this.isMoveDevice = checked;
      this.isMoveGroup = !checked;
      this.$emit("handleEnableMoveDevice", checked);
    },

    onEnableAdvancedView() {},

    onEnableLightControl() {
      this.lightControl = true;
      this.isShowBackButton = true;
      EventBus.$emit("getScenesForGroup", this.groupData.id);
      this.scenes = []; // get state;
    },

    handleBackSidebar() {
      if (this.selectedScene) {
        // this.isShowBackButton = false;
        // if (this.selectedScene.id == this.data.scene_id) {
        //   this.handleToggle({ value: this.data.scene_id, checked: true });
        // }
        storeFunctions.setSelectedScene(null);
        // this.colorMode = this.data.color_type;
      } else if (this.lightControl) {
        this.lightControl = false;
        this.isShowBackButton = false;
      }
    },

    // getScenarios() {
    //   this.scenes = [];
    //   const token = this.token || "";
    //   axios.defaults.headers.common["Authorization"] = token;
    //   axios.defaults.headers.post["Content-Type"] =
    //     "application/x-www-form-urlencoded";
    //   axios
    //     .get(`${API_DOMAIN_MANIFERA}/api/v1/scenes?group_id=${this.groupData.id}`)
    //     .then((response) => {
    //       const data = response.data;
    //       this.scenes = data;
    //     })
    //     .catch((error) => {
    //       // handle error
    //       // console.log(error);
    //     })
    //     .then(function (a) { });
    // },
  },
};
</script>
