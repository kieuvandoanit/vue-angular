<template>
  <div class="nav">
    <ul>
      <li
        v-for="building in data"
        :key="building.id"
        @click="selectBuilding(building)"
      >
        <template v-if="building.full_name">
          <i class="fa-solid fa-layer-group"></i>
          <span>{{ building.full_name }}</span>
        </template>
        <template v-else>
          <i class="fa-solid fa-building"></i>
          <span>{{ building.name }}</span>
        </template>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    data: {},
  },

  mounted() {},
  watch: {},
  data() {
    return {
      
    };
  },

  methods: {
    selectBuilding(building) {
      this.$emit("selectBuilding", building);
    },
  },
};
</script>
