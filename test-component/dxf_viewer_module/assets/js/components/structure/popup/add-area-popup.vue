<template>
  <div class="">
    <Popup
      :sidebarElementId="'add-area-popup'"
      :sidebarOpen="isOpen"
      @handleCloseSidebar="handleCloseSidebar"
    >
      <div>
        <div
          v-if="
            (area &&
              !drawAreaMode &&
              !drawPolygonAreaMode &&
              !area.hasOwnProperty('is_new')) ||
            (area &&
              (drawAreaMode || drawPolygonAreaMode) &&
              !area.hasOwnProperty('is_new'))
          "
        >
          <div class="content-item">
            <div class="title-name">
              <p>Edit Area</p>
            </div>
          </div>
          <p class="m-0">ID</p>
          <input readonly disabled class="mb-2 w-100" v-model="areaIdValue" />

          <p class="m-0">Name</p>
          <input
            class="mb-2 w-100"
            v-model="areaNameValue"
            @change="onChangeAreaName"
          />
          <div v-if="positionsValue.length > 2">
            <!-- <table>
              <thead>
                <tr>
                  <th>X</th>
                  <th>Y</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="point in area.positions" :key="point.x">
                  <td>{{ point.x }}</td>
                  <td>{{ point.y }}</td>
                </tr>
              </tbody>
            </table> -->
          </div>

          <div v-else>
            <p class="m-0">X</p>
            <input
              class="mb-2 w-100"
              type="number"
              v-model="areaXValue"
              @change="onChangeAreaX"
            />

            <p class="m-0">Y</p>
            <input
              class="mb-2 w-100"
              type="number"
              v-model="areaYValue"
              @change="onChangeAreaY"
            />

            <p class="m-0">Width</p>
            <input
              class="mb-2 w-100"
              type="number"
              v-model="areaWidthValue"
              @change="onChangeAreaWidth"
            />

            <p class="m-0">Height</p>
            <input
              class="mb-2 w-100"
              type="number"
              v-model="areaHeightValue"
              @change="onChangeAreaHeight"
            />
          </div>

          <div class="d-flex justify-content-between">
            <button
              class="btn btn-danger my-3"
              @click="
                showDeleteAreaModal = true;
                area = area;
              "
            >
              <span>Delete</span>
            </button>

            <button class="btn btn-primary my-3" @click="onUpdateArea">
              <span>Update</span>
            </button>
          </div>
        </div>

        <div
          v-else-if="
            (!area && (drawAreaMode || drawPolygonAreaMode)) ||
            (area && area.hasOwnProperty('is_new')) ||
            (!area && (!drawAreaMode || !drawPolygonAreaMode))
          "
        >
          <div class="content-item">
            <div class="title-name">
              <p>Create Area</p>
            </div>
          </div>

          <p class="m-0">Name</p>
          <input
            class="mb-2 w-100"
            v-model="areaNameValue"
            @change="onChangeAreaName"
          />

          <div v-if="positionsValue.length > 2">
            <!-- <table>
              <thead>
                <tr>
                  <th>X</th>
                  <th>Y</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="point in area.positions" :key="point.x">
                  <td>{{ point.x }}</td>
                  <td>{{ point.y }}</td>
                </tr>
              </tbody>
            </table> -->
          </div>

          <div v-else>
            <p class="m-0">X</p>
            <input
              class="mb-2 w-100"
              type="number"
              v-model="areaXValue"
              @change="onChangeAreaX"
            />

            <p class="m-0">Y</p>
            <input
              class="mb-2 w-100"
              type="number"
              v-model="areaYValue"
              @change="onChangeAreaY"
            />

            <p class="m-0">Width</p>
            <input
              class="mb-2 w-100"
              type="number"
              v-model="areaWidthValue"
              @change="onChangeAreaWidth"
            />

            <p class="m-0">Height</p>
            <input
              class="mb-2 w-100"
              type="number"
              v-model="areaHeightValue"
              @change="onChangeAreaHeight"
            />
          </div>

          <div class="d-flex justify-content-end">
            <button class="btn btn-primary my-3" @click="onCreateArea">
              <span>Create</span>
            </button>
          </div>
        </div>
      </div>
    </Popup>
    <Modal
      :show="showDeleteAreaModal"
      header="Remove Area"
      :body="`Are you sure you want to remove area <b>${
        this.area ? this.area.name : ''
      }</b> ?`"
      :loading="loading"
      :error="errorMessage"
      @no="showDeleteAreaModal = false"
      @yes="onDeleteArea"
    >
    </Modal>
  </div>
</template>

<script>
import Popup from "./right-popup.vue";
import Modal from "./modal.vue";
import { EventBus } from "../../../store.js";

export default {
  components: {
    Popup,
    Modal,
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
    area: {
      type: Object,
      default: () => {},
    },
  },

  mounted() {},

  created() {},

  watch: {
    isOpen(val) {
      this.isOpen = val;
    },

    area(val) {
      if (val) {
        this.areaIdValue = val.id;
        this.areaFileIdValue = val.file_id;
        this.areaNameValue = val.name;
        this.areaXValue = val.x;
        this.areaYValue = val.y;
        this.areaWidthValue = val.width;
        this.areaHeightValue = val.height;
        this.positionsValue = val.positions;
      } else {
        this.areaNameValue = "";
        this.areaXValue = 0;
        this.areaYValue = 0;
        this.areaWidthValue = 0;
        this.areaHeightValue = 0;
        this.positionsValue = [];
        this.drawAreaMode = false;
        this.drawPolygonAreaMode = false;
      }
    },
  },

  computed: {},

  data() {
    return {
      drawAreaMode: false,
      drawPolygonAreaMode: false,
      areaIdValue: 0,
      areaFileIdValue: 0,
      areaNameValue: "",
      areaXValue: 0,
      areaYValue: 0,
      areaWidthValue: 0,
      areaHeightValue: 0,
      positionsValue: [],
      showDeleteAreaModal: false,
    };
  },

  methods: {
    handleCloseSidebar() {
      this.drawAreaMode = false;
      this.drawPolygonAreaMode = false;
      this.$emit("handleClosePopup");
    },

    onChangeAreaName(e) {
      const { value } = e.target;
      this.areaNameValue = value;
    },

    onChangeAreaX(e) {
      const { value } = e.target;
      this.areaXValue = value;
    },

    onChangeAreaY(e) {
      const { value } = e.target;
      this.areaYValue = value;
    },

    onChangeAreaWidth(e) {
      const { value } = e.target;
      this.areaWidthValue = value;
    },

    onChangeAreaHeight(e) {
      const { value } = e.target;
      this.areaHeightValue = value;
    },

    onUpdateArea() {
      this.$emit("handleUpdateArea", {
        id: this.areaIdValue,
        file_id: this.areaFileIdValue,
        name: this.areaNameValue,
        x: this.areaXValue,
        y: this.areaYValue,
        width: this.areaWidthValue,
        height: this.areaHeightValue,
        positions: this.positionsValue,
      });
    },

    onCreateArea() {
      if (this.positionsValue.length === 0) {
        const p1 = {
          x: this.areaXValue,
          y: this.areaYValue + this.areaHeightValue,
        };
        const p2 = {
          x: this.areaXValue,
          y: this.areaYValue };
        const p3 = {
          x: this.areaXValue + this.areaWidthValue,
          y: this.areaYValue,
        };
        const p4 = {
          x: this.areaXValue + this.areaWidthValue,
          y: this.areaYValue + this.areaHeightValue,
        };
        this.positionsValue = [p1, p2, p3, p4];
      }
      this.$emit("handleCreateArea", {
        name: this.areaNameValue,
        x: this.areaXValue,
        y: this.areaYValue,
        width: this.areaWidthValue,
        height: this.areaHeightValue,
        positions: this.positionsValue,
      });
    },

    onSwitchToDrawArea() {
      this.isOpen = true;
      this.drawAreaMode = true;
      this.drawPolygonAreaMode = false;
      this.area = null;
    },

    onSwitchToDrawPolygonArea() {
      this.isOpen = true;
      this.drawAreaMode = false;
      this.area = null;
      this.drawPolygonAreaMode = true;
    },

    onDeleteArea() {
      this.$emit("handleDeleteArea", this.areaIdValue);
      this.showDeleteAreaModal = false;
    },
  },
  created() {
    EventBus.$on("onSwitchToDrawArea", this.onSwitchToDrawArea);
    EventBus.$on("onSwitchToDrawPolygonArea", this.onSwitchToDrawPolygonArea);
  },
  destroyed() {
    EventBus.$off("onSwitchToDrawArea", this.onSwitchToDrawArea);
  },
};
</script>
