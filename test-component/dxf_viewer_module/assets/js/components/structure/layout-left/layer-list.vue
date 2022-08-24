<template>
  <div
    class="contain-list row table-floors"
    style="align-items: normal"
    ref="width"
  >
    <div
      v-bind:class="{
        'col-12': !this.expanded,
        'col-4': this.expanded,
      }"
    >
      <div class="d-flex middle">
        <div class="d-flex box-title" v-bind:style="widthLeft">
          <!-- <div class="expanded-view" v-show="expanded" @click="compactClick()">
            <i class="fa-solid fa-arrow-left"></i> &nbsp;Compact View
          </div> -->
          <div class="title">Layers</div>
          <!-- <div class="expanded-view" v-show="!expanded" @click="expandedClick()">
            Expanded View&nbsp;<i class="fa-solid fa-arrow-right"></i>
          </div> -->
        </div>
      </div>
      <table class="table">
        <tbody>
          <tr v-for="layer in groupData" :key="layer.id">
            <td>
              <img src="/assets/icons/menu.png" alt="" /> &nbsp;{{ layer.name }}
              Day ne
            </td>
            <td @click="groupClick(layer)">
              <a class="total-layer" href="#"
                >groups(8) <i class="fa-solid fa-chevron-right"></i
              ></a>
            </td>
          </tr>
        </tbody>
      </table>
      <button
        style="float: right"
        type="button"
        v-show="!this.expanded"
        class="btn btn-primary"
      >
        <i class="fa-solid fa-plus"></i> &nbsp;Add layer
      </button>
    </div>
    <div class="col-8 box-detail-floor" v-show="this.expanded">
      <div class="d-flex">
        <div class="d-flex box-title">
          <div class="title">Floor Details</div>
        </div>
      </div>
      <div class="row">
        <div class="col-4">
          <h6>Name</h6>
          <p>{{ this.floor.full_name }}</p>
        </div>
        <div class="col-4">
          <h6>Number</h6>
          <p>{{ this.floor.id }}</p>
        </div>
        <div class="col-4">
          <h6>Order Position</h6>
          <p>{{ this.floor.position }}</p>
        </div>
      </div>
      <div class="row">
        <div class="col-4">
          <h6>Layer Name</h6>
          <p>{{ this.floor.layer_names }}</p>
        </div>
        <div class="col-4">
          <h6>Sensor Layer Name</h6>
          <p>{{ this.floor.sensor_layer_name }}</p>
        </div>
        <div class="col-4">
          <h6>Fixture Layer Name</h6>
          <p>{{ this.floor.fixture_layer_name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    groupData: {
      default() {
        return () => [];
      },
    },
    expanded: {
      type: Boolean,
      default: false,
    },
    floor: {
      default() {
        return {};
      },
    },
  },

  mounted() {},
  watch: {},
  data() {
    return {
      widthLeft: {},
      col: "col-4",
    };
  },

  computed: {},

  methods: {
    expandedClick(status) {
      // console.log("!231", status);
      this.$emit("expandedClick");
      this.expanded = true;
      this.widthLeft = { width: "285px" };
    },
    compactClick(status) {
      // console.log("!====", status);
      this.$emit("compactClick");
      this.expanded = false;
      this.widthLeft = { width: "100%" };
    },
    groupClick(id) {
      //this.$emit("layoutGroup", id);
    },
  },
};
</script>
