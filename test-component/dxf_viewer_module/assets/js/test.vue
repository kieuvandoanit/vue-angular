<template>
  <div id="content">
    <h1>{{msg}}</h1>
    <!-- <img :src="vueImage.activeGroup" alt="aaaaa"> -->
  </div>
</template>

<style>
@import "../scss/style.css";
</style>

<script>

export default {
  props: ["msg",],
  data() {
    return {
    };
  },
  components: {
  },
  mounted() {
    console.log(this.$el)
    // this.$el.dispatchEvent(new CustomEvent('abc2', { detail: "abcs2" }));
    this.$emit("abc", {detail: "data ne"});
  },
};
</script>
