<template>
  <div>
    <div v-if="data && !selectedScene">
      <div class="content-item" style="border-bottom: 1px solid gray">
        <div class="d-flex p-0">
          <div class="title-name">
            <p>{{ data.name }}</p>
          </div>
        </div>
        <div
          class="box-turn"
          v-bind:class="{
            off: !data.scene_status,
            on: data.scene_status,
          }"
          @click="onClickOnOff"
        >
          <div class="box-active">
            <div class="icon-led"></div>
          </div>
        </div>
      </div>
      <div>
        <div class="content-item">
          <div class="title">
            <span>Preset</span>
          </div>
          <Segment
            :data="['cct', 'xy']"
            :currentTab="colorMode === 'yxy' ? 'xy' : 'cct'"
            style="max-width: 115px"
            @onChangeTab="onChangeTab"
          ></Segment>
        </div>
        <div class="control-led">
          <div v-if="colorMode === 'cct'">
            <div class="content-item">
              <label style="color: #fff">Color</label>
              <div class="color-k">
                <input
                  type="text"
                  style="width: 100px"
                  v-model="data.light"
                  @blur="onBlurChangeLight"
                />
                <label>K</label>
              </div>
            </div>
            <div class="slide-contaicolor">
              <input
                type="range"
                min="2000"
                max="10000"
                step="100"
                v-model="data.light"
                class="slider-color"
                id="myrange-color"
                @change="onChangeLight($event)"
              />
            </div>
          </div>
          <div v-else>
            <div class="content-item">
              <label style="color: #fff">Color</label>
              <div class="color-k">
                <input
                  type="text"
                  style="width: 100px"
                  v-model="data.x_color"
                  @blur="onBlurChangeXValue"
                />
                <label>X</label>
              </div>
            </div>
            <div style="display: flex; justify-content: end">
              <div class="color-k">
                <input
                  type="text"
                  style="width: 100px"
                  v-model="data.y_color"
                  @blur="onBlurChangeYValue"
                />
                <label>Y</label>
              </div>
            </div>
          </div>
          <div class="content-item">
            <label style="color: #fff">Intensity</label>
            <div class="color-k">
              <input
                type="text"
                style="width: 100px"
                v-model="data.intensity"
                @blur="onBlurChangeIntensity"
              />
              <label>%</label>
            </div>
          </div>
          <div class="slide-contaicolor">
            <input
              type="range"
              min="0"
              max="100"
              v-model="data.intensity"
              class="slider-intensity"
              id="myrange-color"
              @change="onChangeIntensity($event)"
            />
          </div>
        </div>
        <template v-if="scenes && scenes.length > 0">
          <div class="title m-0 mt-3 pt-2" style="border-top: 1px solid gray">
            <span>Scenes</span>
          </div>
          <ScenesList
            :scenes="scenes"
            :group="data"
            @handleToggle="handleToggle"
            @clickSceneName="clickSceneName"
          />
        </template>
        <div
          v-else
          class="title m-0 mt-3 pt-2"
          style="border-top: 1px solid gray"
        >
          <span>No Scenes Found</span>
        </div>
      </div>
    </div>
    <div v-else-if="selectedScene">
      <EditScene
        :selectedScene="selectedScene"
        :token="token"
        @handleBackSidebar="handleBackSidebar"
        @getScenarios="getScenarios"
      ></EditScene>
    </div>
  </div>
</template>

<script>
import Segment from "./segment.vue";
import { EventBus, store, storeFunctions } from "../../../store.js";
import axios from "axios";
import ScenesList from "./scenes-list.vue";
import EditScene from "./edit-scene.vue";
export default {
  components: {
    Segment,
    ScenesList,
    EditScene,
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
    selectedScene: {
      default() {
        return {};
      },
    },
    isShowBackButton: {
      default() {
        return false;
      },
    },
    lightControl: {
      default() {
        return false;
      },
    },
    token: {
      default() {
        return "";
      },
    },
  },
  mounted() {},

  watch: {},

  created() {},

  data() {
    return {};
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
  },

  methods: {
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
        EventBus.$emit("getScenesForGroup", this.data.scene_id);

        let scene = scenes.filter((scene) => scene.id == this.data.scene_id);

        if (scene && scene.length > 0) {
          // get state
          sceneIntensity = scene.intensity;
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

      EventBus.$emit("lightTrigger", groupId, params);
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

          EventBus.$emit("getGroups");
          EventBus.$emit("getDevices", false);
        })
        .catch((error) => {})
        .then((a) => {});
    },

    onClickOnOff() {
      this.turnOnOff = true;
      this.handleTurnOnOffLight();
    },

    onChangeTab(v) {
      if (v.tab === "xy") {
        this.colorMode = "yxy";
      } else {
        this.colorMode = v.tab;
      }
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
        params.id = this.data.id;
        EventBus.$emit("updateGroup", params)
      }
    },

    onBlurChangeLight(e) {
      const { value } = e.target;
      this.lightValue = value.value;
      this.handleTurnOnOffLight();
    },
    onChangeLight(e) {
      const { value } = e.target;
      this.lightValue = value;
      this.handleTurnOnOffLight();
    },
    onBlurChangeXValue(e) {
      const { value } = e.target;
      this.xValue = value.value;
      this.handleTurnOnOffLight();
    },
    onBlurChangeYValue(e) {
      const { value } = e.target;
      this.yValue = value.value;
      this.handleTurnOnOffLight();
    },
    onBlurChangeIntensity(e) {
      const { value } = e.target;
      this.intensityValue = value;
      this.handleTurnOnOffLight();
    },
    onChangeIntensity(e) {
      const { value } = e.target;
      this.intensityValue = value;
      this.handleTurnOnOffLight();
    },

    handleToggle(v) {
      // console.log("handleToggle: ", v);
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      const params = {
        scene_id: v.checked ? v.value : null,
      };
      EventBus.$emit("updateGroup", params);
    },

    clickSceneName(scene) {
      if (scene) {
        storeFunctions.setSelectedScene(scene);
        this.isShowBackButton = true;
      }
    },

    getScenarios() {
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      axios
        .get(`${API_DOMAIN_MANIFERA}/api/v1/scenes?group_id=${this.data.id}`)
        .then((response) => {
          const data = response.data;
          this.scenes = data;
        })
        .catch((error) => {
          // handle error
          // console.log(error);
        })
        .then(function (a) {});
    },

    handleBackSidebar() {
      if (this.selectedScene) {
        if (this.selectedScene.id == this.data.scene_id) {
          this.handleToggle({ value: this.data.scene_id, checked: true });
        }
        storeFunctions.setSelectedScene(null);
      }
    },
  },
};
</script>

<style></style>
