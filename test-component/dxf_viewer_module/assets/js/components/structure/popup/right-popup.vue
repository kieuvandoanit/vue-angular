<template>
  <transition name="slide">
    <div :id="sidebarElementId" v-if="sidebarOpen" class="sidebar-menu structure">
      <div class="d-flex justify-content-between">
        <!-- <div class="loader"></div> -->
        <div>
          <div v-if="hasBackButton" class="d-flex align-items-center">
            <i class="fa-solid fa-arrow-left"></i>&nbsp;
            <p @click="onBack" class="close-btn">Back</p>
          </div>
        </div>
        <div>
          <p @click="onCloseSidebar" class="close-btn">Close X</p>
        </div>
      </div>
      <slot></slot>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    hasBackButton: false,
    sidebarElementId: '',
    sidebarOpen: false,
    object: null,
    token: "",
  },
  watch: {
    sidebarOpen(val) {
      this.sidebarOpen = val;
    },

    sidebarElementId(val) {
      this.sidebarElementId = val;
    }
  },
  methods: {
    onCloseSidebar() {
      this.$emit("handleCloseSidebar", this.sidebarOpen);
    }, onBack() {
      this.$emit("handleBackSidebar");
    },
  }
};
</script>


