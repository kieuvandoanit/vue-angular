<template>
  <div class="">
    <Popup
      :sidebarElementId="'add-device-popup'"
      :sidebarOpen="isOpen"
      @handleCloseSidebar="handleCloseSidebar"
    >
      <div>
        <!-- <div v-if="!device && !createDeviceMode">
          <div class="content-item">
            <div class="title-name">
              <p>Device Mode</p>
            </div>
          </div>

          <div>
            <button class="btn btn-primary" @click="onEnableCreateDevice">
              <span>Create device</span>
            </button>
          </div>
        </div> -->

        <div v-if="!device && createDeviceMode">
          <div class="content-item">
            <div class="title-name">
              <p>Create Device</p>
            </div>
          </div>

          <div class="align-items-center pb-2">
            <input
              id="move-object2"
              type="checkbox"
              style="cursor: pointer"
              v-model="isMoveDevice"
              @click="onEnableMoveDevice"
            />
            <label for="move-object2" class="m-0 ps-1" style="cursor: pointer"
              >Move device</label
            >
          </div>

          <p class="m-0">Name</p>
          <input
            class="mb-2 w-100"
            v-model="deviceNameValue"
            @change="onChangeDeviceName"
          />

          <p class="m-0">X</p>
          <input
            class="mb-2 w-100"
            type="number"
            v-model="deviceXValue"
            @change="onChangeDeviceX"
          />

          <p class="m-0">Y</p>
          <input
            class="mb-2 w-100"
            type="number"
            v-model="deviceYValue"
            @change="onChangeDeviceY"
          />

          <p class="m-0">Serial Number</p>
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

          <p class="m-0">Type</p>
          <select
            v-model="deviceTypeValue"
            class="form-select form-select-lg mb-2"
            @change="onChangeDeviceType"
          >
            <option value="" disabled>-- Select device type --</option>
            <option v-for="dType in deviceTypes" :key="dType" :value="dType">
              {{ dType }}
            </option>
          </select>

          <div v-if="deviceTypeValue === 'sensor'">
            <p class="m-0">Angle</p>
            <input class="mb-2 w-100" type="number" />

            <p class="m-0">Rotation</p>
            <input class="mb-2 w-100" type="number" />

            <p class="m-0">Ceil Height</p>
            <input class="mb-2 w-100" />
          </div>

          <button
            class="btn btn-primary"
            style="float: right"
            @click="onCreateDevice"
          >
            <span>Create</span>
          </button>
        </div>

        <!-- Edit device -->
        <div v-else-if="device && !device.hasOwnProperty('is_new')">
          <div class="content-item">
            <div class="title-name">
              <p>Edit Device</p>
            </div>
          </div>

          <div class="align-items-center pb-2">
            <input
              id="move-object2"
              type="checkbox"
              style="cursor: pointer"
              v-model="isMoveDevice"
              @click="onEnableMoveDevice"
            />
            <label for="move-object2" class="m-0 ps-1" style="cursor: pointer"
              >Move device</label
            >
          </div>

          <p class="m-0">Name</p>
          <input
            class="mb-2 w-100"
            v-model="deviceNameValue"
            @change="onChangeDeviceName"
          />

          <p class="m-0">X</p>
          <input
            class="mb-2 w-100"
            type="number"
            v-model="deviceXValue"
            @change="onChangeDeviceX"
          />

          <p class="m-0">Y</p>
          <input
            class="mb-2 w-100"
            type="number"
            v-model="deviceYValue"
            @change="onChangeDeviceY"
          />

          <p class="m-0">Serial Number</p>
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

          <p class="m-0">Type</p>
          <select
            v-model="deviceTypeValue"
            class="form-select form-select-lg mb-2"
            @change="onChangeDeviceType"
          >
            <option value="" disabled>-- Select device type --</option>
            <option v-for="dType in deviceTypes" :key="dType" :value="dType">
              {{ dType }}
            </option>
          </select>
          <div v-if="deviceTypeValue === 'sensor'">
            <p class="m-0">Angle</p>
            <input class="mb-2 w-100" type="number" />

            <p class="m-0">Rotation</p>
            <input class="mb-2 w-100" type="number" />

            <p class="m-0">Ceil Height</p>
            <input class="mb-2 w-100" />
          </div>
          <p class="text-danger">{{ errorUpdateDeviceMessage }}</p>
          <button
            class="btn btn-primary"
            style="float: right"
            @click="onUpdateDevice"
          >
            <span>Update</span>
          </button>
        </div>

        <div v-else-if="device && device.hasOwnProperty('is_new')">
          <div class="content-item">
            <div class="title-name">
              <p>Create Device</p>
            </div>
          </div>

          <div class="align-items-center pb-2">
            <input
              id="move-object2"
              type="checkbox"
              style="cursor: pointer"
              v-model="isMoveDevice"
              @click="onEnableMoveDevice"
            />
            <label for="move-object2" class="m-0 ps-1" style="cursor: pointer"
              >Move device</label
            >
          </div>

          <p class="m-0">Name</p>
          <input
            class="mb-2 w-100"
            v-model="deviceNameValue"
            @change="onChangeDeviceName"
          />

          <p class="m-0">X</p>
          <input
            class="mb-2 w-100"
            type="number"
            v-model="deviceXValue"
            @change="onChangeDeviceX"
          />

          <p class="m-0">Y</p>
          <input
            class="mb-2 w-100"
            type="number"
            v-model="deviceYValue"
            @change="onChangeDeviceY"
          />

          <p class="m-0">Serial Number</p>
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

          <p class="m-0">Type</p>
          <select
            v-model="deviceTypeValue"
            class="form-select form-select-lg mb-2"
            @change="onChangeDeviceType"
          >
            <option value="" disabled>-- Select device type --</option>
            <option v-for="dType in deviceTypes" :key="dType" :value="dType">
              {{ dType }}
            </option>
          </select>

          <div v-if="deviceTypeValue === 'sensor'">
            <p class="m-0">Angle</p>
            <input class="mb-2 w-100" type="number" />

            <p class="m-0">Rotation</p>
            <input class="mb-2 w-100" type="number" />

            <p class="m-0">Ceil Height</p>
            <input class="mb-2 w-100" />
          </div>

          <button
            class="btn btn-primary"
            style="float: right"
            @click="onCreateDevice"
          >
            <span>Create</span>
          </button>
        </div>
        <!-- <div v-if="deviceTypeValue === 'sensor'">
            <p class="m-0">Angle</p>
            <input class="mb-2 w-100" type="number" />

            <p class="m-0">Rotation</p>
            <input class="mb-2 w-100" type="number" />

            <p class="m-0">Ceil Height</p>
            <input class="mb-2 w-100" />
          </div> -->
      </div>
    </Popup>
  </div>
</template>

<script>
import axios from "axios";
import Popup from "./right-popup.vue";
import { EventBus } from "../../../store.js";

export default {
  components: {
    Popup,
  },
  props: {
    token: {
      type: String,
      default: "",
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
    file: {
      type: Object,
      default: () => {},
    },
    device: {
      type: Object,
      default: () => {},
    },
    isMoveDevice: {
      type: Boolean,
      default: false,
    },
    errorUpdateDeviceMessage: {
      type: String,
      default: "",
    },
  },

  mounted() {},

  created() {},

  watch: {
    isOpen(val) {
      this.isOpen = val;
      this.createDeviceMode = val;
    },

    file(val) {},

    device(val) {
      if (val) {
        if (!val.hasOwnProperty("is_new")) {
          this.deviceIdValue = val.id;
        }
        this.deviceNameValue = val.block_name;
        this.deviceXValue = val.x;
        this.deviceYValue = val.y;
        this.deviceSerialNumberValue = val.serial_number;
        this.deviceChannelValue = val.channels ? val.channels[0] : null;
        this.deviceTypeValue = val.type;
        this.deviceAngleValue = val.angle;
        this.deviceCeilHeightValue = val.ceil_height;
        this.deviceRotationValue = val.rotation;
        this.deviceMacAddressValue = val.mac_address;
      } else {
        this.createDeviceMode = false;
        this.deviceIdValue = 0;
        this.deviceNameValue = "";
        this.deviceXValue = 0;
        this.deviceYValue = 0;
        this.deviceSerialNumberValue = "";
        this.deviceChannelValue = [];
        this.deviceTypeValue = "";
        this.deviceAngleValue = 0;
        this.deviceCeilHeightValue = 0;
        this.deviceRotationValue = 0;
        this.deviceMacAddressValue = "";
      }
    },

    isMoveDevice(val) {
      this.isMoveDevice = val;
    },
  },

  computed: {},

  data() {
    return {
      listChannels: ["ch1", "ch2", "ch3", "fusion"],
      deviceTypes: ["fixture", "sensor"],
      deviceIdValue: 0,
      deviceNameValue: "",
      deviceXValue: 0,
      deviceYValue: 0,
      deviceSerialNumberValue: "",
      deviceChannelValue: "",
      deviceTypeValue: "",
      createDeviceMode: false,
      deviceCeilHeightValue: 0,
      deviceAngleValue: 0,
      deviceRotationValue: 0,
      deviceMacAddressValue: "",
    };
  },

  methods: {
    handleCloseSidebar() {
      this.$emit("handleClosePopup", this.isOpen);
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

    onCreateDevice() {
      this.$emit("handleCreateDevice", {
        name: this.deviceNameValue,
        x: this.deviceXValue,
        y: this.deviceYValue,
        serial_number: this.deviceSerialNumberValue,
        channel: this.deviceChannelValue,
        type: this.deviceTypeValue || "fixture",
      });
    },

    async onUpdateDevice() {
      if (this.deviceSerialNumberValue) {
        let re = new RegExp(/^[A-Z]\d{4}\w+$/);
        if (!re.test(this.deviceSerialNumberValue)) {
          this.errorUpdateDeviceMessage = "Serial number is invalid.";
          return;
        }
        let arraySerialNumber = this.deviceSerialNumberValue.split("");
        if (parseInt(arraySerialNumber[2]) < 3) {
          this.deviceChannelValue = "ch" + arraySerialNumber[2];
        }
      }
      if (
        (!this.deviceSerialNumberValue && !this.deviceChannelValue) ||
        (this.deviceSerialNumberValue && this.deviceChannelValue)
      ) {
        this.$emit("handleUpdateDevice", {
          id: this.deviceIdValue,
          name: this.deviceNameValue,
          x: this.deviceXValue,
          y: this.deviceYValue,
          serialNumber: this.deviceSerialNumberValue,
          channel: this.deviceChannelValue,
          type: this.deviceTypeValue || "fixture",
          angle: this.deviceAngleValue,
          ceilHeight: this.deviceCeilHeightValue,
          rotation: this.deviceRotationValue,
          mac_address: this.deviceMacAddressValue,
        });
      }
    },

    onEnableCreateDevice() {
      this.isOpen = true;
      this.createDeviceMode = true;
      this.$emit("handleEnableCreateDevice");
    },

    onEnableMoveDevice(e) {
      const { checked } = e.target;
      this.$emit("handleEnableMoveDevice", checked);
    },
  },
  created() {
    EventBus.$on("onEnableCreateDevice", this.onEnableCreateDevice);
  },
  destroyed() {
    EventBus.$off("onEnableCreateDevice", this.onEnableCreateDevice);
  },
};
</script>
