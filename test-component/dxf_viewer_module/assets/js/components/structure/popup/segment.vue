<template>
  <div class="segment">
    <div
      v-for="(tabData, i) in data"
      :key="tabData"
      :class="{ active: currentTabData === tabData }"
      @click="changeIndex(tabData, i)"
    >
      <div :class="{ active: currentTabData === tabData }">{{ tabData }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: () => {},
    },
    currentTab: {
      type: String,
      default: "",
    },
    mainColor: {
      type: String,
      default: "",
    },
    maxWidth: {
      type: String,
      default: "",
    },
  },

  watch: {
    currentTab(val) {
      this.currentTabData = val;
    },
  },

  data() {
    return {
      currentIndex: 0,
      currentTabData: this.currentTab,
    };
  },

  methods: {
    changeIndex(data, index) {
      this.currentIndex = index;
      this.currentTabData = data;

      this.$emit("onChangeTab", {
        index,
        tab: data,
      });
    },
  },
};
</script>
