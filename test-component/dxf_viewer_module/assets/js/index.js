import Vue from "vue";
import vueCustomElement from "vue-custom-element";

Vue.use(vueCustomElement);
Vue.customElement("summa-floorplan", require("./root.vue").default);
// Vue.customElement("test-component", require("./test.vue").default)
