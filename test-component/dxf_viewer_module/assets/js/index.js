import Vue from "vue";
import vueCustomElement from "vue-custom-element";


Vue.use(vueCustomElement);
Vue.customElement(
    "vue-component",
    require("./root.vue").default
);


