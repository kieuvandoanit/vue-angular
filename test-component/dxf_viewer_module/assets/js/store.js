import Vue from "vue";

export const EventBus = new Vue();

export const store = Vue.observable({
  amountPeople: 0,
  activeLivePosition: false,
  isShowFloorStackSelector: true,
  currentNav: "",
  selectedFloorplan: null,
  popup: false,
  selectedGroup: null,
  selectedObjects: null,
  selectedScene: null,
  isMoveGroup: false,
  isMoveAllInGroup: false,
});

export const storeFunctions = {
  setAmountPeople(val) {
    store.amountPeople = val;
  },

  setActiveLivePosition(val) {
    store.activeLivePosition = val;
  },

  setShowFloorStackSelector(val) {
    store.isShowFloorStackSelector = val;
  },

  setCurrentNav(val) {
    store.currentNav = val;
  },

  setSelectedFloorplan(val) {
    store.selectedFloorplan = val;
  },
  setPopup(val) {
    store.popup = val;
  },
  setSelectedGroup(val) {
    store.selectedGroup = val;
  },
  setSelectedObjects(val) {
    store.selectedObjects = val;
  },
  setSelectedScene(val) {
    store.selectedScene = val;
  },
  setIsMoveGroup(val) {
    store.isMoveGroup = val;
    if (val) {
      store.isMoveAllInGroup = !val;
    }
  },
  setIsMoveAllInGroup(val) {
    store.isMoveAllInGroup = val;
    if (val) {
      store.isMoveGroup = !val;
    }
  },
};
