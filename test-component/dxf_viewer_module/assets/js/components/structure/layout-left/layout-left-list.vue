<template>
  <div class="contain-list" ref="width">
    <div class="d-flex middle">
      <div class="d-flex box-title" v-bind:style="widthLeft">
        <!-- <div class="expanded-view" v-show="expanded" @click="compactClick()">
          <i class="fa-solid fa-arrow-left"></i> &nbsp;Compact View
        </div> -->
        <div class="title">Floorplans</div>
        <!-- <div class="expanded-view" v-show="!expanded" @click="expandedClick()">
          Expanded View&nbsp;<i class="fa-solid fa-arrow-right"></i>
        </div> -->
      </div>
      <div></div>
    </div>
    <div class="table-floors">
      <SlVueTree ref="tree_nodes" v-model="computedNodes">
        <template slot="toggle" slot-scope="{ node }">
          <span v-if="!node.isLeaf">
            <div v-if="node.isExpanded" id="chevron-arrow-down"></div>
            <div v-if="!node.isExpanded" id="chevron-arrow-right"></div>
          </span>
        </template>
        <!-- <div class="d-flex"> -->
        <template slot="title" slot-scope="{ node }">
          <!-- <v-icon v-else-if="node.data.type == 'floorplan'">insert_drive_file</v-icon> -->
          <img
              v-if="
                node.data.type == 'Group' &&
                (node.isLeaf == false || node.level == 2)
              "
              src="/assets/icons/menu.svg"
              width="18"
              height="18"
              class="v-icon dark-mode-icon"
            />

            <img
              v-if="node.data.type == 'Group' && node.isLeaf && node.level != 2"
              src="/assets/imgs/group.svg"
              width="18"
              height="18"
              class="v-icon dark-mode-icon"
            />

            <img
              v-else-if="node.data.type == 'Floorplan'"
              src="/assets/icons/layer.svg"
              width="18"
              height="18"
              class="v-icon dark-mode-icon"
            />
          <button
            flat
            small
            class="btn btn-light btn-tree"
            @click="onItemClick(node.data)"
          >
            <div class="tree-title">
              &nbsp;{{
                node.data.type == "Group" ? node.data.name : node.data.full_name
              }}
              <!-- <template v-if="node.data.type == 'building'">
                <b>(Address:</b> {{ node.data.address }})
              </template> -->
            </div>
          </button>
          <!-- <button v-else flat small class="group-btn">
            <span>{{ node.title }}</span>
          </button> -->
          <!-- <a style="text-decoration: none; color: black" :href="`/main/groups/${node.data.id}/edit`">{{ node.title }}</a> -->
        </template>
        <!-- </div> -->
      </SlVueTree>
      <!-- <button
        style="float: right"
        type="button"
        v-show="!expanded"
        class="btn btn-primary"
        @click="addFloor"
      >
        <i class="fa-solid fa-plus"></i> &nbsp;Create floorplan
      </button> -->
    </div>
    <!-- <Modal
      :show="showFloorplanModal"
      header="Remove Floorplan"
      :body="`Are you sure you want to remove floorplan <b>${
        this.selectedFloor ? this.selectedFloor.full_name : ''
      }</b> ?`"
      :loading="loading"
      :error="errorMessage"
      @no="showFloorplanModal = false"
      @yes="deleteFloor"
    >
    </Modal> -->
  </div>
</template>

<script>
import SlVueTree from "sl-vue-tree";
import Modal from "../popup/modal.vue";
import { API_DOMAIN_MANIFERA } from "../../../constant.js";
import { store, storeFunctions, EventBus } from "../../../store.js";
export default {
  components: {
    SlVueTree,
    Modal,
  },
  props: {
    // building: {
    //   default() {
    //     return {};
    //   },
    // },
    groups: {
      default() {
        return [];
      },
    },
    floors: {
      default() {
        return [];
      },
    },
    expanded: {
      default() {
        return false;
      },
    },
    token: "",
  },

  mounted() {},
  watch: {
    groups(val) {
      this.groupData = val;
    },
    selectedFloorplan(val) {
      this.selectedFloor = val || {};
    },
    // building(val) {
    //   // console.log("building: ", val);
    //   if (
    //     val &&
    //     (!this.selectedBuilding || this.selectedBuilding.id != val.id)
    //   ) {
    //     this.selectedBuilding = val;
    //     // this.getFloors();
    //   }
    // },
  },
  data() {
    return {
      showFloorplanModal: false,
      loading: false,
      errorMessage: "",
      groupData: [],
      widthLeft: {},
      currentSortDir: "asc",
      currentSort: "",
      nodes: [],
      selectedFloor: {},
      floorData: [],
    };
  },

  computed: {
    selectedFloorplan() {
      return store.selectedFloorplan;
    },
    sortedFloors: function () {
      let floorplans = this.floors;
      if (floorplans) {
        return floorplans.sort((a, b) => {
          let modifier = 1;
          if (this.currentSortDir === "desc") modifier = -1;
          if (a[this.currentSort] < b[this.currentSort]) return -1 * modifier;
          if (a[this.currentSort] > b[this.currentSort]) return 1 * modifier;
          return 0;
        });
      } else {
        return [];
      }
    },
    computedNodes() {
      return this.getNodes();
    },
  },

  methods: {
    sort(sortBy) {
      //if s == current sort, reverse
      if (sortBy === this.currentSort) {
        this.currentSortDir = this.currentSortDir === "asc" ? "desc" : "asc";
      }
      this.currentSort = sortBy;
    },
    onClickFloor(v) {
      this.$emit("handleClickFloorName", v);
    },
    getGroup(id) {
      let group = this.groups.filter((g) => g.id === id);
      return group.length > 0 ? group[0] : null;
    },
    getFloorplansByBuilding(id) {
      return this.floors.filter((f) => f.building_id === id);
    },
    getGroupsByBuilding(id) {
      return this.groups.filter((g) => g.building_id === id);
    },
    getGroupsByFile(id) {
      return this.groups.filter((f) => f.file_id === id);
    },
    parseGroup(id) {
      const group = this.getGroup(id);
      if (!group) {
        return null;
      }
      group["data"] = {
        navigator: "groups",
        ...group,
      };
      group["data"] = { ...group["data"], ...group };
      // group['groups'] = [];
      group["isLeaf"] = true;
      group["isExpanded"] = false;
      // group["isSelected"] = store.selectedGroup ? store.selectedGroup.id == id : false;
      group["isDraggable"] = false;
      group["title"] = group.name;
      if (group.group_ids.length > 0 || group.device_ids.length > 0) {
        group["children"] = [];
        for (let i = 0; i < group.group_ids.length; i++) {
          let child = this.parseGroup(group.group_ids[i]);
          if (child) {
            group["isLeaf"] = false;
            group["isExpanded"] = true;
            group["children"].push(child);
          }
          // group['groups'][i] = this.parseGroup(group.group_ids[i]);
        }
      } else {
        // isleaf
        group["isLeaf"] = true;
      }
      return group;
    },
    groupDataByFile(id) {
      let groupNodes = [];
      let childGroups = [];
      let filteredGroup = this.getGroupsByFile(id);

      if (filteredGroup.length > 0) {
        filteredGroup.forEach((group) => {
          childGroups.push(...group.group_ids);
        });

        filteredGroup.forEach((group) => {
          if (!childGroups.includes(group.id)) {
            groupNodes.push(this.parseGroup(group.id));
          }
        });
      }
      return groupNodes;
    },
    getNodes() {
      this.nodes = [];
      let floorplans = this.floors;

      floorplans.forEach((floorplan) => {
        let newFloorplan = floorplan;
        newFloorplan["type"] = "Floorplan";
        newFloorplan["navigator"] = "files";
        let groupNodes = this.groupDataByFile(floorplan.id);

        let data = {
          title: newFloorplan.full_name,
          isDraggable: false,
          isExpanded: this.selectedFloor.id == floorplan.id,
          isSelected: this.selectedFloor.id == floorplan.id,
          children: groupNodes,
          isLeaf: groupNodes.length == 0,
          data: newFloorplan,
        };
        this.nodes.push(data);
      });
      return this.nodes;
    },
    expandedClick() {
      this.$emit("expandedClick");
      // this.$root.$children[0].popup = false;
      storeFunctions.setPopup(false);
      // this.$root.$children[0].floorData = null;
      // this.$root.$children[0].groupData = {};
      storeFunctions.setSelectedGroup(null);
      this.widthLeft = { width: "285px" };
    },
    compactClick() {
      this.$emit("compactClick");
      this.widthLeft = { width: "100%" };
    },
    groupClick(obj) {
      this.$emit("layoutGroup", obj);
    },
    addGroup(obj) {
      this.$emit("addGroup", obj);
    },
    addFloor() {
      this.$emit("addFloor");
    },
    editFloor(obj) {
      this.$emit("editFloor", obj);
    },
    // async deleteFloor() {
    //   const token = this.token || "";
    //   axios.defaults.headers.common["Authorization"] = token;
    //   axios.defaults.headers.post["Content-Type"] =
    //     "application/x-www-form-urlencoded";
    //   this.loading = true;
    //   await axios
    //     .delete(`${API_DOMAIN_MANIFERA}/api/v1/files/${this.selectedFloor.id}`)
    //     .then((response) => {
    //       this.showFloorplanModal = false;
    //       this.getFloors();
    //       this.loading = false;
    //     })
    //     .catch((error) => {
    //       // handle error
    //       this.errorMessage = "Failed to delete floorplan";
    //     });
    //   this.loading = false;
    // },
    // async getFloors() {
    //   axios.defaults.headers.common["Authorization"] = this.token;
    //   axios.defaults.headers.post["Content-Type"] =
    //     "application/x-www-form-urlencoded";
    //   this.loading = true;
    //   await axios
    //     .get(
    //       `${API_DOMAIN_MANIFERA}/api/v1/files?building_id=${this.building.id}`
    //     )
    //     .then((response) => {
    //       this.$parent.back();
    //       this.floors = response.data;
    //       this.$emit("onFloorsChange", response.data);
    //       this.loading = false;
    //     })
    //     .catch((error) => {});
    //   this.loading = false;
    // },
    onItemClick(obj) {
      if (obj.type == "Group") {
        let selectedFloor = this.floors.filter((f) => f.id == obj.file_id);
        if (selectedFloor.length > 0) {
          this.selectedFloor = selectedFloor[0];
          storeFunctions.setSelectedFloorplan(this.selectedFloor);
          EventBus.$emit("handleItemClick", obj, this.selectedFloor);
        } else {
          EventBus.$emit("handleItemClick", obj, null);
        }
      } else {
        let selectedFloor = this.floors.filter((f) => f.id == obj.id);
        if (selectedFloor.length > 0) {
          this.selectedFloor = selectedFloor[0];
        }
        EventBus.$emit("handleItemClick", obj, null);
      }
    },
    updateGroups(newGroups) {
      let oldGroups = [];
      let addedGroups = [];
      let recentlyAddedGroups = {};
      let groupByFile = {};
      let fileId = 0;

      if (newGroups.length > 0) {
        fileId = newGroups[0].file_id;
      }

      this.groups.forEach((group) => {
        if (!addedGroups.includes(group.id)) {
          addedGroups.push(group.id);
        }
        if (!groupByFile[group.file_id]) {
          groupByFile[group.file_id] = [];
        } else {
          groupByFile[group.file_id].push(group);
        }
      });

      newGroups.forEach((group) => {
        if (!addedGroups.includes(group.id)) {
          recentlyAddedGroups[group.id] = group;
        }
      });

      this.groups.forEach((group) => {
        let newGroup = newGroups.find((g) => g.id == group.id);
        if (newGroup) {
          oldGroups.push({ ...group, ...newGroup });
        } else {
          let deletedGroup = [];
          if (fileId && fileId == group.file_id) {
            let fileGroups = groupByFile[group.file_id];
            if (fileGroups.length > 0) {
              fileGroups.forEach((g) => {
                let findGroup = newGroups.find(
                  (newGroup) => g.id == newGroup.id
                );
                if (!findGroup && !deletedGroup.includes(g.id)) {
                  deletedGroup.push(g.id);
                }
              });
            }
          }

          if (!deletedGroup.includes(group.id)) {
            oldGroups.push(group);
          }
        }
      });

      if (Object.keys(recentlyAddedGroups).length > 0) {
        Object.values(recentlyAddedGroups).forEach((group) => {
          oldGroups.push(group);
        });
      }

      this.groups = oldGroups;
    },

    // updateFloorData() {
    //   this.$parent.back();
    //   this.getFloors();
    // },

    updateSelectedGroup(groups, floorplan) {
      let groupIds = [];

      if (groups.length) {
        groups.forEach((group) => {
          groupIds.push(group.id);
        });
      }
      this.$refs.tree_nodes.traverse((node, nodeModel, path) => {
        if (groups.length > 0) {
          if (node.data.type == "Group" && groupIds.includes(node.data.id)) {
            this.$refs.tree_nodes.select(node.path, groups.length !== 1);
          }
        } else {
          if (
            floorplan &&
            node.data.type == "Floorplan" &&
            node.data.id == floorplan.id
          ) {
            this.$refs.tree_nodes.select(node.path, false);
          }
        }
      });
    },

    updateTitleTreeNode(data) {
      this.$parent.back();
      this.$refs.tree_nodes.traverse((node, nodeModel, path) => {
        // console.log(data);
        data.forEach((d) => {
          if (node.data.id == d.id && node.data.type == "Floorplan") {
            this.$refs.tree_nodes.updateNode(node.path, {
              data: {
                ...d,
                navigator: node.data.navigator,
              },
            });
          }
        });
      });
    },
    updateTreeNode(data) {
      this.$refs.tree_nodes.traverse((node, nodeModel, path) => {
        data.forEach((d) => {
          if (node.data.id == d.id && node.data.type == "Group") {
            this.$refs.tree_nodes.updateNode(node.path, {
              data: {
                ...d,
                navigator: node.data.navigator,
              },
            });
          }
        });
      });
    },
  },
  created() {
    EventBus.$on("updateTreeNode", this.updateTreeNode);
    EventBus.$on("updateGroups", this.updateGroups);
    EventBus.$on("updateFloorData", this.updateFloorData);
    EventBus.$on("updateSelectedGroup", this.updateSelectedGroup);
    EventBus.$on("compactClick", this.compactClick);
  },
  destroyed() {
    EventBus.$off("updateTreeNode", this.updateTreeNode);
    EventBus.$off("updateGroups", this.updateGroups);
    // EventBus.$off("updateFloorData", this.updateFloorData);
    EventBus.$off("updateSelectedGroup", this.updateSelectedGroup);
    EventBus.$off("compactClick", this.compactClick);
  },
};
</script>
