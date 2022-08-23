<template>
  <div>
    <div v-for="scene in scenes" :key="scene.id" class="scenes-control">
      <label @click="onClickSceneName(scene)" style="cursor: pointer;">{{ scene.name }}</label>
      <div class="summa-toggle">
        <input
          type="checkbox"
          :id="`scene-${scene.id}`"
          :checked="scene.id === group.scene_id"
          :value="scene.id"
          @click="onClickToggle"
        />
        <label :for="`scene-${scene.id}`" style="margin-bottom: 0; width: 45px">Scene</label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    scenes: [],
    group: null,
  },
  mounted() { },

  watch: {
    // group(val) {
    //   this.group = val;
    // }
  },

  created() { },

  data() {
    return {
      // group: null,
    };
  },

  methods: {
    onClickToggle(e) {
      const { value, checked } = e.target;
      this.$emit("handleToggle", { value, checked });
    },
    onClickSceneName(scene){
      this.$emit("clickSceneName", scene);
    },
  },
};
</script>

<style></style>
