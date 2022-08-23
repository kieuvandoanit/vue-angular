<template>
  <div class="layout-center">
    <div class="form-update">
      <div class="title">
        <h4>Building Details {{project_id}}</h4>
      </div>
      <form @submit.prevent="updateBuilding()">
        <div class="row">
          <div class="col-lg-4 col-sm-12">
            <label for="building_name" class="form-label">Name &nbsp;<i class="fa fa-question-circle" aria-hidden="true"></i></label>
            <input
              type="text"
              class="form-control"
              id="building_name"
              name="building_name"
              placeholder="Building name"
              v-model="computedBuilding.name"
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
              v-model="computedBuilding.address"
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
              v-model="computedBuilding.position"
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
    building: {
      type: Object,
      default() {
        return {};
      }
    },
    project_id: 0,
  },

  mounted() {
    
  },

  computed: {
    computedBuilding() {
      return this.building;
    },
  },

  created() {
    this.$parent.$on('save', (data) => {
      this.updateBuilding();
    });
   },

  data() {
    return {
      selectedBuilding: {},
    };
  },

  methods: {
    updateBuilding() {
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      axios
        .put(
          `${API_DOMAIN_MANIFERA}/api/v1/buildings/${this.computedBuilding.id}`, this.computedBuilding
        )
        .then((response) => {
          this.$emit('back');
          alert('Building Updated')
        })
        .catch((error) => {
          // handle error
          alert('Failed to update building');
        })
    },
  },
};
</script>
