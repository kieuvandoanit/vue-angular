<template>
  <div>
    <p>Chao {{this.name}}</p>
    <a href="https://youtube.com">Youtube</a>  
  </div>
  
</template>

<script>
// import 
export default {
  props: {
    name: {}
  },
  
  mounted() {
    const device = {
      name: "Device 1",
      serial: "12324412"
    }
    console.log(this.name)
    this.$emit("saveDevice", device);
  },

  data() {
    return {
      
    };
  },
  watch: {},
  
  created() {

  },

  methods: {
    
  },
};
</script>
