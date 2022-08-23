<template>
    <div class="layout-center">
        <div class="form-update">
            <div class="title">
                <h4>
                    Edit Floorplan For Building:
                    <b>
                        <i>{{ computedBuilding.name }}</i>
                    </b>
                </h4>
            </div>
            <form @submit.prevent="editFloor" autocomplete="off">
                <div class="row">
                    <div class="col-lg-12 col-sm-12">
                        <label for="name" class="form-label">
                            Floor Name &nbsp;
                            <i class="fa fa-question-circle" aria-hidden="true"></i>
                        </label>
                        <input
                            type="text"
                            class="form-control"
                            id="full_name"
                            name="full_name"
                            placeholder="Floor Name"
                            required
                            v-model="floorplan.full_name"
                        />
                    </div>
                    <div class="col-lg-12 col-sm-12">
                        <label for="name" class="form-label">
                            Floor Number &nbsp;
                            <i class="fa fa-question-circle" aria-hidden="true"></i>
                        </label>
                        <input
                            type="text"
                            class="form-control"
                            id="short_name"
                            name="short_name"
                            placeholder="Floor Number"
                            required
                            v-model="floorplan.short_name"
                        />
                    </div>
                    <div class="col-lg-12 col-sm-12">
                        <label for="name" class="form-label">
                            Floor Position &nbsp;
                            <i
                                class="fa fa-question-circle"
                                aria-hidden="true"
                            ></i>
                        </label>
                        <input
                            type="text"
                            class="form-control"
                            id="position"
                            name="position"
                            placeholder="Floor Position"
                            required
                            v-model="floorplan.position"
                        />
                    </div>
                    <div class="col-lg-12 col-sm-12">
                        <label for="name" class="form-label">
                            Floor Layer Name &nbsp;
                            <i
                                class="fa fa-question-circle"
                                aria-hidden="true"
                            ></i>
                        </label>
                        <select class="form-select plain-select" v-model="floorplan.floor_layer_name">
                            <option v-for="option in floorplan.layer_names" :key="option">{{option}}</option>
                        </select>
                    </div>
                    <div class="col-lg-12 col-sm-12">
                        <label for="name" class="form-label">
                            Sensor Layer Name &nbsp;
                            <i
                                class="fa fa-question-circle"
                                aria-hidden="true"
                            ></i>
                        </label>
                        <select class="form-select plain-select" v-model="floorplan.sensor_layer_name">
                            <option v-for="option in floorplan.layer_names" :key="option">{{option}}</option>
                        </select>
                    </div>
                    <div class="col-lg-12 col-sm-12">
                        <label for="name" class="form-label">
                            Fixture Layer Name &nbsp;
                            <i
                                class="fa fa-question-circle"
                                aria-hidden="true"
                            ></i>
                        </label>
                        <select class="form-select plain-select" v-model="floorplan.fixture_layer_name">
                            <option v-for="option in floorplan.layer_names" :key="option">{{option}}</option>
                        </select>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
const axios = require("axios").default;
import { API_DOMAIN_MANIFERA } from "../../../constant.js";
import { EventBus } from '../../../store.js';

export default {
    props: {
        token: "",
        building: {
            type: Object,
            default() {
                return {};
            }
        },
        floorplan: {
            type: Object,
            default() {
                return {};
            }
        },
    },

    mounted() {
    },

    computed: {
        computedBuilding() {
            return this.building;
        },
        seletedFloorplan() {
            return this.floorplan;
        },
    },

    created() {
        this.$parent.$on('edit_floor', (data) => {
            this.editFloor();
        });
    },

    data() {
        return {
        };
    },

    methods: {
        async editFloor() {
            const token = this.token || "";
            axios.defaults.headers.common["Authorization"] = token;
            axios.defaults.headers.post["Content-Type"] =
                "application/x-www-form-urlencoded";

            await axios
                .put(
                    `${API_DOMAIN_MANIFERA}/api/v1/files/${this.floorplan.id}`, this.floorplan
                )
                .then((response) => {
                    // window.location.reload();
                    // this.$parent.$children[1].updateTitleTreeNode(response.data)
                    EventBus.$emit("updateFloorData");
                    this.$emit("back");
                })
                .catch((error) => {
                    // handle error
                    alert('Failed to update floorplan');
                })
        },
    },
};
</script>
