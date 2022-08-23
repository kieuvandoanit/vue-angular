<template>
  <div v-if="selectedScene">
    <div class="content-item" style="border-bottom: 1px solid gray">
      <div class="d-flex p-0">
        <div class="title-name">
          <div v-if="editName">
            <input type="text" v-model="selectedScene.name" @blur="onChangeName" />
          </div>
          <div class="d-inline-flex" v-else>
            <p>{{ selectedScene.name }}</p>
            <!-- <i class="fas fa-edit"></i> -->
          </div>
        </div>
        <!-- <div class="icon-edit ms-2 mt-1">
            <img src="/static/imgs/edit.svg" />
        </div>-->
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
              <input type="text" style="width: 100px" v-model="selectedScene.light" />
              <label>K</label>
            </div>
          </div>
          <div class="slide-contaicolor">
            <input
              type="range"
              min="2000"
              max="10000"
              v-model="selectedScene.light"
              class="slider-color"
              id="myrange-color"
            />
          </div>
        </div>
        <div v-else>
          <div class="content-item">
            <label style="color: #fff">Color</label>
            <div class="color-k">
              <input type="text" style="width: 100px" v-model="selectedScene.x_color" />
              <label>X</label>
            </div>
          </div>
          <div style="display: flex; justify-content: end">
            <div class="color-k">
              <input type="text" style="width: 100px" v-model="selectedScene.y_color" />
              <label>Y</label>
            </div>
          </div>
        </div>
        <div class="content-item">
          <label style="color: #fff">Intensity</label>
          <div class="color-k">
            <input type="text" style="width: 100px" v-model="selectedScene.intensity" />
            <label>%</label>
          </div>
        </div>
        <div class="slide-contaicolor">
          <input
            type="range"
            min="0"
            max="100"
            v-model="selectedScene.intensity"
            class="slider-intensity"
            id="myrange-color"
          />
        </div>
        <div class="d-flex justify-content-end pt-2">
          <button class="btn btn-primary" @click="editScene">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Segment from "./segment.vue";
import axios from "axios";
import { API_DOMAIN_MANIFERA } from "../../../constant.js";
export default {
  components: {
    Segment,
  },
  props: {
    selectedScene: {
      default() {
        return {};
      },
    },
    token: {
      type: String,
      default: "",
    },
  },
  mounted() { },

  watch: {

  },

  created() { },

  data() {
    return {

    };
  },

  computed: {
    colorMode: {
      get() {
        return this.selectedScene.color_type;
      },
      set(value) {
        this.selectedScene.color_type = value;
      },
    },
  },

  methods: {
    onChangeTab(v) {
      if (v.tab === "xy") {
        this.colorMode = "yxy";
      } else {
        this.colorMode = v.tab;
      }
    },
    editScene() {
      this.selectedScene.color_type = this.colorMode;
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      const params = {
        light: this.selectedScene.light,
        intensity: this.selectedScene.intensity,
        color: this.selectedScene.color,
        x_color: this.selectedScene.x_color,
        y_color: this.selectedScene.y_color,
        color_type: this.selectedScene.color_type,
      };
      axios
        .put(
          `${API_DOMAIN_MANIFERA}/api/v1/scenes/${this.selectedScene.id}`,
          params
        )
        .then((response) => {
          this.$emit("handleBackSidebar");
          this.$emit("getScenarios");
        });
    },
  },
};
</script>

<style></style>
