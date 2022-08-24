<template>
  <div>
    <div class="canvasContainer" ref="canvasContainer"></div>
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2"> Add group </v-card-title>

        <v-card-text>
          <template>
            <v-form v-model="valid" ref="form" lazy-validation>
              <v-text-field
                label="Group Name"
                data-vv-name="group name"
                v-model="group.name"
                v-validate="'required'"
                :error-messages="errors.collect('group name')"
                required
              ></v-text-field>
            </v-form>
          </template>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="cancel"> No </v-btn>
          <v-btn text> Yes </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { DxfViewer } from "@/components/DxfViewer/DxfViewer";
import * as THREE from "three";
import * as Draw from "./DxfDrawCore";
import DxfViewerWorker from "worker-loader!./DxfViewerWorker";
import { readDevices, readGroups, readAreas } from "@/store/main/getters";
const fontJson = require("./helvetiker_regular.typeface");

const font = new THREE.Font(fontJson);
const wbox = 10000;
const wworld = 100000;
const planeshow = false;
const lightSize = 200;
const icoUnscanLight = new THREE.TextureLoader().load("/icons/unscanlight.png");
const icoScanLight = new THREE.TextureLoader().load("/icons/scanlight.png");
const icoSelectLight = new THREE.TextureLoader().load("/icons/selectlight.png");
const icoUnscanSelectedLight = new THREE.TextureLoader().load(
  "/icons/unscanselected.png"
);
const iconSelectSensor = new THREE.TextureLoader().load(
  "/icons/selectsensor.png"
);
const icoGroup = new THREE.TextureLoader().load("/icons/group.png");
const iconSelectGroup = new THREE.TextureLoader().load(
  "/icons/selectgroup.png"
);
const iconSelectUnscanSensor = new THREE.TextureLoader().load(
  "/icons/selectunscansensor.png"
);
const icoActiveGroup = new THREE.TextureLoader().load("/icons/activegroup.png");
const icoSensor = new THREE.TextureLoader().load("/icons/sensor.png");

const groupTypes = ["Group", "Room", "Floor"];
const deviceTypes = ["fixture", "sensor"];

const deviceTypeName = {
  fixture: "devices",
  sensor: "devices",
  Group: "Group",
  Room: "Group",
  Floor: "Group",
};

const testArea = [
  {
    id: 1,
    height: 10517.418738862114,
    name: "New area 1",
    type: "area",
    width: 10072.451022987178,
    x: 35212.20985054451,
    y: 20580.833876430566,
  },
  {
    id: 2,
    height: 5218.260227867339,
    name: "New area 2",
    type: "area",
    width: 5380.064201033314,
    x: 57703.30198921416,
    y: 30976.898347285958,
  },
];

let deviceByKeys = {};

const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(wworld, wworld),
  new THREE.MeshBasicMaterial({ color: "#e6ecf7", visible: planeshow })
);
plane.position.z = -1;
plane.name = "plane";

const gridHelper = new THREE.GridHelper(wworld, 20);
gridHelper.rotateX(-Math.PI / 2);
gridHelper.position.z = -7500;

const canvasObjects = {
  activeList: [],
  objects: [],
  // :ojection helper
  raycaster: new THREE.Raycaster(),
  plane,
  grid: gridHelper,
  isMove: false,
  startPos: null,
  movingMess: null,
  movingOffset: { x: 0, y: 0 },
  resizeMode: false,
  resizeStartPos: null,
  movingObject: { intersects: null },
  selectedGroup: null,
  preSelectedGroup: null,
  resizeBoxes: [],
  // Sensor
  selectedSensor: null,
  sensorGridCells: [],
  sensorSelectedCells: [],
  // Select multi object
  selectedObjects: [],
};

const eventNames = [
  "loaded",
  "cleared",
  "destroyed",
  "resized",
  "pointerdown",
  "pointerup",
  "viewChanged",
  // "dblclick",
];

/** Events: all DxfViewer supported events (see DxfViewer.Subscribe()), prefixed with "dxf-". */
export default {
  // name: "DxfViewer",

  props: {
    dxfUrl: {
      default: null,
    },
    /** List of font URLs. Files should have TTF format. Fonts are used in the specified order,
     * each one is checked until necessary glyph is found. Text is not rendered if fonts are not
     * specified.
     */
    fonts: {
      default: null,
    },
    onShapeClick: {
      default: null,
    },
    areaMode: {
      default: false,
    },
    onClick: {
      default: null,
    },
    onShowHeatGrid: {
      default: null,
    },
    onHideHeatGrid: {
      default: null,
    },
    onUpdateHeatGrid: {
      default: null,
    },
    onDblclick: {
      default: null,
    },
    // devices: {
    //   default() {
    //     return [];
    //   },
    // },
    // groups: {
    //   default() {
    //     return [];
    //   },
    // },
    groupedDevices: {
      default() {
        return [];
      },
    },
    visibleGroups: {
      default() {
        return [];
      },
    },
    deviceType: {
      default: "fixture",
    },
    visibleDevices: {
      default: null,
    },
    options: {
      default() {
        return {
          clearColor: new THREE.Color("#fff"),
          autoResize: true,
          colorCorrection: true,
        };
      },
    },
    file: {
      default: null,
    },
    testPositions: {
      default() {
        return [];
      },
    },
  },

  data() {
    return {
      isLoading: false,
      progress: null,
      progressText: null,
      curProgressPhase: null,
      error: null,
      groups: [],
      devices: [],
      areas: [],
      addMode: false,
      sensorMode: true,
      dialog: false,
      newGroup: null,
      valid: false,
      group: {
        name: null,
      },
      test: [],
      listSelect: [],
      creatingArea: null,
      // tested: [
      //   {
      //     id: 1555,
      //     x: 56286,
      //     y: 22089,
      //     angle: 90,
      //     serial_number: "1sgfddfg234",
      //     type: "sensor",
      //     selected_cells: [11, 12, 13, 14, 15],
      //     ceil_height: 270,
      //   },
      //   {
      //     id: 1556,
      //     x: 54486,
      //     y: 22089,
      //     angle: 60,
      //     serial_number: "1sgfddfg",
      //     selected_cells: [11, 12, 13, 14, 20, 21],
      //     type: "sensor",
      //     ceil_height: 200,
      //   },
      //   {
      //     id: 1557,
      //     x: 54486,
      //     y: 21089,
      //     angle: 90,
      //     serial_number: "",
      //     selected_cells: [11, 12, 13, 14, 20, 21],
      //     type: "sensor",
      //     ceil_height: 270,
      //   },
      // ],
    };
  },

  watch: {
    async dxfUrl(dxfUrl) {
      if (dxfUrl) {
        await this.Load(dxfUrl);
      } else {
        this.dxfViewer.Clear();
        this.error = null;
        this.isLoading = false;
        this.progress = null;
      }
    },

    testPositions(newPosition) {
      if (!this.dxfViewer) {
        return;
      }
      this.drawPosition(this.dxfViewer.origin, newPosition);
    },

    devices(newDevices) {
      if (!this.dxfViewer) {
        return;
      }
      deviceByKeys = newDevices.reduce(
        (a, v) => ({ ...a, [this.getMeshName(v)]: v }),
        {}
      );
      this.drawFromArray(this.dxfViewer.origin, newDevices);
    },

    groups(newGroups) {
      if (!this.dxfViewer) {
        return;
      }
      this.drawFromArray(this.dxfViewer.origin, newGroups, "group");
    },

    areas(newAreas) {
      if (!this.dxfViewer) {
        return;
      }
      this.drawFromArray(this.dxfViewer.origin, newAreas, "area");
    },

    areaMode(newValue) {
      if (newValue) {
        this.sensorMode = false;
        // this.addMode = true;
      } else {
        this.sensorMode = true;
        // this.addMode = false;
      }
    },
  },

  methods: {
    async Load(url) {
      this.isLoading = true;
      this.error = null;
      try {
        // const DxfViewerWorker = DxfViewer.SetupWorker()
        await this.dxfViewer.Load({
          url,
          fonts: this.fonts,
          progressCbk: this._OnProgress.bind(this),
          workerFactory: DxfViewerWorker,
        });
      } catch (error) {
        console.warn(error);
        this.error = error.toString();
      } finally {
        this.isLoading = false;
        this.progressText = null;
        this.progress = null;
        this.curProgressPhase = null;

        this.dxfViewer.GetLayers().forEach((layer) => {
          this.dxfViewer.ShowLayer(
            layer.name,
            [this.file.floor_layer_name].includes(layer.name)
          );
        });

        this.dxfViewer.GetScene().add(canvasObjects.grid);
        this.dxfViewer.GetScene().add(canvasObjects.plane);

        this.dxfViewer
          .GetCanvas()
          .addEventListener("pointerup", this.pointerUp);
        this.dxfViewer
          .GetCanvas()
          .addEventListener("pointermove", this.pointerMove);
        this.dxfViewer
          .GetCanvas()
          .addEventListener("pointerdown", this.pointerDown);
        this.dxfViewer.GetCanvas().addEventListener("dblclick", this.dblClick);

        this.groups = this.getGroups();
        this.devices = this.getDevices();
        this.areas = this.getAreas();

        this.drawDevices(this.dxfViewer.origin);
        this.drawGroups(this.dxfViewer.origin);
        this.drawAreas(this.dxfViewer.origin);
        this.drawPosition(this.dxfViewer.origin, this.testPositions);
        this.refresh();
        console.log("render");
        this.dxfViewer.Render();
      }
    },

    turnOnAddMode() {
      this.addMode = true;
      this.sensorMode = false;
    },

    /** @return {DxfViewer} */
    GetViewer() {
      return this.dxfViewer;
    },

    _OnProgress(phase, size, totalSize) {
      if (phase !== this.curProgressPhase) {
        switch (phase) {
          case "font":
            this.progressText = "Fetching fonts...";
            break;
          case "fetch":
            this.progressText = "Fetching file...";
            break;
          case "parse":
            this.progressText = "Parsing file...";
            break;
          case "prepare":
            this.progressText = "Preparing rendering data...";
            break;
        }
        this.curProgressPhase = phase;
      }
      if (totalSize === null) {
        this.progress = -1;
      } else {
        this.progress = size / totalSize;
      }
    },

    calcSensorArea(ceilHeight, angle) {
      return Math.tan(((angle / 2) * Math.PI) / 180) * ceilHeight * 2;
    },

    findObjectClicked() {
      const canvas = this.dxfViewer;
      const cam = canvas.GetCamera();
      const api = canvasObjects;
      // let update = false;
      api.raycaster.setFromCamera(api.v2, cam);

      const intersects = api.raycaster
        .intersectObjects(api.objects)
        .filter((e) => e.object?.material?.visible || false);

      return intersects;
    },

    findGridCellClick() {
      const canvas = this.dxfViewer;
      const cam = canvas.GetCamera();
      const api = canvasObjects;
      // let update = false;
      api.raycaster.setFromCamera(api.v2, cam);

      const intersects = api.raycaster
        .intersectObjects(api.sensorGridCells)
        .filter((e) => e.object?.material?.visible || false);

      return intersects;
    },

    findObjectAtPos(e) {
      const canvas = this.dxfViewer;
      const api = canvasObjects;
      if (!canvas || !api) {
        return [];
      }
      const x = (e.offsetX / e.target.clientWidth) * 2 - 1;
      const y = -(e.offsetY / e.target.clientHeight) * 2 + 1;
      const v2 = new THREE.Vector2(x, y);
      const cam = canvas.GetCamera();
      api.raycaster.setFromCamera(v2, cam);

      const intersects = api.raycaster
        .intersectObjects(api.objects)
        .filter((e) => e.object?.material?.visible || false);

      return intersects;
    },

    getMouseActionPos(e, canvas, api) {
      if (!canvas || !api) {
        return null;
      }
      const x = (e.offsetX / e.target.clientWidth) * 2 - 1;
      const y = -(e.offsetY / e.target.clientHeight) * 2 + 1;
      const v2 = new THREE.Vector2(x, y);
      const cam = canvas.GetCamera();
      api.raycaster.setFromCamera(v2, cam);
      const intersects = api.raycaster.intersectObjects([api.plane]);
      if (intersects.length == 0) {
        return null;
      }
      const v3 = intersects[0].point;
      return { ...v3, z: 0 };
    },

    calcRectByTwoPoint(p1, p2) {
      return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
        width: Math.abs(p1.x - p2.x),
        height: Math.abs(p1.y - p2.y),
      };
    },

    findObjectByName(name) {
      const canvas = this.dxfViewer;
      const scene = canvas.GetScene();
      const { children } = scene;
      const findData = children.filter((e) => e.name == name);
      return findData;
    },

    dblClick(e) {
      // this.addMode = !this.addMode;
      // if (this.addMode) {
      //   this.dxfViewer.GetCanvas().style.cursor = "pointer";
      // } else {
      //   this.dxfViewer.GetCanvas().style.cursor = "";
      // }
      console.log("double click");
      const baseIntersects = this.findObjectClicked();
      const objects = baseIntersects.filter((e) => {
        const mesh = e.object;
        const data = mesh.exData;
        if (!groupTypes.includes(data.type)) {
          return false;
        }
        // if (data.serial_number == null || data.serial_number.length < 3) {
        //   return;
        // }
        return mesh.name.includes("box-");
      });
      if (objects.length > 0) {
        if (this.onDblclick) {
          this.onDblclick(objects[0].object.exData);
          const canvas = this.dxfViewer;
          const api = canvasObjects;
          const scene = canvas.GetScene();
          const { children } = scene;

          children
            .filter((e) => api.selectedObjects.includes(e.name))
            .forEach((e) => {
              e.material.map = this.getIcon(e.exData);
            });
          children
            .filter((e) => e.hasOwnProperty("exData"))
            .filter(
              (e) =>
                e.exData.hasOwnProperty("device_ids") ||
                e.exData.hasOwnProperty("group_ids")
            )
            .forEach((e) => {
              e.material.map = icoGroup;
            });
          api.selectedObjects = [];
          this.onClick("single", null);
        }
      }
    },

    cancel() {
      if (this.addMode) {
        const canvas = this.dxfViewer;
        const scene = canvas.GetScene();
        let selectedGroup = scene.getObjectByProperty(
          "uuid",
          api.selectedGroup.uuid
        );

        selectedGroup.geometry.dispose();
        selectedGroup.material.dispose();
        scene.remove(selectedGroup);

        api.objects = api.objects.filter(
          (item) => item.uuid !== api.selectedGroup.uuid
        );

        this.dialog = true;
        this.dxfViewer.Render();
      }
    },

    calculateCellsPos(sensor) {
      const { object } = sensor;
      const { exData, position } = object;
      const gridWidth = this.calcSensorArea(
        exData.ceil_height * 10,
        exData.angle
      );

      const cellWidth = gridWidth / 8;
      const startX = position.x - gridWidth / 2;
      const startY = position.y - gridWidth / 2;
      const results = [];
      for (let i = 0; i < 8; i++) {
        let sY = startY + i * cellWidth;
        for (let j = 0; j < 8; j++) {
          let sX = startX + j * cellWidth;
          const p1 = { x: sX, y: sY };
          const p2 = { x: sX + cellWidth, y: sY + cellWidth };
          results.push(this.calcRectByTwoPoint(p1, p2));
        }
      }
      return results;
    },

    prepareSensorGridCells(sensor) {
      const gridCellsPos = this.calculateCellsPos(sensor);
      const { object } = sensor;
      const { exData } = object;
      canvasObjects.sensorSelectedCells = exData.selected_cells || [];
      if (canvasObjects.sensorGridCells.length == 0) {
        gridCellsPos.forEach((e, index) => {
          this.drawGridCell(
            new THREE.Vector3(e.x, e.y, 0),
            e.width - 10,
            e.height - 10,
            index
          );
        });
      } else {
        const CircleGeo = new THREE.BoxBufferGeometry(
          gridCellsPos[0].width - 10,
          gridCellsPos[0].height - 10,
          1
        );
        for (let i = 0; i < gridCellsPos.length; i++) {
          const voxel = canvasObjects.sensorGridCells[i];
          const pos = gridCellsPos[i];
          voxel.position.copy(new THREE.Vector3(pos.x, pos.y, 0));
          voxel.geometry = CircleGeo;
        }
      }
    },

    showHideSensorGrid(sensor, visible) {
      if (canvasObjects.sensorGridCells.length == 0) {
        return;
      }

      if (visible && sensor) {
        for (let i = 0; i < canvasObjects.sensorGridCells.length; i++) {
          const voxel = canvasObjects.sensorGridCells[i];
          voxel.material.visible = visible;
          if (canvasObjects.sensorSelectedCells.includes(voxel.cell_number)) {
            voxel.material.color = new THREE.Color(0xf97316);
            voxel.material.opacity = 0.75;
          } else {
            voxel.material.opacity = 0.5;
            voxel.material.color = new THREE.Color(0x2ae5fa);
          }
        }
      }

      if (!visible) {
        for (let i = 0; i < canvasObjects.sensorGridCells.length; i++) {
          const voxel = canvasObjects.sensorGridCells[i];
          voxel.material.visible = visible;
        }
      }

      this.dxfViewer.Render();
    },

    getIcon(data) {
      const api = canvasObjects;
      const name = this.getMeshName(data);
      const index = api.selectedObjects.indexOf(name);
      if (index >= 0) {
        // console.log("deselect");
        api.selectedObjects.splice(index, 1);

        if (data.serial_number == null || data.serial_number.length < 3) {
          if (data.type == "sensor") {
            return icoSensor;
          } else if (data.type == "fixture") {
            return icoUnscanLight;
          }
          return icoGroup;
        } else {
          if (data.type == "sensor") {
            return icoSensor;
          } else if (data.type == "fixture") {
            return icoScanLight;
          }
          return icoGroup;
        }
      } else {
        // console.log("select");
        api.selectedObjects.push(name);
        if (data.serial_number == null || data.serial_number.length < 3) {
          if (data.type == "sensor") {
            return iconSelectSensor;
          } else if (data.type == "fixture") {
            return icoUnscanSelectedLight;
          }
          return iconSelectGroup;
        } else {
          if (data.type == "sensor") {
            return icoSensor;
          } else if (data.type == "fixture") {
            return icoSelectLight;
          }
          return iconSelectGroup;
        }
      }
    },

    pointerDown(e) {
      const canvas = this.dxfViewer;
      const api = canvasObjects;
      const cam = canvas.GetCamera();

      api.PointStart = {
        x: e.offsetX,
        y: e.offsetY,
      };
      api.zoom = cam.zoom;

      const x = (e.offsetX / e.target.clientWidth) * 2 - 1;
      const y = -(e.offsetY / e.target.clientHeight) * 2 + 1;

      api.v2 = new THREE.Vector2(x, y);

      // Handle adding rect and moving
      if (e.button == 0) {
        if (this.addMode) {
          api.startPos = this.getMouseActionPos(e, canvas, api);
          // Diselect current group
          api.selectedGroup = null;
          this.creatingArea = null;
          this.updateResizeBoxes(false, api.startPos, 0, 0);
        } else {
          const baseIntersects = this.findObjectClicked();
          const objects = baseIntersects.filter((e) => {
            const mesh = e.object;
            const data = mesh.exData;
            // if (groupTypes.includes(data.type)) {
            //   return;
            // }
            // if (data.serial_number == null || data.serial_number.length < 3) {
            //   return;
            // }
            return mesh.name.includes("box-");
          });

          if (objects.length) {
            // Click to select or deselect 1 device
            const mesh = objects[0].object;
            const data = mesh.exData;
            // const index = api.selectedObjects.indexOf(mesh.name);

            // if (index >= 0) {
            // api.selectedObjects.splice(index, 1);
            mesh.material.map = this.getIcon(data);
            // } else {
            //   // api.selectedObjects.push(mesh.name);
            //   mesh.material.map = this.getIcon(data);
            // }
          } else {
            // Click none to deselect all objects
            const scene = canvas.GetScene();
            const { children } = scene;
            children
              .filter((e) => api.selectedObjects.includes(e.name))
              .forEach((e) => {
                e.material.map = this.getIcon(e.exData);
              });
            api.selectedObjects = [];
          }

          const intersects = baseIntersects.filter((e) => {
            const mesh = e.object;
            if (this.sensorMode) {
              if (!mesh.exData) {
                return false;
              }
              const data =
                deviceByKeys[this.getMeshName(mesh.exData)] || mesh.exData;

              if (api.selectedSensor) {
                return false;
              }
              if (!data.ceil_height || !data.angle) {
                return false;
              }

              if (data.type != "sensor") {
                return false;
              }
              return mesh.name.includes(`devices-${data.id}`);
            } else {
              return mesh.name.includes("Rect-area");
            }
            return false;
          });

          if (intersects.length) {
            if (this.sensorMode) {
              if (
                api.selectedSensor == null ||
                api.selectedSensor.object.exData.id !=
                  intersects[0].object.exData.id
              ) {
                api.selectedSensor = intersects[0];
                api.sensorSelectedCells = [];
                this.prepareSensorGridCells(api.selectedSensor);
                if (this.onShowHeatGrid) {
                  this.onShowHeatGrid([...api.sensorSelectedCells]);
                }
              }
            } else {
              api.movingMess = intersects[0];
              const { point, object } = intersects[0];

              if (api.selectedGroup != object) {
                api.preSelectedGroup = object;
                api.selectedGroup = null;
                this.creatingArea = null;
                return;
              }
              api.movingOffset = {
                x: point.x - object.position.x,
                y: point.y - object.position.y,
              };
              const { width, height } = object.geometry.parameters;
              const resizeMin = Math.max(Math.max(width, height) / 20, 200);
              // Check if resize
              if (
                Math.abs(Math.abs(api.movingOffset.x) - width / 2) <
                  resizeMin &&
                Math.abs(Math.abs(api.movingOffset.y) - height / 2) < resizeMin
              ) {
                api.resizeMode = true;
                const sPos = { x: object.position.x, y: object.position.y };
                if (api.movingOffset.x < 0) {
                  sPos.x = sPos.x + width / 2.0;
                } else {
                  sPos.x = sPos.x - width / 2.0;
                }
                if (api.movingOffset.y < 0) {
                  sPos.y = sPos.y + height / 2.0;
                } else {
                  sPos.y = sPos.y - height / 2.0;
                }
                api.resizeStartPos = sPos;
              }
            }
          } else {
            if (this.sensorMode) {
              const selectGridCells = this.findGridCellClick();
              if (selectGridCells.length == 0) {
                if (this.onHideHeatGrid) {
                  this.onHideHeatGrid(api.selectedSensor, [
                    ...api.sensorSelectedCells,
                  ]);
                }
                api.selectedSensor = null;
                api.sensorSelectedCells = [];
              } else {
                const { object } = selectGridCells[0];
                const cell_number = parseInt(object.cell_number, 10);
                const index = api.sensorSelectedCells.indexOf(cell_number);
                // console.log(cell_number, index, api.sensorSelectedCells);
                if (index >= 0) {
                  api.sensorSelectedCells.splice(index, 1);
                } else {
                  api.sensorSelectedCells.push(cell_number);
                }
                if (this.onUpdateHeatGrid) {
                  this.onUpdateHeatGrid([...api.sensorSelectedCells]);
                }
              }
            } else {
              api.selectedGroup = null;
              this.creatingArea = null;
              this.updateResizeBoxes(false, null, 0, 0);
            }
          }
        }
        return;
      }
    },

    pointerMove(e) {
      const api = canvasObjects;
      if (!api.startPos && !api.movingMess) {
        return;
      }
      const canvas = this.dxfViewer;
      const currentPos = this.getMouseActionPos(e, canvas, api);

      // Handle drawing
      if (api.startPos && currentPos) {
        const rectInfo = this.calcRectByTwoPoint(api.startPos, currentPos);

        const findData = this.findObjectByName("drawing-rect");

        if (findData.length > 0) {
          const rect = findData[0];
          const CircleGeo = new THREE.BoxBufferGeometry(
            rectInfo.width,
            rectInfo.height,
            1
          );
          rect.position.copy(new THREE.Vector3(rectInfo.x, rectInfo.y, 0));
          rect.geometry = CircleGeo;
          canvas.Render();
          return;
        }

        this.drawRect(
          new THREE.Vector3(rectInfo.x, rectInfo.y, 0),
          rectInfo.width,
          rectInfo.height
        );
        canvas.Render();
        return;
      }

      // We need to select group first befrore moving or resizing
      if (!api.selectedGroup) {
        return;
      }

      // Handle moving and resize
      if (api.movingMess && currentPos) {
        if (api.resizeMode) {
          if (!api.resizeStartPos) {
            return;
          }
          const rectInfo = this.calcRectByTwoPoint(
            api.resizeStartPos,
            currentPos
          );
          const CircleGeo = new THREE.BoxBufferGeometry(
            rectInfo.width,
            rectInfo.height,
            1
          );
          const nPos = new THREE.Vector3(rectInfo.x, rectInfo.y, 0);
          api.movingMess.object.position.copy(nPos);
          api.movingMess.object.geometry = CircleGeo;
          this.updateResizeBoxes(true, nPos, rectInfo.width, rectInfo.height);
        } else {
          const newPos = new THREE.Vector3(
            currentPos.x - api.movingOffset.x,
            currentPos.y - api.movingOffset.y,
            0
          );
          api.movingMess.object.position.copy(newPos);
          // Update resizing box

          const { width, height } = api.movingMess.object.geometry.parameters;
          this.updateResizeBoxes(
            true,
            api.movingMess.object.position,
            width,
            height
          );
        }

        canvas.Render();
      }
    },

    pointerUp(e) {
      const api = canvasObjects;

      let isDraw = false;
      // Handle adding rect
      if (api.startPos) {
        // Rect will be added.
        const findData = this.findObjectByName("drawing-rect");
        if (findData.length > 0) {
          const rect = findData[0];
          rect.name = "Rect-area";
          const { position, geometry } = rect;
          const { width, height } = geometry.parameters;
          const dxfPos = Draw.convertScenePositionToDxf(
            position,
            this.dxfViewer.origin
          );
          const exData = {
            name: "New area",
            x: dxfPos.x - width / 2,
            y: dxfPos.y - height / 2,
            type: "area",
            width,
            height,
          };
          rect.exData = exData;
          api.objects.push(rect);
          api.selectedGroup = rect;
          api.preSelectedGroup = rect;
          isDraw = true;
          this.addMode = false;
        }
      }
      api.startPos = null;
      let upInside = false;

      if (api.preSelectedGroup) {
        const intersects = this.findObjectAtPos(e).filter((e) => {
          const mesh = e.object;
          return mesh.name.includes("Rect-area");
        });

        for (let i = 0; i < intersects.length; i++) {
          if (intersects[i].object == api.preSelectedGroup) {
            upInside = true;
            break;
          }
        }

        if (upInside || isDraw) {
          api.selectedGroup = api.preSelectedGroup;
          api.preSelectedGroup = null;
          // Add resize boxes
          const { position, geometry } = api.selectedGroup;
          const { width, height } = geometry.parameters;
          this.updateResizeBoxes(true, position, width, height);
          // this.handleClickAtArea(api.selectedGroup);
        } else {
          api.preSelectedGroup = null;
        }
      }

      if (e.button == 0) {
        if (api.selectedSensor) {
          this.showHideSensorGrid(api.selectedSensor, true);
        } else {
          this.showHideSensorGrid(api.selectedSensor, false);
        }
      }

      if (upInside || isDraw || api.movingMess) {
        this.handleClickAtArea(api.selectedGroup);
        if (!api.selectedGroup?.exData?.id) {
          this.creatingArea = api.selectedGroup;
        } else {
          this.creatingArea = null;
        }
      } else {
        if (this.areaMode) {
          this.handleClickAtArea(null);
        }
      }

      if (api.movingMess) {
        api.movingMess = null;
        api.resizeMode = false;
        api.resizeStartPos = false;
      }
      try {
        const dx = Math.abs(e.offsetX - api.PointStart.x);
        const dy = Math.abs(e.offsetY - api.PointStart.y);

        if (dx > 30 || dy > 30) {
          if (isDraw) {
            this.dxfViewer.Render();
          }
          return;
        }
      } catch (e) {
        console.log(e);
      }

      const x = (e.offsetX / e.target.clientWidth) * 2 - 1;
      const y = -(e.offsetY / e.target.clientHeight) * 2 + 1;

      api.v2 = new THREE.Vector2(x, y);
      api.movingObject = { intersects: null };
      if (e.button == 0) {
        if (!this.areaMode) {
          this.handleClickAt();
        } else {
        }
      }
      api.isMove = false;
      this.dxfViewer.Render();
    },

    updateResizeBoxes(shown, position, width, height) {
      const api = canvasObjects;
      const resizeBoxes = this.findObjectByName("resize-box");
      if (!resizeBoxes.length) {
        if (shown) {
          this.drawResizeBox(
            new THREE.Vector3(position.x, position.y, 0),
            width,
            height
          );
        }
      }

      if (!shown) {
        api.resizeBoxes.forEach((mess) => {
          mess.material.visible = false;
        });
        return;
      }

      const resizeMin = Math.max(Math.max(width, height) / 20, 200);
      const CircleGeo = new THREE.BoxBufferGeometry(resizeMin, resizeMin, 1);
      api.resizeBoxes.forEach((mess, index) => {
        let nPos = new THREE.Vector3(
          position.x - (width - resizeMin) / 2,
          position.y - (height - resizeMin) / 2,
          0
        );
        if (index == 1) {
          nPos = new THREE.Vector3(
            position.x - (width - resizeMin) / 2,
            position.y + (height - resizeMin) / 2,
            0
          );
        } else if (index == 2) {
          nPos = new THREE.Vector3(
            position.x + (width - resizeMin) / 2,
            position.y - (height - resizeMin) / 2,
            0
          );
        } else if (index == 3) {
          nPos = new THREE.Vector3(
            position.x + (width - resizeMin) / 2,
            position.y + (height - resizeMin) / 2,
            0
          );
        }
        mess.position.copy(nPos);
        mess.geometry = CircleGeo;
        mess.material.visible = true;
      });
    },

    createTextAt(text, pos, name, height, color = null) {
      const canvas = this.dxfViewer;
      const scene = canvas.GetScene();

      const matLite = new THREE.MeshBasicMaterial({
        color: color || 0x334155,
        transparent: true,
        opacity: 1,
        visible: true,
        side: THREE.FrontSide,
      });

      const shapes = font.generateShapes(text, height);
      const geometry = new THREE.ShapeGeometry(shapes);
      geometry.computeBoundingBox();
      const xMid =
        -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      geometry.translate(xMid, -height / 2, 0);

      const mesh = new THREE.Mesh(geometry, matLite);
      mesh.position.copy(pos);
      mesh.renderOrder = 10000;
      mesh.name = name;

      mesh.onBeforeRender = function (renderer) {
        renderer.clearDepth();
      };
      scene.add(mesh);

      return mesh;
    },

    handleClickAtArea(mesh) {
      if (this.onClick) {
        let data = null;
        if (mesh) {
          data = mesh.exData || { type: "area" };
          const { position, geometry } = mesh;
          const { width, height } = geometry.parameters;
          const dxfPos = Draw.convertScenePositionToDxf(
            position,
            this.dxfViewer.origin
          );
          const exData = {
            x: dxfPos.x - width / 2,
            y: dxfPos.y - height / 2,
            width,
            height,
          };
          data = { ...data, ...exData };
        }
        this.onClick("single", data);
      }
    },

    handleClickAt() {
      const api = canvasObjects;
      const intersects = this.findObjectClicked();
      if (intersects.length > 0) {
        const intersect = intersects[0];
        const mesh = intersect.object;
        if (intersect.object !== api.plane) {
          if (mesh.name.includes("box")) {
            const { exData } = mesh;

            if (this.onClick) {
              if (canvasObjects.selectedObjects.length > 1) {
                const selectedDevices = this.devices.filter((e) =>
                  canvasObjects.selectedObjects.includes(this.getMeshName(e))
                );
                const selectedGroups = this.groups.filter((e) =>
                  canvasObjects.selectedObjects.includes(this.getMeshName(e))
                );
                this.onClick("multi", selectedDevices, selectedGroups);
              } else {
                let result = exData;
                if (deviceTypes.includes(exData.type)) {
                  const selectedDevices = this.devices.filter((e) => {
                    return mesh.name.includes(`-${e.id}`);
                  });
                  if (selectedDevices.length) {
                    result = selectedDevices[0];
                  }
                } else {
                  const selectedGroups = this.groups.filter((e) => {
                    return mesh.name.includes(`-${e.id}`);
                  });
                  if (selectedGroups.length) {
                    result = selectedGroups[0];
                  }
                }
                this.onClick("single", result);
              }
            } else {
              if (this.onShapeClick) {
                this.onShapeClick(exData.id, exData);
              }
            }
          }
        }
      } else {
        if (!this.sensorMode) {
          if (this.onClick) {
            this.onClick("single", null);
          } else {
            if (this.onShapeClick) {
              this.onShapeClick(null, null);
            }
          }
        } else {
          if (!api.selectedSensor) {
            if (this.onClick) {
              this.onClick("single", null);
            } else {
              if (this.onShapeClick) {
                this.onShapeClick(null, null);
              }
            }
          }
        }
      }
    },

    drawResizeBox(vector, w, h) {
      const canvas = this.dxfViewer;
      const scene = canvas.GetScene();

      const CircleGeo = new THREE.BoxBufferGeometry(w, h, 1);
      const RingMaterial = new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        color: 0x2ae5fa,
        opacity: 0.9,
        visible: false,
        transparent: true,
      });
      [1, 2, 3, 4].forEach(() => {
        const voxel = new THREE.Mesh(CircleGeo, RingMaterial);
        voxel.position.copy(vector);
        voxel.name = `resize-box`;
        canvasObjects.resizeBoxes.push(voxel);
        scene.add(voxel);
      });
    },

    drawGridCell(vector, w, h, number) {
      const canvas = this.dxfViewer;
      const scene = canvas.GetScene();

      const CircleGeo = new THREE.BoxBufferGeometry(w, h, 1);
      const RingMaterial = new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        color: 0x2ae5fa,
        opacity: 0.5,
        visible: false,
        transparent: true,
      });
      const voxel = new THREE.Mesh(CircleGeo, RingMaterial);
      voxel.position.copy(vector);
      voxel.name = `grid-cell`;
      voxel.cell_number = number;
      canvasObjects.sensorGridCells.push(voxel);
      scene.add(voxel);
    },

    drawRect(vector, w, h, name = `drawing-rect`, exData = null) {
      const canvas = this.dxfViewer;
      const scene = canvas.GetScene();

      const CircleGeo = new THREE.BoxBufferGeometry(w, h, 1);
      const RingMaterial = new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        color: 0x2ae5fa,
        opacity: 0.5,
        visible: true,
        transparent: true,
      });

      const voxel = new THREE.Mesh(CircleGeo, RingMaterial);
      voxel.position.copy(vector);
      voxel.name = name;
      if (exData) {
        voxel.exData = exData;
      }

      scene.add(voxel);

      return voxel;
    },

    drawRectHighlight(vector, w, h, data) {
      const canvas = this.dxfViewer;
      const scene = canvas.GetScene();
      const { children } = scene;
      const findData = children.filter((e) =>
        e.name.includes(`Rect-group-${data.id}`)
      );

      if (findData.length > 0) {
        const rect = findData[0];
        rect.material.visible = true;
        rect.material.opacity = 0.4; //data.opacity;
        return;
      }

      const CircleGeo = new THREE.BoxBufferGeometry(w, h, 1);
      const RingMaterial = new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        color: 0x2ae5fa,
        opacity: 0.4, //data.opacity,
        visible: true,
        transparent: true,
      });

      const voxel = new THREE.Mesh(CircleGeo, RingMaterial);
      voxel.position.copy(vector);
      voxel.name = `Rect-group-${data.id}`;
      voxel.exData = data;

      const api = canvasObjects;
      // console.log("voxel: ", voxel);
      scene.add(voxel);
      api.objects.push(voxel);
    },

    drawAt(vector, wbox1, data) {
      const canvas = this.dxfViewer;
      const scene = canvas.GetScene();
      const api = canvasObjects;
      const type = data.type || "fixture";
      let icon = icoScanLight;
      if (type === "fixture") {
        if (data.serial_number == null || data.serial_number.length < 3) {
          icon = icoUnscanLight;
        } else {
          icon = icoScanLight;
        }
      } else if (type === "sensor") {
        icon = icoSensor;
      } else if (type === "Group") {
        wbox1 = wbox1 * 1.5;
        icon = icoGroup;
      }

      let w, h;
      // if (type === "sensor") {
      //   w = wbox1;
      //   h = wbox1;
      // } else {
      //   w = h = wbox1;
      // }
      w = h = wbox1;
      const CircleGeo = new THREE.BoxBufferGeometry(w, h, 1);

      const RingMaterial = new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        visible: true,
        color: 0x2ae5fa,
        map: icon,
        transparent: true,
      });

      const voxel = new THREE.Mesh(CircleGeo, RingMaterial);
      voxel.position.copy(vector);
      voxel.name = this.getMeshName(data);
      voxel.exData = data;

      scene.add(voxel);
      api.objects.push(voxel);
    },

    updateMetaAndPos(origin, data, meshes) {
      if (data.positions.length > 0) {
        const groupPosition = data.positions[0];
        const v1 = Draw.convertPositionInScene(
          { x: groupPosition.x, y: groupPosition.y, z: 0 },
          origin
        );
        const name = this.getMeshName(data);
        if (meshes[name]) {
          meshes[name].position.copy(v1);
        }
      }
    },

    drawPosition(origin, items) {
      if (!origin) return;
      const canvas = this.dxfViewer;
      const scene = this.dxfViewer.GetScene();
      const children = scene.children;
      const findData = children.filter((e) => e.name.includes("test-position"));
      findData.forEach((e) => {
        scene.remove(e);
      });

      items.forEach((item) => {
        const v1 = Draw.convertPositionInScene(
          { x: item.x, y: item.y, z: 0 },
          origin
        );
        const text = this.createTextAt("x", v1, "test-position", 140, 0x5048e5);
      });
      canvas.Render();
    },

    getAreaName(item) {
      return `Rect-area-${item.id}`;
    },

    drawFromArray(origin, items, type = "") {
      if (!origin) return;
      const api = canvasObjects;
      const names = api.objects.map((e) => e.name);
      const itemObjs = items.reduce(
        (a, v) => ({ ...a, [this.getMeshName(v)]: v }),
        {}
      );

      const canvas = this.dxfViewer;
      const scene = canvas.GetScene();
      const { children } = scene;
      const temp = {};

      children.forEach((e) => {
        if (itemObjs[e.name]) {
          e.exData = itemObjs[e.name];
        }
        temp[e.name] = e;
      });

      const results = items.filter((e) => !names.includes(this.getMeshName(e)));

      const updateMeta = items.filter((e) =>
        names.includes(this.getMeshName(e))
      );

      updateMeta?.forEach((d) => {
        if (type == "group") {
          this.updateMetaAndPos(origin, d, temp);
        }
      });

      results?.forEach(async (d) => {
        if (type == "group") {
          if (d.positions.length > 0) {
            const groupPosition = d.positions[0];
            const v1 = Draw.convertPositionInScene(
              { x: groupPosition.x, y: groupPosition.y, z: 0 },
              origin
            );

            this.drawAt(v1, lightSize, d);
            // const w =
            //   groupPosition.f_width > 700 ? groupPosition.f_width + 500 : 1500;
            // const h =
            //   groupPosition.f_height > 500
            //     ? groupPosition.f_height + 500
            //     : 1000;
            // this.drawRectHighlight(v1, w, h, d);
          }
        } else if (type == "area") {
          if (this.creatingArea) {
            this.creatingArea.name = this.getMeshName(d);
            this.creatingArea.exData = d;
            this.creatingArea = null;
          } else {
            const v1 = Draw.convertPositionInScene(
              { x: d.x, y: d.y, z: 0 },
              origin
            );
            v1.x = v1.x + d.width / 2;
            v1.y = v1.y + d.height / 2;

            const mesh = this.drawRect(
              v1,
              d.width,
              d.height,
              this.getMeshName(d),
              d
            );
            api.objects.push(mesh);
          }
        } else {
          const v1 = Draw.convertPositionInScene(
            { x: d.x, y: d.y, z: 0 },
            origin
          );
          this.drawAt(v1, lightSize, d);
        }
      });
      canvas.Render();
    },

    drawDevices(origin) {
      this.drawFromArray(origin, this.devices);
    },

    drawGroups(origin) {
      // console.log("origin", origin);
      this.drawFromArray(origin, this.groups, "group");
    },

    drawAreas(origin) {
      // console.log("origin", origin);
      this.drawFromArray(origin, this.areas, "area");
    },

    getMeshName(object) {
      if (object && object.type == "area") {
        return `Rect-area-${object.id}`;
      }
      return `box-${deviceTypeName[object.type] || "unknow"}-${object.id}`;
    },

    refresh() {
      const canvas = this.dxfViewer;
      const api = canvasObjects;

      if (!canvas) {
        return;
      }

      this.groups = this.getGroups();
      this.devices = this.getDevices();
      this.areas = this.getAreas();

      const scene = canvas.GetScene();
      const { children } = scene;
      children.forEach(async (e) => {
        // e is a Mesh
        if (e.name.indexOf("grid-cell") == 0) {
          e.material.visible = false;
        }
        if (e.name.indexOf("box") !== -1) {
          const exData = e.exData;
          // Here we will check and show/hide the item as we want
          e.material.visible = false;
          if (
            exData &&
            ((deviceTypes.includes(exData.type) &&
              ((this.visibleDevices === null &&
                !this.groupedDevices.includes(exData.id)) ||
                (this.visibleDevices !== null &&
                  this.visibleDevices.includes(exData.id)))) ||
              (groupTypes.includes(exData.type) &&
                this.visibleGroups.includes(exData.id)))
          ) {
            if (this.deviceType === "fixture") {
              // if (exData.type !== "sensor") {
              e.material.visible = true;
              // } else {
              //   e.material.visible = false;
              // }
            } else if (this.deviceType === "sensor") {
              // if (exData.type !== "fixture") {
              e.material.visible = true;
              // } else {
              //   e.material.visible = false;
              // }
            } else {
              e.material.visible = true;
            }

            // Here we update icon of an item
            if (exData.type === "fixture" || exData.type === "sensor") {
              let data = this.devices.filter((d) => d.id == exData.id);
              if (data.length > 0) {
                data = data.pop();

                if (
                  data.serial_number == null ||
                  data.serial_number.length < 3
                ) {
                  if (data.type === "fixture") {
                    e.material.map = icoUnscanLight;
                  } else {
                    e.material.map = icoSensor;
                  }
                } else {
                  if (data.type === "fixture") {
                    if (api.selectedObjects.includes(e.name)) {
                      e.material.map = icoSelectLight;
                    } else {
                      e.material.map = icoScanLight;
                    }
                  } else {
                    e.material.map = icoSensor;
                  }
                }
              }
            }
          }
        }
      });
      api.selectedObjects = [];
      canvas.Render();
    },

    getDevices() {
      return readDevices(this.$store);
    },

    getGroups() {
      return readGroups(this.$store);
    },

    getAreas() {
      return readAreas(this.$store);
    },
  },

  mounted() {
    //   this.groups = JSON.parse(`[{
    //   "name": "Group 3",
    //   "x": "50751",
    //   "y": "25516",
    //   "x_color": 0,
    //   "y_color": 0,
    //   "color_type": "cct",
    //   "id": 188,
    //   "user_id": 4,
    //   "type": "Group",
    //   "is_active": false,
    //   "project_id": 15,
    //   "scene_status": false,
    //   "scene_id": 1116,
    //   "energy": 0,
    //   "total_amount": 0,
    //   "light": 6000,
    //   "color": "6000",
    //   "intensity": 80,
    //   "opacity": 0.4,
    //   "device_ids": [
    //     9725,
    //     9726,
    //     9727
    //   ],
    //   "group_ids": [],
    //   "positions": [
    //     {
    //       "x": "51042.0",
    //       "y": "25399.0",
    //       "file_id": 194,
    //       "f_x": "51042.0",
    //       "f_y": "25399.0",
    //       "f_width": "2000.0",
    //       "f_height": "2000.0"
    //     }
    //   ],
    //   "is_featured": false
    // }]`);
    this.dxfViewer = new DxfViewer(this.$refs.canvasContainer, this.options);
    const Subscribe = (eventName) => {
      this.dxfViewer.Subscribe(eventName, (e) =>
        this.$emit("dxf-" + eventName, e)
      );
    };
    for (const eventName of [
      "loaded",
      "cleared",
      "destroyed",
      "resized",
      "pointerdown",
      "pointerup",
      "viewChanged",
      "dblclick",
    ]) {
      Subscribe(eventName);
    }

    if (this.dxfUrl) {
      this.Load(this.dxfUrl);
    }

    this.$watch(
      (vm) => [
        vm.groupedDevices,
        vm.visibleGroups,
        vm.deviceType,
        vm.visibleDevices,
      ],
      (val) => {
        this.refresh();
      },
      {
        immediate: true,
        deep: true,
      }
    );
  },

  destroyed() {
    this.dxfViewer.GetCanvas().removeEventListener("pointerup", this.pointerUp);
    this.dxfViewer
      .GetCanvas()
      .removeEventListener("pointermove", this.pointerMove);
    this.dxfViewer
      .GetCanvas()
      .removeEventListener("pointerdown", this.pointerDown);
    this.dxfViewer.GetCanvas().removeEventListener("dblclick", this.dblClick);
    canvasObjects.objects = [];
    canvasObjects.activeList = [];
    canvasObjects.isMove = false;
    canvasObjects.startPos = null;
    canvasObjects.movingMess = null;
    canvasObjects.movingOffset = { x: 0, y: 0 };
    canvasObjects.resizeMode = false;
    canvasObjects.resizeStartPos = null;
    canvasObjects.movingObject = { intersects: null };
    canvasObjects.selectedGroup = null;
    canvasObjects.preSelectedGroup = null;
    canvasObjects.resizeBoxes = [];
    // Sensor
    canvasObjects.selectedSensor = null;
    canvasObjects.sensorGridCells = [];
    canvasObjects.sensorSelectedCells = [];
    this.dxfViewer.Destroy();
    this.dxfViewer = null;
  },
};
</script>

<style scoped>
.canvasContainer {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 70vh;
}
.canvasContainer .progress {
  position: absolute;
  z-index: 20;
  width: 90%;
  margin: 20px 5%;
}
.canvasContainer .progress .progressText {
  margin: 10px 20px;
  font-size: 14px;
  color: #262d33;
  text-align: center;
}
.canvasContainer .error {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 20;
  padding: 30px;
}
.canvasContainer .error img {
  width: 24px;
  height: 24px;
  vertical-align: middle;
  margin: 4px;
}
</style>
