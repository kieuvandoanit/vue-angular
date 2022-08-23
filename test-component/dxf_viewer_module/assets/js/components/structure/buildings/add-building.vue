<template>
  <div class="layout-center" style="padding-top: 24px;">
    <div class="form-update">
      <!-- <div class="title">
        <h4>Building Details</h4>
      </div> -->
      <form @submit.prevent="createBuilding()">
        <div class="row">
          <div class="col-lg-4 col-sm-12">
            <label for="building_name" class="form-label">Name &nbsp;<i class="fa fa-question-circle" aria-hidden="true"></i></label>
            <input
              type="text"
              class="form-control"
              id="building_name"
              name="building_name"
              placeholder="Building name"
              v-model="building.name"
            />
          </div>
          <div class="col-lg-4 col-sm-12">
            <label for="building_address" class="form-label">Address &nbsp;<i class="fa fa-question-circle" aria-hidden="true"></i></label>
            <input
              type="text"
              class="form-control"
              id="building_address"
              name="building_address"
              placeholder="Building address"
              v-model="building.address"
            />
          </div>
          <div class="col-lg-4 col-sm-12">
            <label for="order_position" class="form-label">Order Position &nbsp;<i class="fa fa-question-circle" aria-hidden="true"></i></label>
            <input
              type="number"
              min="0"
              class="form-control"
              id="order_position"
              name="order_position"
              placeholder="Order Position"
              v-model="building.position"
            />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
const axios = require("axios").default;
import { API_DOMAIN_MANIFERA } from "../../../constant.js";

export default {
  props: {
    token: "",
    project_id: 0,
  },

  mounted() {
    
  },

  created() {
    this.$parent.$on('add_building', (data) => {
      this.createBuilding();
    });
   },

  data() {
    return {
      building: {
        name: "",
        address: "",
        position: 0,
        project_id: this.project_id,
      },
    };
  },

  methods: {
    createBuilding() {
      this.building.project_id = this.project_id;
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      axios
        .post(
          `${API_DOMAIN_MANIFERA}/api/v1/buildings/`, this.building
        )
        .then((response) => {
          this.$emit('refreshBuilding');
          alert('Building Create')
        })
        .catch((error) => {
          // handle error
          alert('Failed to update building');
        })
    },
  },
};
</script>
