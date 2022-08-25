<template>
  <div>
    <Popup
      :sidebarElementId="'detail-group-popup'"
      :sidebarOpen="isOpen"
      :hasBackButton="isShowBackButton"
      @handleCloseSidebar="handleCloseSidebar"
      @handleBackSidebar="handleBackSidebar"
    >
      <div>
        <!-- Start group section -->
        <!-- <div v-if="devices && devices[0].type === 'Group'"> -->
          <div  v-if="data && !lightControl">
            <div class="content-item d-flex justify-content-between">
              <div class="title-name">
                <p>
                  Edit Group
                </p>
              </div>
              <button v-if="data.controllable" class="btn" @click="onEnableLightControl" style="background-color: #F97316">Light Control</button>
            </div>
            <!-- Start checkbox move group section -->
            <div
              class="d-flex align-items-center pb-2"
            >
              <input
                id="move-group"
                type="checkbox"
                style="cursor: pointer"
                v-model="isMoveGroup"
                @click="onEnableMoveGroup"
              />
              <label for="move-group" class="m-0 ps-1" style="cursor: pointer"
                >Move Group</label
              >
            </div>
            <!-- End checkbox move group section -->
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
            <div v-if="isAdvancedView">
              <p class="m-0">ID</p>
              <input readonly class="mb-2 w-100" v-model="data.id" />
            </div>

            <p class="m-0">Name</p>
            <input
              class="mb-2 w-100"
              v-model="data.name"
            />

            <template v-if="isMoveGroup">
            <p class="m-0">X</p>
            <input
              class="mb-2 w-100"
              type="number"
              readonly
              v-model="data.x"
              @change="onChangeGroupX"
            />

            <p class="m-0">Y</p>
            <input
              class="mb-2 w-100"
              type="number"
              readonly
              v-model="data.y"
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

            <div class="d-flex justify-content-between">
              <button class="btn btn-danger my-3" @click="showDeleteGroupModal = true; group = data">
                <span>Delete</span>
              </button>
              <button class="btn btn-primary my-3" @click="onUpdateGroup">
                <span>Save</span>
              </button>
            </div>
          </div>
          <!-- End group section -->

        <div v-if="data && lightControl">
          <DetailGroup
          :data="data"
          :scenes="scenes"
          :selectedScene="selectedScene"
          :lightControl="lightControl"
          :token="token"
          :isShowBackButton="isShowBackButton"
          @handleBackSidebar="handleBackSidebar">
          </DetailGroup>
        </div>
      </div>

      
    </Popup>
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
// import { API_DOMAIN_MANIFERA } from "../../../constant.js";
import Segment from "../popup/segment.vue";
import ScenesList from "./scenes-list.vue";
// import EditScene from "./edit-scene.vue"
import DetailGroup from "./detail-group.vue"
import Popup from "./right-popup.vue";
import Modal from "./modal.vue"
import { store, storeFunctions, EventBus } from "../../../store.js"
export default {
  components: {
    Segment,
    ScenesList,
    // EditScene,
    DetailGroup,
    Popup,
    Modal,
  },
  props: {
    data: {
      default() {
        return {};
      },
    },
    scenes: {
      default() {
        return [];
      },
    },
    token: {
      type: String,
      default: "",
    },
    parentGroups: {
      type: Array,
      default: [],
    },
    isShowBackButton: {
      type: Boolean,
      default: false,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
  },

  watch: {
    // parentGroups(val){
    //   console.log("parentGroups: ", val);
    //   console.log("parentId: ", this.parentId);
    // },
    data(val){
    },
  },

  created() { },

  data() {
    return {
      turnOnOff: false,
      showDeleteGroupModal: false,
      // isMoveGroup: false,
      isAdvancedView: false,
      lightControl: false,
      parentId: null,
      needRefresh: false,
    };
  },

  computed: {
    colorMode: {
      get() {
        return this.data.color_type;
      },
      set(value) {
        this.data.color_type = value;
      },
    },
    selectedScene() {
      return store.selectedScene;
    },
    groupId:{
      get() {
        return this.data.parent_id ?? 0;
      },
      set(value) {
        this.parentId = value;
        // console.log("value: ", value);
        // // this.groupId = value;
        // console.log("this.groupId: ", this.groupId);

      },
    },
    isMoveGroup(){
      return store.isMoveGroup;
    }
  },

  methods: {
    handleCloseSidebar() {
      // this.isMoveGroup = false;
      storeFunctions.setIsMoveGroup(false);
      this.$emit("handleCloseSidebar");
    },
    // onChangeName() {
    //   axios.defaults.headers.common["Authorization"] = this.token;
    //   axios.defaults.headers.post["Content-Type"] =
    //     "application/x-www-form-urlencoded";
    //   axios
    //     .put(`${API_DOMAIN_MANIFERA}/api/v1/groups/${this.data.id}`, {
    //       name: this.data.name,
    //     })
    //     .then((response) => {
    //       this.handleCloseSidebar();
    //       this.groupName = "";
    //       // this.$parent.getGroups();
    //       EventBus.$emit("getGroups");
    //     })
    //     .catch((error) => { })
    //     .then((a) => { });
    // },
    async handleTurnOnOffLight() {
      axios.defaults.headers.post["Access-Control-Allow-Origin"] = true;
      axios.defaults.headers.common["Authorization"] = this.token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      let groupId = 0;
      let params = null;
      let sceneIntensity = 0;

      if (this.data) {
        groupId = this.data.id;
        let intensity = 0;
        const sceneResponse = await axios.get(
          `${API_DOMAIN_MANIFERA}/api/v1/scenes/${this.data.scene_id}`
        );

        if (sceneResponse) {
          sceneIntensity = sceneResponse?.data?.intensity;
        }

        if (!this.data.scene_status) {
          intensity = sceneIntensity;
        }

        let lightValue = this.data.light;
        let xValue = this.data.x_color;
        let yValue = this.data.y_color;
        let status = this.data.scene_status;
        if (this.lightValue !== null) {
          lightValue = this.lightValue;
          intensity = sceneIntensity;
        }
        if (this.xValue !== null) {
          xValue = this.xValue;
          yValue = this.data.y_color;
          intensity = sceneIntensity;
        }
        if (this.yValue !== null) {
          xValue = this.data.x_color;
          yValue = this.yValue;
          intensity = sceneIntensity;
        }
        if (this.intensityValue !== null) {
          intensity = this.intensityValue;
          status = this.intensityValue === "0" ? false : true;
        }

        if (this.turnOnOff) {
          status = !this.data.scene_status;
        }

        this.data.scene_status = status;
        this.data.intensity = intensity;

        params = {
          intensity: intensity,
          light: lightValue,
          x_color: xValue,
          y_color: yValue,
          color_type: this.colorMode,
          is_on: status,
        };
      }
      axios
        .post(
          `${API_DOMAIN_MANIFERA}/api/v1/groups/${groupId}/mqtt/turn_on`,
          params
        )
        .then((response) => {
          this.lightValue = null;
          this.intensityValue = null;
          this.xValue = null;
          this.yValue = null;
          this.turnOnOff = false;

          // this.$root.$children[0].$children[1].getGroups();
          // this.$root.$children[0].$children[1].getDevices(false);
          EventBus.$emit("getGroups");
          EventBus.$emit("getDevices", false);
          // this.getDevices(false);
          // if (this.deviceData) {
          //   this.deviceData.status = !this.deviceData.status;
          //   this.sidebarData = this.deviceData;
          // }
        })
        .catch((error) => { })
        .then((a) => { });
    },
    onClickOnOff() {
      // this.$emit("handleTurnOnOff");
      this.turnOnOff = true;
      this.handleTurnOnOffLight();
    },
    onChangeTab(v) {
      if (v.tab === "xy") {
        this.colorMode = "yxy";
        // this.$emit("handleChangeTab", "yxy");
      } else {
        this.colorMode = v.tab;
        // this.$emit("handleChangeTab", "cct");
      }
      axios.defaults.headers.common["Authorization"] = this.token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      if (this.data) {
        const params = {
          scene_id: this.data.scene_id,
          intensity: this.data.intensity,
          color_type: this.colorMode,
        };
        if (v === "cct") {
          params.light = this.data.light;
        } else {
          params.x_color = this.data.x_color;
          params.y_color = this.data.y_color;
        }
        axios
          .put(`${API_DOMAIN_MANIFERA}/api/v1/groups/${this.data.id}`, params)
          .then((response) => {
            // this.$parent.getGroups();
            // this.$root.$children[0].$children[1].getGroups();
            EventBus.$emit("getGroups");
            // this.sidebarData = response.data;
          });
      }
    },
    onBlurChangeLight(e) {
      const { value } = e.target;
      this.lightValue = value.value;
      // this.$emit("handleBlurChangeLight", {value: value, colorMode: this.colorMode});
      this.handleTurnOnOffLight();
    },
    onChangeLight(e) {
      const { value } = e.target;
      this.lightValue = value;
      // this.$emit("handleChangeLight", {value: value, colorMode: this.colorMode});
      this.handleTurnOnOffLight();
    },
    onBlurChangeXValue(e) {
      const { value } = e.target;
      this.xValue = value.value;
      // this.$emit("handleBlurChangeX", {value: value, colorMode: this.colorMode});
      this.handleTurnOnOffLight();
    },
    onBlurChangeYValue(e) {
      const { value } = e.target;
      this.yValue = value.value;
      // this.$emit("handleBlurChangeY", {value: value, colorMode: this.colorMode});
      this.handleTurnOnOffLight();
    },
    onBlurChangeIntensity(e) {
      const { value } = e.target;
      this.intensityValue = value;
      // this.$emit("handleBlurChangeIntensity", {value: value, colorMode: this.colorMode});
      this.handleTurnOnOffLight();
    },
    onChangeIntensity(e) {
      const { value } = e.target;
      this.intensityValue = value;
      // this.$emit("handleChangeIntensity", {value: value, colorMode: this.colorMode});
      this.handleTurnOnOffLight();
    },
    handleToggle(v) {
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      const params = {
        scene_id: v.checked ? v.value : null,
      };

      axios
        .put(
          `${API_DOMAIN_MANIFERA}/api/v1/groups/${this.data.id}`,
          params
        )
        .then((response) => {
          // this.$root.$children[0].data = response.data;
          storeFunctions.setSelectedGroup(response.data);
          this.sidebarData = response.data;
          // this.$root.$children[0].$children[0].$children[1].updateTreeNode([response.data]);
          EventBus.$emit("updateTreeNode", [response.data]);
        });
    },

    handleBackSidebar() {
      if(this.selectedScene){
        // this.isShowBackButton = false;
        if (this.selectedScene.id == this.data.scene_id) {
          this.handleToggle({ value: this.data.scene_id, checked: true });
        }
        this.colorMode = this.data.color_type;
        storeFunctions.setSelectedScene(null)
      }else if(this.lightControl){
        this.lightControl = false;
        this.isShowBackButton = false;
      }
    },

    onDeleteGroup(){
      this.$emit("handleDeleteGroup", this.data);
      this.showDeleteGroupModal = false;
    },

    onChangeGroupX(e) {
      console.log("onChangeX");
      const { value } = e.target;
      console.log("value x: ", value);
      this.data.x = value;
    },
    onChangeGroupY(e) {
      const { value } = e.target;
      this.data.y = value;
    },

    onEnableMoveGroup(e) {
      const { checked } = e.target;
      this.isMoveGroup = checked;
      storeFunctions.setIsMoveGroup(checked);
      this.$emit("handleEnableMoveGroup", checked);
    },

    onEnableAdvancedView(e) {
      const { checked } = e.target;
      this.isAdvancedView = checked;
    },

    onEnableLightControl(e) {
      this.lightControl = true;
      this.isShowBackButton = true;
    },

    handleAddToGroup(){
      this.needRefresh = true;
      if (this.data) {
        // console.log("parentId -- parent_id:", this.parentId, this.data.parent_id);
        // if (this.groupId != this.data.parent_id) {
        if (this.parentId) {
          this.$emit(
            "handleAddToGroup",
            this.parentId,
            [this.data],
            [{}]
          );
         this.needRefresh = false;
         this.parentId = null;
        }
      }
    },

    onUpdateGroup(){
      this.handleAddToGroup();
      this.$emit("handleUpdateGroup", {
        id: this.data.id,
        name: this.data.name,
        x: this.data.x,
        y: this.data.y,
      }, this.needRefresh);
    },
  },
};
</script>

<style></style>
