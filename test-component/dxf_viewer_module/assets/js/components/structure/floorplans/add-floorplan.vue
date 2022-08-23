<template>
  <div class="layout-center">
    <div class="form-update">
      <div class="title">
        <h4>
          Add Floorplan For Building:
          <b
            ><i>{{ computedBuilding.name }}</i></b
          >
          <div
            v-show="loading"
            class="spinner-border spinner-border-sm ml-2"
          ></div>
        </h4>
      </div>
      <form @submit.prevent="addFloor">
        <div class="row">
          <div class="col-lg-12 col-sm-12 mb-2">
            <label for="name" class="form-label"
              >Floor Name &nbsp;<i
                class="fa fa-question-circle"
                aria-hidden="true"
              ></i
            ></label>
            <input
              type="text"
              class="form-control"
              id="full_name"
              name="full_name"
              placeholder="Floor Name"
              required
              v-model="floorplan.full_name"
            />
          </div>
          <div class="col-lg-12 col-sm-12 mb-2">
            <label for="name" class="form-label"
              >Floor Number &nbsp;<i
                class="fa fa-question-circle"
                aria-hidden="true"
              ></i
            ></label>
            <input
              type="text"
              class="form-control"
              id="short_name"
              name="short_name"
              placeholder="Floor Number"
              required
              v-model="floorplan.short_name"
            />
          </div>
          <div class="col-lg-12 col-sm-12 mb-2">
            <label for="name" class="form-label"
              >Floor Position &nbsp;<i
                class="fa fa-question-circle"
                aria-hidden="true"
              ></i
            ></label>
            <input
              type="text"
              class="form-control"
              id="position"
              name="position"
              placeholder="Floor Position"
              required
              v-model="floorplan.position"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12 col-sm-12">
            <label for="name" class="form-label"
              >Select Floor &nbsp;<i
                class="fa fa-question-circle"
                aria-hidden="true"
              ></i
            ></label>
            <br />
            <input name="file" type="file" ref="fileInput" accept=".dxf,.dwg" />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
const axios = require("axios").default;
import { API_DOMAIN_MANIFERA } from "../../../constant.js";
import { EventBus } from "../../../store.js";

export default {
  props: {
    token: "",
    building: {
      type: Object,
      default() {
        return {};
      },
    },
  },

  mounted() {},

  computed: {
    computedBuilding() {
      return this.building;
    },
  },

  created() {
    this.$parent.$on("add_floor", (data) => {
      this.addFloor();
    });
  },

  data() {
    return {
      loading: false,
      floorplan: {
        full_name: "",
        short_name: "",
        project_id: 0,
        building_id: 0,
        position: 0,
      },
    };
  },

  methods: {
    async addFloor() {
      this.loading = true;
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      let formData = new FormData();
      formData.append("full_name", this.floorplan.full_name);
      formData.append("short_name", this.floorplan.short_name);
      formData.append("position", this.floorplan.position);
      formData.append("building_id", this.computedBuilding.id);
      formData.append("project_id", this.computedBuilding.project_id);
      formData.append("file", this.$refs.fileInput.files[0]);

      await axios
        .post(`${API_DOMAIN_MANIFERA}/api/v1/files/`, formData)
        .then((response) => {
          // window.location.reload();
          EventBus.$emit("updateFloorData");
        })
        .catch((error) => {
          // handle error
          alert("Failed to upload floorplan");
        });
      this.loading = false;
    },
  },
};
</script>
