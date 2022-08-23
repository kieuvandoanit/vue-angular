<template>
  <div class="layout-center">
    <div class="form-update">
      <div class="title">
        <h4>Add New Group For Floor <b><i>{{computedFloor.full_name}}</i></b></h4>
      </div>
      <form @submit.prevent="addGroup">
        <div class="row">
          <div class="col-lg-4 col-sm-12">
            <label for="name" class="form-label">Name &nbsp;<i class="fa fa-question-circle" aria-hidden="true"></i></label>
            <input
              type="text"
              class="form-control"
              id="name"
              name="name"
              placeholder="Group name"
              required
              v-model="group.name"
            />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
const axios = require("axios").default;
import { API_DOMAIN_MANIFERA } from "../../constant.js";

export default {
  props: {
    token: "",
    floorplan: {
      type: Object,
      default() {
        return {};
      }
    },
  },

  mounted() {
    
  },

  computed: {
    computedFloor() {
      return this.floorplan;
    },
  },

  created() {
    this.$parent.$on('add_group', (data) => {
      this.addGroup();
    });
   },

  data() {
    return {
      group: {
        name: '',
        building_id: 0,
        project_id: 0,
        file_id: 0,
      },
    };
  },

  methods: {
    addGroup() {
      if (!this.group.name) {
        alert('Please enter group name');
        return;
      }
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      this.group.building_id = this.computedFloor.building_id;
      this.group.project_id = this.computedFloor.project_id;
      this.group.file_id = this.computedFloor.id;

      axios
        .post(
          `${API_DOMAIN_MANIFERA}/api/v1/groups/`, this.group
        )
        .then((response) => {
          window.location.reload();
        })
        .catch((error) => {
          // handle error
          alert('Failed to create new group');
        })
    },
  },
};
</script>
