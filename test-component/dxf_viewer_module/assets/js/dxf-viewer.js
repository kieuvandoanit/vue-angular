import { Viewer } from "../../src/js/Viewer";
import { storeFunctions } from "./store.js";

(function () {
  // your page initialization code here
  // the DOM will be available here

  document.addEventListener("DOMContentLoaded", function () {
    if (window.location.search.includes("floor")) {
      // let button = document.getElementById("back-button");
      let heatmap_button = document.getElementById("heatmap-button");
      let tracking_button = document.getElementById("tracking-button");
      let container = document.getElementById("dxfviewer-container");
      let sidebarTracking = document.getElementById("sidebar-tracking");
      let sidebarHeatmap = document.getElementById("sidebar-heatmap");
      let totalPeopleDom = document.getElementById("analysis-heading-value");
      let listPeople = document.getElementById("list-people").getElementsByTagName('li');
      let trackingPeopleButton = document.getElementById("tracking-people");
      let sidebarPeopleTracking = document.getElementById(
        "sidebar-people-tracking"
      );
      let boxSearchDate = document.getElementById("box-search-date");

      let peopleTrackingNumber = document.getElementById(
        "peopleTrackingNumber"
      );
      let peopleHeatMapNumber = document.getElementById("peopleHeatMapNumber");
      let peoplePositionNumber = document.getElementById(
        "peoplePositionNumber"
      );

      if (container) {
        let file = JSON.parse(container.dataset["floor"]);
        let groups = JSON.parse(container.dataset["groups"]);
        let devices = JSON.parse(container.dataset["devices"]);
        let heatmap = JSON.parse(container.dataset["heatmap"]);
        let peoples = container.dataset["peoples"];
        let peoplePositions = JSON.parse(container.dataset["peoplepositions"]);
        let heatmapAreas = JSON.parse(container.dataset["heatmapareas"]);
        let token = container.dataset["token"];
        let api = container.dataset["api"];
        heatmapAreas = heatmapAreas.map((e) => ({ ...e, id: e.area_id }));
        let trackingPplInterval = null;

        peoples = peoples.replace(/'/g, '"');
        peoples = JSON.parse(peoples);
        if (Object.keys(file).length > 0) {
          let viewer = new Viewer(
            container,
            [],
            groups,
            devices,
            [],
            file,
            heatmap,
            "#212C40",
          );

          window.viewer = viewer;

          viewer.peoples = peoples;
          viewer.peoplePositions = peoplePositions;
          viewer.heatMapPositions = heatmapAreas;
          viewer.Load(file.download_url);

          const ids = getPeopleIds(".select-people");
          viewer.setTrackingPeople(ids);
          // totalPeopleDom.innerText = peoples.length;
          storeFunctions.setAmountPeople(peoples.length);

          viewer.dblClickCallback = (v) => {
            if (v.activeGroup != null) {
              button.style.visibility = "visible";
            }
          };
          // button.addEventListener("click", (e) => {
          //   viewer.onBack();
          //   if (viewer.activeGroup == null) {
          //     button.style.visibility = "hidden";
          //   }
          // });
          // addEventListener when hovering li
          for (let i = 0; i < listPeople.length; i++) {
            listPeople[i].addEventListener("mouseover", (e) => {
              if (e.target.children[1] && e.target.children[1].children[0]) {
                viewer.setVisiblePerson(e.target.children[1].children[0].value);
              }
            });

            listPeople[i].addEventListener("mouseleave", (e) => {
              viewer.setVisiblePerson(null);
            });
          }

          heatmap_button.addEventListener("click", (e) => {
            tracking_button.classList.remove("active");
            trackingPeopleButton.classList.remove("active");
            heatmap_button.classList.add("active");
            sidebarHeatmap.style.display = "block";
            sidebarTracking.style.display = "none";
            sidebarPeopleTracking.style.display = "none";
            boxSearchDate.style.display = "block";

            const ids = getPeopleIds(".select-area");
            viewer.setHeatMapPositionId(ids);
            const totalPeople = heatmapAreas.reduce(
              (previousValue, currentItem) =>
                previousValue + parseInt(currentItem.amount_people, 10),
              0
            );
            // totalPeopleDom.innerText = totalPeople;
            storeFunctions.setAmountPeople(totalPeople);
            storeFunctions.setActiveLivePosition(false);
          });
          tracking_button.addEventListener("click", (e) => {
            boxSearchDate.style.display = "block";
            heatmap_button.classList.remove("active");
            trackingPeopleButton.classList.remove("active");
            tracking_button.classList.add("active");
            sidebarPeopleTracking.style.display = "none";
            sidebarHeatmap.style.display = "none";
            sidebarTracking.style.display = "block";

            const ids = getPeopleIds(".select-people");
            viewer.setTrackingPeople(ids);
            // totalPeopleDom.innerText = peoples.length;
            storeFunctions.setAmountPeople(peoples.length);
            storeFunctions.setActiveLivePosition(false);
          });
          trackingPeopleButton.addEventListener("click", (e) => {
            boxSearchDate.style.display = "none";
            heatmap_button.classList.remove("active");
            tracking_button.classList.remove("active");
            trackingPeopleButton.classList.add("active");
            sidebarPeopleTracking.style.display = "block";
            sidebarHeatmap.style.display = "none";
            sidebarTracking.style.display = "none";

            const ids = getPeopleIds(".select-people-tracking");
            viewer.setPeoplePositionId(ids);
            // totalPeopleDom.innerText = peoplePositions.length;
            storeFunctions.setAmountPeople(peoplePositions.length);
            storeFunctions.setActiveLivePosition(true);
          });

          $(".select-people").on("change", function (e) {
            get_people(viewer);
          });

          $(".select-people-tracking").on("change", function (e) {
            const ids = getPeopleIds(".select-people-tracking");
            viewer.setPeoplePositionId(ids);
          });

          $(".select-area").on("change", function (e) {
            const ids = getPeopleIds(".select-area");
            viewer.setHeatMapPositionId(ids);
          });

          $("#switch-heatmap-all").on("change", function (e) {
            if ($(this).prop("checked") === true) {
              $(".select-area").prop("checked", true);
            }
            if ($(this).prop("checked") === false) {
              $(".select-area").prop("checked", false);
            }
            const ids = getPeopleIds(".select-area");
            viewer.setHeatMapPositionId(ids);
          });
          $("#switch-people-tracking-all").on("change", function (e) {
            if ($(this).prop("checked") === true) {
              $(".select-people").prop("checked", true);
            }
            if ($(this).prop("checked") === false) {
              $(".select-people").prop("checked", false);
            }
            const ids = getPeopleIds(".select-people");
            viewer.setTrackingPeople(ids);
          });
          $("#switch-people-position-all").on("change", function (e) {
            if ($(this).prop("checked") === true) {
              $(".select-people-tracking").prop("checked", true);
            }
            if ($(this).prop("checked") === false) {
              $(".select-people-tracking").prop("checked", false);
            }
            const ids = getPeopleIds(".select-people-tracking");
            viewer.setPeoplePositionId(ids);
          });
          // select_people.addEventListener("change", (e) => {
          //   heatmap_button.checked = false;
          //   if (Number(select_people.value)) {
          //     viewer.setTrackingPeople(Number(select_people.value));
          //   }
          // });
        }
      }
    }
  });

  function refreshTrackingPeople(viewer, floorId, api, token) {
    $.ajax({
      url: `${api}/files/${floorId}/analytics_people_position`,
      dataType: "json",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", token);
      },
    })
      .done(function (data) {
        viewer.updatePeoplePositionData(data);
      })
      .fail(function () {
        // console.log("error");
      });
  }

  function get_people(viewer) {
    const people = $(".select-people");
    const ids = [];
    for (let i = 0; i < people.length; i++) {
      if (people[i].checked) {
        ids.push(Number(people[i].value));
      }
    }
    viewer.setTrackingPeople(ids);
  }

  function getPeopleIds(selector) {
    const people = $(selector);
    const ids = [];
    for (let i = 0; i < people.length; i++) {
      if (people[i].checked) {
        ids.push(Number(people[i].value));
      }
    }
    return ids;
  }

  function get_heatmap(viewer) {
    const devices = $(".select-devices");
    const ids = [];
    for (let i = 0; i < devices.length; i++) {
      if (devices[i].checked) {
        ids.push(Number(devices[i].value));
      }
    }
    viewer.setVisibleHeatMaps(ids);
  }
})();
