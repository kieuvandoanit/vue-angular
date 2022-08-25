<template>
  <div class="floor-wrapper" v-bind:style="floorStyle">
    <!-- <p>aaaaaa{{ floor.full_name }}</p> -->
    <!-- <div class="floor-button">
      <button class="btn btn-info position-absolute" style="visibility: visible">Back</button>
    </div> -->
    <div style="height: 211px">
      <!-- <div class="floor-shadow" /> -->
      <!-- <svg
        width="428"
        height="211"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:svg="http://www.w3.org/2000/svg"
      >
        <path
          data-id="1"
          data-object="aaaa"
          class="main-path"
          style="fill: #828df8"
          d="m 0,101.80067 v 7.39862 c 0,4.1859 2.44813,7.97849 6.24551,9.67521 l 204.14012,91.21744 c 2.71898,1.21449 5.82133,1.21052 8.53768,-0.0106 L 421.77693,118.8819 C 425.56198,117.1799 428,113.39353 428,109.21637 v -7.43276 c 0,-4.177173 -2.43802,-7.963533 -6.22307,-9.665543 L 218.92331,0.91834351 c -2.71635,-1.221029 -5.8187,-1.224602 -8.53768,-0.0098 L 6.24551,92.125477 C 2.44813,93.822197 0,97.614767 0,101.80067 Z"
          id="path17"
        />
      </svg> -->

      <svg width="470" height="256" viewBox="0 0 470 256">
        <g filter="url(#filter0_dd_4067_7417)">
          <path
            data-id="1"
            data-object="aaaa"
            class="main-path"
            d="M25.1897 103.021V113.21C25.1897 116.374 27.0544 119.24 29.9466 120.523L232.391 210.297C234.461 211.216 236.825 211.213 238.893 210.29L440.07 120.529C442.953 119.242 444.81 116.38 444.81 113.223V103.008C444.81 99.8507 442.953 96.9887 440.07 95.7022L238.893 5.9407C236.825 5.01765 234.461 5.01496 232.391 5.9333L29.9466 95.7078C27.0544 96.9904 25.1897 99.8571 25.1897 103.021Z"
            fill="#828DF8"
          />
        </g>
        <defs>
          <filter
            id="filter0_dd_4067_7417"
            x="0.189697"
            y="0.246582"
            width="469.621"
            height="255.738"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="10" />
            <feGaussianBlur stdDeviation="5" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.121569 0 0 0 0 0.160784 0 0 0 0 0.215686 0 0 0 0.04 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_4067_7417"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="20" />
            <feGaussianBlur stdDeviation="12.5" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.121569 0 0 0 0 0.160784 0 0 0 0 0.215686 0 0 0 0.1 0"
            />
            <feBlend
              mode="normal"
              in2="effect1_dropShadow_4067_7417"
              result="effect2_dropShadow_4067_7417"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect2_dropShadow_4067_7417"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
      <button class="btn btn-info floor-button" @click="onFloorClick(floor)">
        {{ this.floor.full_name }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    index: null,
    floor: null,
    allFloors: [],
  },

  created() {},

  mounted() {

  },

  computed: {
    floorStyle() {
      let offset = 75;
      if (this.selectedFloorPosition === 1) {
        offset = 150;
      }

      return {
        top: `${offset * (this.allFloors.length - this.floor.position)}px`,
        "z-index": this.floor.position,
      };
    },
  },

  data() {
    return {
      selectedFloor: null,
      selectedFloorPosition: 0,
    };
  },

  methods: {
    onSvgClick(e) {
      // console.log("jasdjaslkdajld");
      this.selectedFloorPosition = 1;
    },

    onFloorClick(v) {
      this.$emit("handleFloorItemClick", v);
    },
  },
};
</script>
