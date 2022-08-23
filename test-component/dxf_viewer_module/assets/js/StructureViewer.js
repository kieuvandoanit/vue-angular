import { DxfViewer } from "./DxfViewer/DxfViewer";
import DxfViewerWorker from "worker-loader!./DxfViewerWorker";
import * as Draw from "./DxfViewer/DxfDrawCore.js";
import * as THREE from "three";
import { calculateZoomAndScale, centerOfDevices } from "./Helper/DrawHelper";
const fontJson = require("./helvetiker_regular.typeface");

const font = new THREE.Font(fontJson);

const wworld = 100000;
const planeshow = false;
const lightSize = 300;

const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(wworld, wworld),
  new THREE.MeshBasicMaterial({ color: "#e6ecf7", visible: planeshow })
);
plane.position.z = -1;
plane.name = "plane";

const gridHelper = new THREE.GridHelper(wworld, 20);
gridHelper.rotateX(-Math.PI / 2);
gridHelper.position.z = -7500;

const createCanvasObjects = () => {
  return {
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
    sensorGridCellsContainer: null,
    sensorGridCells: [],
    sensorSelectedCells: [],
    // Select multi object
    selectedObjects: [],

    // Store heat map cells for sensors in heatmap mode
    heatmapDevices: {},

    // Store tracking paths
    trackingPaths: {},

    // Store people positions
    peoplePositions: {},

    // HeatMap positions
    heatMapPositions: {},
  };
};

let canvasObjects = null;

const deviceTypeName = {
  fixture: "devices",
  sensor: "devices",
  Group: "Group",
  Room: "Group",
  Floor: "Group",
};

const icoUnscanLight = new THREE.TextureLoader().load(
  "/static/icons/unscanlight.png"
);
const icoScanLight = new THREE.TextureLoader().load(
  "/static/icons/scanlight.png"
);
const icoScanLightOn = new THREE.TextureLoader().load(
  "/static/icons/scanlighton.png"
);
const icoSelectScanLightOn = new THREE.TextureLoader().load(
  "/static/icons/selectscanlighton.png"
);
const icoSelectLight = new THREE.TextureLoader().load(
  "/static/icons/selectlight.png"
);
const icoUnscanSelectedLight = new THREE.TextureLoader().load(
  "/static/icons/unscanselected.png"
);
const iconSelectSensor = new THREE.TextureLoader().load(
  "/static/icons/selectsensor.png"
);
const iconSelectUnscanSensor = new THREE.TextureLoader().load(
  "/static/icons/selectunscansensor.png"
);
const icoGroup = new THREE.TextureLoader().load("/static/icons/group.png");
const icoGroupActive = new THREE.TextureLoader().load(
  "/static/icons/activegroup.png"
);
const icoTrackPeople = new THREE.TextureLoader().load(
  "/static/icons/people.png"
);
const iconSelectGroup = new THREE.TextureLoader().load(
  "/static/icons/selectgroup.png"
);
const iconSelectGroupActive = new THREE.TextureLoader().load(
  "/static/icons/selectgroupactive.png"
);

const icoSensor = new THREE.TextureLoader().load("/static/icons/sensor.png");
const icoUnscanSensor = new THREE.TextureLoader().load(
  "/static/icons/unscan-sensor.svg"
);

const iconHeatMapTile = new THREE.TextureLoader().load(
  "/static/icons/HeatmapTile.png"
);
// const font = new THREE.FontLoader().load("/static/icons/sensor.png");

const groupTypes = ["Group", "Room", "Floor"];
const deviceTypes = ["fixture", "sensor"];
let dxfViewer = null;
let that = null;
let deviceByKeys = {};
let heatmapByKeys = {};

let scale = 1;
let scaleFactor = 1;
let cameraDistance = 0;
let currentScale = 0;

const aa = {
  0: 1,
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 1,
  7: 1,
  8: 1,
  9: 1,
  10: 1,
  11: 1,
  12: 1,
  13: 1,
  14: 1,
  15: 1,
  16: 1,
  17: 1,
  18: 1,
  19: 1,
  20: 1,
  21: 1,
  22: 1,
  23: 1,
  24: 1,
  25: 1,
  26: 1,
  27: 1,
  28: 1,
  29: 1,
  30: 1,
  31: 1,
  32: 1,
  33: 1,
  34: 1,
  35: 1,
  36: 1,
  37: 1,
  38: 1,
  39: 1,
  40: 1,
  41: 1,
  42: 1,
  43: 1,
  44: 1,
  45: 1,
  46: 1,
  47: 1,
  48: 1,
  49: 1,
  50: 1,
  51: 1,
  52: 1,
  53: 1,
  54: 1,
  55: 1,
  56: 1,
  57: 1,
  58: 1,
  59: 1,
  60: 1,
  61: 1,
  62: 1,
  63: 1,
};

const bbb = [
  {
    id: 1,
    name: "ID-09",
    path: [
      [1514, 49],
      [1514, 41],
      [1514, 33],
      [1514, 34],
      [1514, 35],
      [1514, 36],
      [1514, 37],
      [1514, 38],
      [1514, 30],
      [1514, 22],
      [1514, 14],
      [1514, 6],
      [1528, 62],
      [1528, 61],
      [1528, 60],
      [1528, 52],
      [1528, 44],
      [1528, 36],
      [1528, 35],
      [1528, 34],
      [1528, 26],
      [1528, 18],
      [1528, 10],
      [1528, 2],
    ],
  },
];

const color_levels = {
  1: 0.25,
  2: 0.5,
  3: 0.75,
  4: 1,
};

const zoomReduceFactor = 0.5;

let timerClick = 0;
let timerCounter = 0;

export class StructureViewer {
  constructor(
    domContainer,
    options = null,
    groups = [],
    devices = [],
    areas = [],
    file = null,
    heatmaps = [],
    backgroundViewer = "#fff"
  ) {
    canvasObjects = createCanvasObjects();
    this.dxfViewer = new DxfViewer(domContainer, {
      clearColor: new THREE.Color(backgroundViewer),
      autoResize: true,
      colorCorrection: true,
    });

    dxfViewer = this;
    this.file = file || { floor_layer_name: "XREF", people_tracking: [] };

    this.sensorMode = false;
    this.heatmapMode = false;
    this.trackingMode = false;
    this.peoplePositionMode = false;
    this.heatMapPositionMode = false;
    this.areaMode = false;
    this.addMode = false;

    this.trackingPeopleIds = [];
    this.visibleHeatMaps = [];
    this.peoplePositionIds = [];
    this.heatMapPositionIds = [];

    this.creatingArea = null;

    this.groups = groups;
    this.devices = devices;
    this.areas = areas;
    this.peoples = this.file.people_tracking;

    this.hoverPersonId = null;
    this.peoplePositions = [];
    this.heatMapPositions = [];
    this.heatmaps = heatmaps;
    this.activeGroup = null;
    this.visibleDevices = null;
    this.visibleGroups = [];
    this.groupedDevices = [];
    this.activeGroup = null;
    this.history = [];
    this.onClick = null;
    this.onShapeClick = null;
    this.dblClickCallback = null;
    deviceByKeys = devices.reduce(
      (a, v) => ({ ...a, [this.getMeshName(v)]: v }),
      {}
    );

    heatmapByKeys = this.heatmaps.reduce(
      (a, v) => ({ ...a, [v.device_id]: v }),
      {}
    );
    that = this;
  }

  setHeatMapMode(status) {
    this.heatmapMode = status;
    this.trackingMode = false;
    this.peoplePositionMode = false;
    this.heatMapPositionMode = false;
    this.refresh();
  }

  setTrackingMode(status) {
    this.heatmapMode = false;
    this.peoplePositionMode = false;
    this.heatMapPositionMode = false;
    this.trackingMode = status;
    this.removeAllPeopleOfScene(
      this.dxfViewer ? this.dxfViewer.GetScene() : null
    );
    this.refresh();
  }

  setPeoplePositionMode(status) {
    this.heatmapMode = false;
    this.trackingMode = false;
    this.heatMapPositionMode = false;
    this.peoplePositionMode = status;
    this.refresh();
  }

  setHeatMapPositionMode(status) {
    this.heatmapMode = false;
    this.trackingMode = false;
    this.peoplePositionMode = false;
    this.heatMapPositionMode = status;
    this.removeAllPeopleOfScene(
      this.dxfViewer ? this.dxfViewer.GetScene() : null
    );
    this.refresh();
  }

  addAreaObj(status) {
    this.heatmapMode = false;
    this.trackingMode = false;
    this.peoplePositionMode = false;
    this.heatMapPositionMode = false;
    this.areaMode = status;
    this.refresh();
  }

  setTrackingPeople(ids) {
    this.trackingPeopleIds = ids;
    this.setTrackingMode(true);
    this.refresh();
  }

  setVisiblePerson(hoverId) {
    this.hoverPersonId = hoverId;
    this.setTrackingMode(true);
    this.refresh();
  }

  setPeoplePositionId(ids) {
    this.peoplePositionIds = ids;
    this.setPeoplePositionMode(true);
    this.refresh();
  }

  setHeatMapPositionId(ids) {
    this.heatMapPositionIds = ids;
    this.setHeatMapPositionMode(true);
    this.refresh();
  }

  setVisibleHeatMaps(device_ids) {
    this.visibleHeatMaps = device_ids;
    this.refresh();
  }

  updatePeoplePositionData(peoplePositionData) {
    this.peoplePositions = peoplePositionData;
    this.drawPeoplePositions(
      this.dxfViewer ? this.dxfViewer.origin : null,
      peoplePositionData
    );
    this.refresh();
  }

  updateGroupsData(groupData, needRefresh = true) {
    this.groups = groupData;
    if (needRefresh) {
      this.drawFromArray(this.dxfViewer.origin, this.groups, "group");
      this.refreshData();
      this.updateObjectsScale(true);
      this.refresh();
    }
  }

  updateDevicesData(devicesData, needRefresh) {
    this.devices = devicesData;
    if (needRefresh) {
      this.centerViewToDevices();
    }
    this.drawFromArray(this.dxfViewer.origin, this.devices);
    this.updateObjectsScale(true);
    this.refreshData();
    this.refresh();
  }

  updateAreasData(areasData, needRefresh = true) {
    this.areas = areasData;
    if (needRefresh) {
      this.drawFromArray(this.dxfViewer.origin, this.areas, "area");
      // this.updateObjectsScale(true);
      this.refreshData();
      this.refresh();
    }
  }

  setFetchingSize(val) {
    document.getElementById("progress-viewer").innerHTML = "Loading... ";
  }

  setProgress(val) {
    document.getElementById("progress-bar").style.width = val + "%";
    if (val == 1) {
      document.getElementById("contain-progress").style.display = "none";
    } else {
      document.getElementById("contain-progress").style.display = "block";
    }
  }

  onProgress(phase, size, totalSize) {
    if (totalSize === null) {
      this.setProgress(1);
      this.setFetchingSize(null);
    } else {
      this.setProgress((size / totalSize) * 100);
      this.setFetchingSize(
        `${(size / 1000000).toFixed(2)}MB/${(totalSize / 1000000).toFixed(2)}MB`
      );
    }
  }

  async Load(url) {
    try {
      await this.dxfViewer.Load({
        url,
        fonts: [],
        progressCbk: (phase, size, totalSize) => {
          this.onProgress(phase, size, totalSize);
        },
        workerFactory: DxfViewerWorker,
      });
    } catch (error) {
      console.warn(error);
    } finally {
      cameraDistance = this.dxfViewer.GetCamera().top;

      this.dxfViewer.GetLayers().forEach((layer) => {
        this.dxfViewer.ShowLayer(
          layer.name,
          [this.file.floor_layer_name].includes(layer.name)
        );
      });
      this.dxfViewer.GetScene().add(canvasObjects.grid);
      this.dxfViewer.GetScene().add(canvasObjects.plane);

      this.dxfViewer.GetCanvas().addEventListener("pointerdown", (e) => {
        this.pointerDown(e);
      });

      this.dxfViewer.GetCanvas().addEventListener("pointerup", (e) => {
        this.pointerUp(e);
      });

      this.dxfViewer.GetCanvas().addEventListener("dblclick", (e) => {
        this.dblClick(e);
      });

      this.dxfViewer.Subscribe("cameraZoom", (e) => {
        this.updateObjectsScale();
      });

      this.drawFromArray(this.dxfViewer.origin, this.devices);
      this.drawFromArray(this.dxfViewer.origin, this.groups, "group");
      this.drawFromArray(this.dxfViewer.origin, this.areas, "area");
      // this.drawTrackingPaths(this.dxfViewer.origin, this.peoples);
      // this.drawPeoplePositions(this.dxfViewer.origin, this.peoplePositions);
      // this.drawHeatMapPositions(this.dxfViewer.origin, this.heatMapPositions);
      this.centerViewToDevices();
      this.updateObjectsScale(true);

      this.refreshData();
      this.refresh();

      this.dxfViewer.Render();
    }
  }

  updateObjectsScale(force = false) {
    const api = canvasObjects;
    const camera = this.dxfViewer.GetCamera();

    if (camera) {
      const aa = (cameraDistance * 4) / 15000;
      const newScale = aa / camera.zoom;
      if (newScale != currentScale || force) {
        currentScale = newScale;
        api.objects.forEach((o) => {
          // Exclude the area
          if (!o.name.includes("Rect-area")) {
            o.scale.set(newScale, newScale, 1);
          }
        });
      }
    }
  }

  initHeatCells() {}

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
  }

  createCell(vector, w, h, number, name, color) {
    const CircleGeo = new THREE.BoxBufferGeometry(w, h, 1);
    const RingMaterial = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      color: color || 0x2ae5fa,
      opacity: 0.5,
      visible: false,
      transparent: true,
    });
    const voxel = new THREE.Mesh(CircleGeo, RingMaterial);
    voxel.position.copy(vector);
    voxel.name = name;
    voxel.renderOrder = 4;
    voxel.cell_number = number;
    return voxel;
  }

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
    // scene.add(voxel);+
    return voxel;
  }

  prepareSensorGridCells(sensor) {
    const gridCellsPos = this.calculateCellsPos(sensor, false);
    const { object } = sensor;
    const { exData } = object;
    canvasObjects.sensorSelectedCells = exData.selected_cells || [];

    const gridWidth = this.calcSensorArea(
      exData.ceil_height * 10,
      exData.angle
    );
    const degreeToRadian = exData.rotation * (Math.PI / 180);

    if (canvasObjects.sensorGridCells.length == 0) {
      const matLite = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        visible: false,
        side: THREE.FrontSide,
      });

      const geometry = new THREE.BoxBufferGeometry(gridWidth, gridWidth, 0);
      const groupGridCell = new THREE.Mesh(geometry, matLite);
      groupGridCell.name = `grid-cell-group-${exData.id}`;
      groupGridCell.position.copy(object.position);
      groupGridCell.rotation.z = degreeToRadian;

      canvasObjects.sensorGridCellsContainer = groupGridCell;
      this.dxfViewer.GetScene().add(groupGridCell);

      gridCellsPos.forEach((e, index) => {
        const cell = this.drawGridCell(
          new THREE.Vector3(e.x, e.y, 0),
          e.width - 10,
          e.height - 10,
          index
        );

        groupGridCell.add(cell);
      });
    } else {
      const CircleGeo = new THREE.BoxBufferGeometry(
        gridCellsPos[0].width - 10,
        gridCellsPos[0].height - 10,
        1
      );

      const geometry = new THREE.BoxBufferGeometry(gridWidth, gridWidth, 0);
      canvasObjects.sensorGridCellsContainer.position.copy(object.position);
      canvasObjects.sensorGridCellsContainer.geometry = geometry;
      canvasObjects.sensorGridCellsContainer.rotation.z = degreeToRadian;

      for (let i = 0; i < gridCellsPos.length; i++) {
        const voxel = canvasObjects.sensorGridCells[i];
        const pos = gridCellsPos[i];
        voxel.position.copy(new THREE.Vector3(pos.x, pos.y, 0));
        voxel.geometry = CircleGeo;
      }
    }
  }

  createTextAt(text, pos, name, height, color = null, position = "middle") {
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
      -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x) -
      geometry.boundingBox.min.x;

    if (position == "bottom") {
      const yBottom =
        -2.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
      geometry.translate(xMid, yBottom, 0);
    } else {
      geometry.translate(xMid, -height / 2, 0);
    }

    const mesh = new THREE.Mesh(geometry, matLite);
    mesh.position.copy(pos);
    mesh.renderOrder = 10000;
    mesh.name = name;

    mesh.onBeforeRender = function (renderer) {
      renderer.clearDepth();
    };
    scene.add(mesh);

    return mesh;
  }

  drawHeatCell(vector, w, h, number) {
    const voxel = this.createCell(vector, w, h, number, `heat-cell`, 0xdc2626);
    // voxel.material.visible = true;
    // const canvas = this.dxfViewer;
    // const scene = canvas.GetScene();
    // scene.add(voxel);
    return voxel;
  }

  prepareHeatMapCells(pos, data) {
    const heatCellsPos = this.calculateCellsPos(
      {
        object: { exData: data, position: pos },
      },
      false
    );
    if (!canvasObjects.heatmapDevices[data.id]) {
      const gridWidth = this.calcSensorArea(data.ceil_height * 10, data.angle);
      const degreeToRadian = data.rotation * (Math.PI / 180);

      const matLite = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        visible: true,
        side: THREE.FrontSide,
      });

      const geometry = new THREE.BoxBufferGeometry(gridWidth, gridWidth, 1);
      const groupHeatCell = new THREE.Mesh(geometry, matLite);
      groupHeatCell.name = `heat-cell-group-${data.id}`;
      groupHeatCell.device_id = data.id;
      groupHeatCell.position.copy(pos);
      groupHeatCell.rotation.z = degreeToRadian;
      const heatCells = [];
      const newHeatdata = heatmapByKeys[data.id] || { amount_people: 0 };

      // const colors = data.array_heat || aa;
      const colors = newHeatdata.array_heat || aa;

      const text = this.createTextAt(
        newHeatdata.amount_people.toString() || "0",
        pos,
        `heat-text-${data.id}`,
        400
      );
      text.device_id = data.id;

      heatCellsPos.forEach((e, index) => {
        const mesh = this.drawHeatCell(
          new THREE.Vector3(e.x, e.y, 0),
          e.width - 10,
          e.height - 10,
          index
        );
        mesh.exOriginPos = this.rotateAPointAroundAPointByAnAngle(
          new THREE.Vector3(e.originX, e.originY, 0),
          pos,
          data.rotation
        );

        // this.createTextAt(
        //   index.toString() || "0",
        //   mesh.exOriginPos,
        //   `heat-text-${data.id}`,
        //   100
        // );

        const color = colors[index];
        mesh.material.opacity = color_levels[color] || 0.5;
        heatCells.push(mesh);
        groupHeatCell.add(mesh);
      });

      this.dxfViewer.GetScene().add(groupHeatCell);
      canvasObjects.heatmapDevices[data.id] = heatCells;
    }
  }

  pointerUp(e) {
    if (this.heatmapMode || this.trackingMode) {
      return;
    }
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
      if (this.areaMode) {
        this.handleClickAtArea(api.selectedGroup);
      }
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
      console.log('herhe')
      if (!this.areaMode) {
        console.log('herhe_2222')
        this.handleClickAt();
      } else {
      }
    }
    api.isMove = false;
    this.dxfViewer.Render();
  }

  showHideSensorGrid(sensor, visible) {
    if (canvasObjects.sensorGridCells.length == 0) {
      return;
    }

    if (visible && sensor) {
      for (let i = 0; i < canvasObjects.sensorGridCells.length; i++) {
        const voxel = canvasObjects.sensorGridCells[i];
        voxel.material.visible = visible;
        if (canvasObjects.sensorSelectedCells.includes(voxel.cell_number)) {
          voxel.material.color = new THREE.Color(0xdc2626);
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
  }

  pointerDown(e) {
    if (this.heatmapMode || this.trackingMode) {
      return;
    }
    const canvas = this.dxfViewer;
    if (!canvas) {
      return;
    }

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
          // this.startTimer();
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
            // if (
            //   api.selectedSensor == null ||
            //   api.selectedSensor.object.exData.id !=
            //   intersects[0].object.exData.id
            // ) {
            //   api.selectedSensor = intersects[0];
            //   api.sensorSelectedCells = [];
            //   this.prepareSensorGridCells(api.selectedSensor);
            // }
            return;
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
              Math.abs(Math.abs(api.movingOffset.x) - width / 2) < resizeMin &&
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
              // if (this.onHideHeatGrid) {
              //   this.onHideHeatGrid(api.selectedSensor, [
              //     ...api.sensorSelectedCells,
              //   ]);
              // }
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
              // if (this.onUpdateHeatGrid) {
              //   this.onUpdateHeatGrid([...api.sensorSelectedCells]);
              // }
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
  }

  findObjectByName(name) {
    const canvas = this.dxfViewer;
    const scene = canvas.GetScene();
    const { children } = scene;
    const findData = children.filter((e) => e.name == name);
    return findData;
  }

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
  }

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
  }

  removeAllPeopleOfSceneWithoutId(scene) {
    if (!scene) {
      return;
    }

    const { children } = scene;
    const meshName = `people-position-`;
    const peoples = children.filter((e) => e.name.includes(meshName));
    peoples.forEach((people) => {
      scene.remove(people);
    });
  }

  removeAllPeopleOfScene(scene) {
    if (!scene) {
      return;
    }

    this.peoplePositions.forEach((p) => {
      this.removePeopleOfScene(p.id, scene);
    });
  }

  removePeopleOfScene(id, scene) {
    const { children } = scene;
    const meshName = `people-position-${id}`;
    const peoples = children.filter((e) => e.name.includes(meshName));
    peoples.forEach((people) => {
      scene.remove(people);
    });
  }

  refresh() {
    const canvas = this.dxfViewer;
    const api = canvasObjects;

    if (!canvas) {
      return;
    }

    const scene = canvas.GetScene();
    const { children } = scene;
    const heatCells = children.filter(
      (e) =>
        e.name.indexOf("heat-cell-group") != -1 ||
        e.name.indexOf("heat-text") !== -1
    );
    const otherObjects = children.filter(
      (e) => e.name.indexOf("box-") !== -1 || e.name.indexOf("Rect-area") !== -1
    );

    if (this.trackingMode) {
      heatCells.forEach((e) => {
        if (e.name.indexOf("heat-cell-group") != -1) {
          e.children.forEach((c) => {
            c.material.visible = false;
          });
        } else {
          e.material.visible = false;
        }
      });
      otherObjects.forEach((e) => {
        e.material.visible = false;
      });

      canvasObjects.sensorGridCells.forEach((e) => {
        e.material.visible = false;
      });

      this.peoplePositions.forEach((p) => {
        if (canvasObjects.peoplePositions[p.id]) {
          const path = canvasObjects.peoplePositions[p.id];
          path.forEach((m) => {
            m.material.visible = false;
          });
        }
      });
      this.heatMapPositions.forEach((p) => {
        if (canvasObjects.heatMapPositions[p.id]) {
          const path = canvasObjects.heatMapPositions[p.id];
          path.forEach((m) => {
            m.material.visible = false;
          });
        }
      });

      this.peoples.forEach((p) => {
        if (canvasObjects.trackingPaths[p.id]) {
          const path = canvasObjects.trackingPaths[p.id];
          let visible = false;
          if (this.trackingPeopleIds.includes(p.id)) {
            visible = true;
          }
          path.forEach((m) => {
            if (this.hoverPersonId) {
              if (m.name == "tracking-path2") {
                if (this.hoverPersonId != p.id) {
                  m.material.visible = visible;
                } else {
                  m.material.visible = false;
                }
              } else {
                if (this.hoverPersonId == p.id) {
                  m.material.visible = visible;
                } else {
                  m.material.visible = false;
                }
              }
            } else {
              m.material.visible = visible;
            }
          });
        }
      });
    } else if (this.peoplePositionMode) {
      heatCells.forEach((e) => {
        if (e.name.indexOf("heat-cell-group") != -1) {
          e.children.forEach((c) => {
            c.material.visible = false;
          });
        } else {
          e.material.visible = false;
        }
      });
      otherObjects.forEach((e) => {
        e.material.visible = false;
      });

      canvasObjects.sensorGridCells.forEach((e) => {
        e.material.visible = false;
      });

      this.peoples.forEach((p) => {
        if (canvasObjects.trackingPaths[p.id]) {
          const path = canvasObjects.trackingPaths[p.id];
          path.forEach((m) => {
            m.material.visible = false;
          });
        }
      });

      this.heatMapPositions.forEach((p) => {
        if (canvasObjects.heatMapPositions[p.id]) {
          const path = canvasObjects.heatMapPositions[p.id];
          path.forEach((m) => {
            m.material.visible = false;
          });
        }
      });

      if (this.peoplePositions.length === 0) {
        this.removeAllPeopleOfSceneWithoutId(scene);
      }

      this.peoplePositions.forEach((p) => {
        if (canvasObjects.peoplePositions[p.id]) {
          const path = canvasObjects.peoplePositions[p.id];

          this.removePeopleOfScene(p.id, scene);

          let visible = false;
          if (this.peoplePositionIds.includes(p.id)) {
            this.drawPersonPosition(canvas.origin, p);
            visible = true;
          }
          path.forEach((m) => {
            m.material.visible = visible;
          });
        }
      });
    } else if (this.heatMapPositionMode) {
      heatCells.forEach((e) => {
        if (e.name.indexOf("heat-cell-group") != -1) {
          e.children.forEach((c) => {
            c.material.visible = false;
          });
        } else {
          e.material.visible = false;
        }
      });
      otherObjects.forEach((e) => {
        e.material.visible = false;
      });

      canvasObjects.sensorGridCells.forEach((e) => {
        e.material.visible = false;
      });

      this.peoples.forEach((p) => {
        if (canvasObjects.trackingPaths[p.id]) {
          const path = canvasObjects.trackingPaths[p.id];
          path.forEach((m) => {
            m.material.visible = false;
          });
        }
      });

      this.peoplePositions.forEach((p) => {
        if (canvasObjects.peoplePositions[p.id]) {
          const path = canvasObjects.peoplePositions[p.id];
          path.forEach((m) => {
            m.material.visible = false;
          });
        }
      });
      this.heatMapPositions.forEach((p) => {
        if (canvasObjects.heatMapPositions[p.id]) {
          const path = canvasObjects.heatMapPositions[p.id];
          let visible = false;

          if (this.heatMapPositionIds.includes(p.id)) {
            visible = true;
          }
          path.forEach((m) => {
            m.material.visible = visible;
          });
        }
      });
    } else if (this.heatmapMode) {
      // In headmap mode, we do not show devices, we only show head cell of all sensors
      // So here we need to get all heat cells and make them visible
      heatCells.forEach((e) => {
        const device_id = e.device_id;
        let visible = false;
        if (this.visibleHeatMaps.includes(device_id)) {
          visible = true;
        }
        if (e.name.indexOf("heat-cell-group") != -1) {
          e.children.forEach((c) => {
            c.material.visible = visible;
          });
        } else {
          e.material.visible = visible;
        }
      });
      otherObjects.forEach((e) => {
        e.material.visible = false;
      });

      canvasObjects.sensorGridCells.forEach((e) => {
        e.material.visible = false;
      });

      this.peoplePositions.forEach((p) => {
        if (canvasObjects.peoplePositions[p.id]) {
          const path = canvasObjects.peoplePositions[p.id];
          path.forEach((m) => {
            m.material.visible = false;
          });
        }
      });
      this.heatMapPositions.forEach((p) => {
        if (canvasObjects.heatMapPositions[p.id]) {
          const path = canvasObjects.heatMapPositions[p.id];
          path.forEach((m) => {
            m.material.visible = false;
          });
        }
      });

      this.peoples.forEach((p) => {
        if (canvasObjects.trackingPaths[p.id]) {
          const path = canvasObjects.trackingPaths[p.id];
          path.forEach((m) => {
            m.material.visible = false;
          });
        }
      });
    } else {
      heatCells.forEach((e) => {
        heatCells.forEach((e) => {
          if (e.name.indexOf("heat-cell-group") != -1) {
            e.children.forEach((c) => {
              c.material.visible = false;
            });
          } else {
            e.material.visible = false;
          }
        });
      });

      if (this.peoplePositions) {
        this.peoplePositions.forEach((p) => {
          if (canvasObjects.peoplePositions[p.id]) {
            const path = canvasObjects.peoplePositions[p.id];
            path.forEach((m) => {
              m.material.visible = false;
            });
          }
        });
      }

      if (this.heatMapPositions) {
        this.heatMapPositions.forEach((p) => {
          if (canvasObjects.heatMapPositions[p.id]) {
            const path = canvasObjects.heatMapPositions[p.id];
            path.forEach((m) => {
              m.material.visible = false;
            });
          }
        });
      }

      if (this.peoples) {
        this.peoples.forEach((p) => {
          if (canvasObjects.trackingPaths[p.id]) {
            const path = canvasObjects.trackingPaths[p.id];
            path.forEach((m) => {
              m.material.visible = false;
            });
          }
        });
      }

      canvasObjects.sensorGridCells.forEach((e) => {
        e.material.visible = false;
      });

      otherObjects.forEach(async (e) => {
        // e is a Mesh
        if (e.name.indexOf("grid-cell") == 0) {
          e.material.visible = false;
        }

        if (e.name.indexOf("Rect-area") !== -1) {
          if (this.areaMode) {
            e.renderOrder = 9999;
          } else {
            e.renderOrder = -9999;
          }
        }

        if (e.name.indexOf("box") !== -1) {
          const exData = e.exData;
          // Here we will check and show/hide the item as we want
          e.material.visible = false;
          if (
            (deviceTypes.includes(exData.type) &&
              ((this.visibleDevices === null &&
                !this.groupedDevices.includes(exData.id)) ||
                (this.visibleDevices !== null &&
                  this.visibleDevices.includes(exData.id)))) ||
            (groupTypes.includes(exData.type) &&
              this.visibleGroups.includes(exData.id))
          ) {
            if (deviceTypes.includes(exData.type)) {
              e.material.visible = true;
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
                    e.material.map = icoUnscanSensor;
                  }
                } else {
                  if (data.type === "fixture") {
                    if (api.selectedObjects.includes(e.name)) {
                      if (data.status) {
                        e.material.map = icoScanLightOn;
                      } else {
                        e.material.map = icoSelectLight;
                      }
                    } else {
                      if (data.status) {
                        e.material.map = icoScanLightOn;
                      } else {
                        e.material.map = icoScanLight;
                      }
                    }
                  } else {
                    e.material.map = icoSensor;
                  }
                }
              }
            } else if (exData.type === "Group") {
              if (exData.scene_status) {
                e.material.map = icoGroupActive;
              } else {
                e.material.map = icoGroup;
              }
            }
          }
        }
      });
    }

    api.selectedObjects = [];
    this.onClick("single", null);
    canvas.Render();
  }

  refreshData() {
    const childGroups = [];
    const childDevices = [];

    const visibleGroups = [];

    if (this.activeGroup) {
      const groupsByKey = this.groups.reduce(
        (a, v) => ({ ...a, [`g-${v.id}`]: v }),
        {}
      );
      this.activeGroup = groupsByKey[`g-${this.activeGroup.id}`];
      for (let i = 0; i < this.history.length; i++) {
        if (this.history[i]) {
          const name = `g-${this.history[i].id}`;
          if (groupsByKey[name]) {
            this.history[i] = groupsByKey[name];
          }
        }
      }

      const name2 = `g-${this.activeGroup.id}`;
      if (groupsByKey[name2]) {
        this.activeGroup = groupsByKey[name2];
      }

      this.visibleDevices = this.activeGroup.device_ids;

      for (let i = 0; i < this.activeGroup.group_ids.length; i++) {
        let childGroup = this.groups.find(g => g.id === this.activeGroup.group_ids[i]);
        if (childGroup && (childGroup.device_ids.length > 0 || childGroup.group_ids.length > 0)) {
          visibleGroups.push(childGroup.id);
        }
      }
    } else {
      this.groups.forEach((group) => {
        childGroups.push(...group.group_ids);
        childDevices.push(...group.device_ids);
      });

      this.groups.forEach((group) => {
        if (!childGroups.includes(group.id) && (group.device_ids.length>0 || group.group_ids.length>0)) {
          if (group.group_ids.length > 0 && group.device_ids.length == 0) {
            for (let i = 0; i < group.group_ids.length; i++) {
              let childGroup = this.groups.find(g => g.id === group.group_ids[i]);
              if (childGroup && (childGroup.device_ids.length > 0 || childGroup.group_ids.length > 0)) {
                visibleGroups.push(group.id);
              }
            }
          }else {
            visibleGroups.push(group.id);
          }
         
        }
      });

      this.visibleDevices = null;
      this.groupedDevices = [...childDevices];
      this.visibleGroups = [...visibleGroups];
    }
  }

  GetViewer() {
    return this.dxfViewer;
  }

  calcSensorArea(ceilHeight, angle) {
    return Math.tan(((angle / 2) * Math.PI) / 180) * ceilHeight * 2;
  }

  calculateCellsPos(sensor, sameOrigin = true) {
    const { object } = sensor;
    const { exData, position } = object;
    const gridWidth = this.calcSensorArea(
      exData.ceil_height * 10,
      exData.angle
    );

    const cellWidth = gridWidth / 8;
    let offsetX = position.x;
    let offsetY = position.y;
    if (!sameOrigin) {
      offsetX = 0;
      offsetY = 0;
    }
    const startX = offsetX - gridWidth / 2;
    const startY = offsetY - gridWidth / 2;
    const results = [];
    for (let i = 0; i < 8; i++) {
      let sY = startY + i * cellWidth;
      for (let j = 0; j < 8; j++) {
        let sX = startX + j * cellWidth;
        const p1 = { x: sX, y: sY };
        const p2 = { x: sX + cellWidth, y: sY + cellWidth };
        const info = this.calcRectByTwoPoint(p1, p2);
        results.push({
          ...info,
          originX: info.x + position.x - offsetX,
          originY: info.y + position.y - offsetY,
        });
      }
    }
    return results;
  }

  findObjectClicked() {
    const canvas = this.dxfViewer;
    const cam = canvas.GetCamera();
    const api = canvasObjects;
    // let update = false;
    api.raycaster.setFromCamera(api.v2, cam);

    const intersects = api.raycaster
      .intersectObjects(api.objects)
      .filter((e) => {
        if (this.areaMode) {
          return (
            (e.object?.material?.visible &&
              e.object?.name.includes("Rect-area")) ||
            false
          );
        } else {
          return (
            e.object?.material?.visible && !e.object?.name.includes("Rect-area")
          );
        }
      });

    return intersects;
  }

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
  }

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
  }

  onPos(e, canvas, api) {
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
  }

  calcRectByTwoPoint(p1, p2) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
      width: Math.abs(p1.x - p2.x),
      height: Math.abs(p1.y - p2.y),
    };
  }

  updateMetaAndPos(origin, data, meshes, type) {
    if (type === "group" && data.positions.length > 0) {
      const groupPosition = data.positions[0];
      const v1 = this.convertPositionInScene(
        { x: groupPosition.x, y: groupPosition.y, z: 0 },
        origin
      );
      const name = this.getMeshName(data);
      if (meshes[name]) {
        meshes[name].position.copy(v1);
      }
    } else if (type === "area") {
      const v1 = this.convertPositionInScene(
        { x: data.x, y: data.y, z: 0 },
        origin
      );
      v1.x = v1.x + data.width / 2;
      v1.y = v1.y + data.height / 2;

      const name = this.getMeshName(data);
      console.log('updateMeta&Pos', name);
      if (meshes[name]) {
        console.log('updateMeta&Pos', meshes);
        meshes[name].geometry = new THREE.BoxBufferGeometry(data.width, data.height, 1);
        meshes[name].position.copy(v1);
      }
    } else {
      const v1 = this.convertPositionInScene(
        { x: data.x, y: data.y, z: 0 },
        origin
      );
      const name = this.getMeshName(data);
      if (meshes[name]) {
        meshes[name].position.copy(v1);
      }
    }
  }

  getIcon(data) {
    const api = canvasObjects;
    const name = this.getMeshName(data);
    const index = api.selectedObjects.indexOf(name);
    if (index >= 0) {
      api.selectedObjects.splice(index, 1);

      if (data.type === "fixture") {
        if (data.serial_number == null || data.serial_number.length < 3) {
          return icoUnscanLight;
        } else {
          if (data.status) {
            return icoScanLightOn;
          } else {
            return icoScanLight;
          }
        }
      } else if (data.type == "sensor") {
        if (data.serial_number == null || data.serial_number.length < 3) {
          return icoUnscanSensor;
        } else {
          return icoSensor;
        }
      } else {
        if (data.scene_status) {
          return icoGroupActive;
        } else {
          return icoGroup;
        }
      }
    } else {
      api.selectedObjects.push(name);
      if (data.type === "fixture") {
        if (data.serial_number == null || data.serial_number.length < 3) {
          return icoUnscanSelectedLight;
        } else {
          if (data.status) {
            // TO-DO: thay tấm hình bóng đèn màu cam có vòng select
            return icoSelectScanLightOn;
          } else {
            return icoSelectLight;
          }
        }
      } else if (data.type == "sensor") {
        if (data.serial_number == null || data.serial_number.length < 3) {
          return iconSelectUnscanSensor;
        } else {
          return iconSelectSensor;
        }
      } else {
        if (data.scene_status) {
          return iconSelectGroupActive;
        } else {
          return iconSelectGroup;
        }
      }
    }
  }

  drawTrackingPaths(origin, items) {
    if (!origin) return;
    if (!items) return;
    if (items.length === 0) return;
    const api = canvasObjects;
    const canvas = this.dxfViewer;
    const scene = canvas.GetScene();
    let count = 0;
    items.forEach((e) => {
      if (e.path.length) {
        count++;
        let material = new THREE.LineDashedMaterial({
          color: 0xf97316,
          linewidth: 8,
          scale: 0.7,
          dashSize: 30,
          gapSize: 20,
        });

        let material2 = new THREE.LineDashedMaterial({
          color: 0xf97316,
          linewidth: 8,
          scale: 0.7,
          dashSize: 30,
          gapSize: 20,
          transparent: true,
          opacity: 0.25,
          visible: false,
        });

        const meshName = `tracking-path`;

        // Create path line
        const points = [];
        e.path.forEach((position) => {
          // Convert dxf file position to dxf viewer position
          const v1 = this.convertPositionInScene(
            { x: position.x, y: position.y, z: 0 },
            origin
          );
          points.push(v1);
        });

        material.polygonOffset = true;
        material.polygonOffsetFactor = 1;
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        const line2 = new THREE.Line(geometry, material2);
        line.computeLineDistances();
        line.renderOrder = 9000;
        line.onBeforeRender = function (renderer) {
          renderer.clearDepth();
        };
        line.name = meshName;

        line2.computeLineDistances();
        line2.renderOrder = 7999;
        line2.onBeforeRender = function (renderer) {
          renderer.clearDepth();
        };
        line2.name = meshName + "2";

        scene.add(line);
        scene.add(line2);
        api.trackingPaths[e.id] = [line, line2];

        // Create icon and text
        // const firstPosition = e.path[0];
        // const pos = this.convertPositionInScene(
        //   { x: firstPosition.x, y: firstPosition.y, z: 0 },
        //   origin
        // );
        // const text = this.createTextAt(
        //   e.name || "",
        //   pos,
        //   meshName,
        //   100,
        //   0x5048e5,
        //   "bottom"
        // );
        // text.renderOrder = 6000;
        // text.onBeforeRender = function (renderer) {
        //   renderer.clearDepth();
        // };
        // api.trackingPaths[e.id].push(text);

        // const people = this.drawObjectAt(pos, 300, 300, {
        //   map: icoTrackPeople,
        //   opacity: 1,
        // });
        // people.name = meshName;
        // api.trackingPaths[e.id].push(people);
      }
    });
  }

  drawPeoplePositions(origin, items) {
    if (!origin) return;
    if (items.length === 0) return;
    const api = canvasObjects;
    const canvas = this.dxfViewer;
    const scene = canvas.GetScene();
    items.forEach((e) => {
      if (e.position.length) {
        const meshName = `people-position-${e.id}`;

        // Create icon and text
        const firstPosition = e.position[0];
        const pos = this.convertPositionInScene(
          { x: firstPosition.x, y: firstPosition.y, z: 0 },
          origin
        );
        const text = this.createTextAt(
          e.name || "",
          pos,
          meshName,
          100,
          0x5048e5,
          "bottom"
        );
        text.renderOrder = 6000;
        text.onBeforeRender = function (renderer) {
          renderer.clearDepth();
        };
        api.peoplePositions[e.id] = [text];

        const people = this.drawObjectAt(pos, 300, 300, {
          map: icoTrackPeople,
          opacity: 1,
        });
        people.name = meshName;
        api.peoplePositions[e.id].push(people);
      }
    });
  }

  drawPersonPosition(origin, item) {
    if (!origin) return;
    const api = canvasObjects;
    const canvas = this.dxfViewer;
    const scene = canvas.GetScene();
    if (item.position.length) {
      const meshName = `people-position-${item.id}`;

      // Create icon and text
      const firstPosition = item.position[0];
      const pos = this.convertPositionInScene(
        { x: firstPosition.x, y: firstPosition.y, z: 0 },
        origin
      );
      const text = this.createTextAt(
        item.name || "",
        pos,
        meshName,
        100,
        0x5048e5,
        "bottom"
      );
      text.renderOrder = 6000;
      text.onBeforeRender = function (renderer) {
        renderer.clearDepth();
      };
      api.peoplePositions[item.id] = [text];

      const people = this.drawObjectAt(pos, 300, 300, {
        map: icoTrackPeople,
        opacity: 1,
      });
      people.name = meshName;
      api.peoplePositions[item.id].push(people);
    }
  }

  drawHeatMapPositions(origin, items) {
    if (!origin) return;
    if (items.length === 0) return;
    const api = canvasObjects;
    const canvas = this.dxfViewer;
    const scene = canvas.GetScene();

    items.forEach((e) => {
      if (e.positions.length) {
        const meshName = `heatmap-position`;
        const arrHeatPos = [];

        e.positions.forEach((position) => {
          const geometry = new THREE.CircleGeometry(400, 32);
          const material = new THREE.MeshBasicMaterial({
            side: THREE.FrontSide,
            map: iconHeatMapTile,
            transparent: true,
            opacity: 0.5,
          });

          const mesh = new THREE.Mesh(geometry, material);
          const v1 = this.convertPositionInScene(
            { x: position.x, y: position.y, z: 0 },
            origin
          );
          mesh.position.copy(v1);
          mesh.name = meshName;
          mesh.onBeforeRender = (renderer) => {
            renderer.clearDepth();
          };
          scene.add(mesh);
          arrHeatPos.push(mesh);
        });

        // Draw text
        const ax = parseFloat(e.x) + parseFloat(e.width) / 2;
        const ay = parseFloat(e.y) + parseFloat(e.height) / 2;
        const pos = this.convertPositionInScene({ x: ax, y: ay, z: 0 }, origin);
        const text = this.createTextAt(
          e.amount_people.toString() || "0",
          pos,
          `heat-text-${e.id}`,
          300,
          0xffffff
        );
        arrHeatPos.push(text);

        const geometry3 = new THREE.CircleGeometry(400, 32);
        const material3 = new THREE.MeshBasicMaterial({
          side: THREE.FrontSide,
          color: 0xf97316,
          transparent: false,
        });

        const mesh3 = new THREE.Mesh(geometry3, material3);
        mesh3.position.copy(new THREE.Vector3(pos.x, pos.y, pos.z));
        mesh3.name = meshName;
        scene.add(mesh3);
        arrHeatPos.push(mesh3);

        const namePos = new THREE.Vector3(pos.x, pos.y - 630, pos.z);
        const text2 = this.createTextAt(
          e.name || "",
          namePos,
          `heat-text-name-${e.id}`,
          150,
          0xffffff
        );

        arrHeatPos.push(text2);

        const textWidth = text2.geometry?.boundingBox?.max?.x * 2 || 0;
        const textHeight = text2.geometry?.boundingBox?.max?.y * 2 || 0;

        const CircleGeo = new THREE.BoxBufferGeometry(
          textWidth + 170,
          textHeight + 170,
          0
        );
        const RingMaterial = new THREE.MeshBasicMaterial({
          side: THREE.FrontSide,
          color: 0x0f172a,
          visible: true,
          opacity: 0.2,
          transparent: false,
        });

        const mesh4 = new THREE.Mesh(CircleGeo, RingMaterial);
        mesh4.position.copy(namePos);
        mesh4.name = meshName;
        // mesh4.onBeforeRender = (renderer) => {
        //   renderer.clearDepth();
        // };
        scene.add(mesh4);
        arrHeatPos.push(mesh4);

        api.heatMapPositions[e.id] = arrHeatPos;
        // Create icon and text
        // const firstPosition = e.position[0];
        // const pos = this.convertPositionInScene({ x: firstPosition.x, y: firstPosition.y, z: 0 }, origin);
        // const text = this.createTextAt(
        //   e.name || "",
        //   pos,
        //   meshName,
        //   100,
        //   0x5048e5,
        //   "bottom"
        // );
        // text.renderOrder = 6000;
        // text.onBeforeRender = function (renderer) {
        //   renderer.clearDepth();
        // };
        // api.peoplePositions[e.id] = [text];

        // const people = this.drawObjectAt(pos, 300, 300, {
        //   map: icoTrackPeople,
        //   opacity: 1,
        // });
        // people.name = meshName;
        // api.peoplePositions[e.id].push(people);
      }
    });
  }

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

    const updateMeta = items.filter((e) => names.includes(this.getMeshName(e)));

    updateMeta?.forEach((d) => {
      if (type === "group" || type === "area" || type !== "group") {
        this.updateMetaAndPos(origin, d, temp, type);
      }
    });

    results?.forEach(async (d) => {
      if (type == "group") {
        if (d.positions.length > 0) {
          const groupPosition = d.positions[0];
          const v1 = this.convertPositionInScene(
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
        const v1 = this.convertPositionInScene(
          { x: d.x, y: d.y, z: 0 },
          origin
        );
        this.drawAt(v1, lightSize, d);

        // We need to init the heat cell for all sensors so we do not care about them later
        if (d.type == "sensor") {
          this.prepareHeatMapCells(v1, d);
        }
      }
    });
    canvas.Render();
  }

  drawObjectAt(pos, w, h, options = {}) {
    const CircleGeo = new THREE.BoxBufferGeometry(w, h, 1);
    const RingMaterial = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      visible: true,
      // color: 0x2ae5fa,
      // map: icon,
      transparent: true,
      ...options,
    });

    const voxel = new THREE.Mesh(CircleGeo, RingMaterial);
    voxel.position.copy(pos);

    const canvas = this.dxfViewer;
    const scene = canvas.GetScene();
    scene.add(voxel);

    return voxel;
  }

  drawAt(vector, wbox1, data) {
    const canvas = this.dxfViewer;
    const scene = canvas.GetScene();
    const api = canvasObjects;
    const type = data.type || "fixture";
    let icon = icoScanLight;
    wbox1 = wbox1 * 1.5;
    if (type === "fixture") {
      if (data.serial_number == null || data.serial_number.length < 3) {
        icon = icoUnscanLight;
      } else {
        icon = icoScanLight;
      }
    } else if (type === "sensor") {
      if (data.serial_number == null || data.serial_number.length < 3) {
        icon = icoUnscanSensor;
      } else {
        icon = icoSensor;
      }
    } else if (type === "Group") {
      if (data.scene_status) {
        icon = icoGroupActive;
      } else {
        icon = icoGroup;
      }
    }

    let w, h;
    w = h = wbox1;
    const CircleGeo = new THREE.BoxBufferGeometry(w, h, 1);

    const RingMaterial = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      visible: true,
      // color: 0x2ae5fa,
      map: icon,
      transparent: true,
    });

    const voxel = new THREE.Mesh(CircleGeo, RingMaterial);
    voxel.position.copy(vector);
    voxel.name = this.getMeshName(data);
    voxel.exData = data;

    scene.add(voxel);
    api.objects.push(voxel);
  }

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
  }

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
              let result = null;
              if (deviceTypes.includes(exData.type)) {
                const selectedDevices = this.devices.filter((e) => {
                  return mesh.name.includes(`-${e.id}`);
                });
                if (
                  selectedDevices.length &&
                  canvasObjects.selectedObjects.length > 0
                ) {
                  result = selectedDevices[0];
                }
              } else {
                const selectedGroups = this.groups.filter((e) => {
                  return mesh.name.includes(`-${e.id}`);
                });
                if (
                  selectedGroups.length &&
                  canvasObjects.selectedObjects.length > 0
                ) {
                  result = selectedGroups[0];
                }
              }
              this.onClick("single", result);
            }
          } else {
            // if (this.onShapeClick) {
            //   this.onShapeClick(exData.id, exData);
            // }
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
  }

  getMeshName(object) {
    if (object && object.type == "area") {
      return `Rect-area-${object.id}`;
    }
    return `box-${deviceTypeName[object.type] || "unknow"}-${object.id}`;
  }

  convertPositionInScene(pos, originScene) {
    const x = parseFloat(pos.x);
    const y = parseFloat(pos.y);
    return new THREE.Vector3(x - originScene.x, y - originScene.y, pos.z);
  }

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
  }

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
    voxel.renderOrder = -9999;

    scene.add(voxel);
    return voxel;
  }

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
  }

  onBack() {
    if (this.history.length == 0) {
      return;
    }
    this.activeGroup = this.history.pop();
    if (this.activeGroup) {
      this.activeGroup = this.groups.find(g => g.id === this.activeGroup.id);
      this.groupedDevices = [];
      let visibleGroups = [];

      for (let i = 0; i < this.activeGroup.group_ids.length; i++) {
        let group = this.groups.find(g => g.id === this.activeGroup.group_ids[i]);
        if (group && (group.device_ids.length > 0 || group.group_ids.length > 0)) {
          visibleGroups.push(group.id);
        }
      }

      // Nhu the nay la dc roi
      this.visibleGroups = visibleGroups;

      // Nhu the nay la dc roi
      this.visibleDevices = this.activeGroup.device_ids;
    } else {
      this.visibleDevices = null;
      this.refreshData();
    }
    this.refresh();
    this.dxfViewer.Render();
  }

  rotateAPointAroundAPointByAnAngle(point, center, theta) {
    if (theta == 0) {
      return point;
    }

    const degreeToRadian = theta * (Math.PI / 180);
    const cosTheta = Math.cos(degreeToRadian);
    const sinTheta = Math.sin(degreeToRadian);

    const x =
      cosTheta * (point.x - center.x) -
      sinTheta * (point.y - center.y) +
      center.x;
    const y =
      sinTheta * (point.x - center.x) +
      cosTheta * (point.y - center.y) +
      center.y;
    return new THREE.Vector3(x, y, 0);
  }

  dblClick(e) {
    if (this.heatmapMode || this.trackingMode) {
      return;
    }
    // console.log("double click");
    if (this.activeGroup) {
      this.activeGroup = this.groups.find(g => g.id === this.activeGroup.id);
    }
    this.history.push(this.activeGroup);
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
      let group = this.groups.find(g => g.id === objects[0].object.exData.id);
      this.activeGroup = group;

      if (group) {
        let visibleGroups = [];

        for (let i = 0; i < this.activeGroup.group_ids.length; i++) {
          let childGroup = this.groups.find(g => g.id === this.activeGroup.group_ids[i]);
          if (childGroup && (childGroup.device_ids.length > 0 || childGroup.group_ids.length > 0)) {
            visibleGroups.push(childGroup.id);
          }
        }

        this.groupedDevices = [];
        this.visibleGroups = visibleGroups;
        this.visibleDevices = group.device_ids;
      }

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
          if (group.scene_status) {
            e.material.map = icoGroupActive;
          } else {
            e.material.map = icoGroup;
          }
        });
      api.selectedObjects = [];
      this.refresh();
    }
    if (this.dblClickCallback) {
      this.dblClickCallback(that);
    }
  }
  groupBy(xs, f) {
    return xs.reduce(
      (r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r),
      {}
    );
  }

  moveCamera(coordinate, zoom) {
    const canvas = this.dxfViewer;
    if (!canvas || !canvas.origin) {
      return;
    }

    const location = {
      target: {
        x: coordinate.x,
        y: coordinate.y,
        z: 0,
      },
      position: {
        x: coordinate.x,
        y: coordinate.y,
        z: 0.9999999999993942,
      },
      zoom: zoom || canvas.GetCamera().zoom,
    };

    location.target = this.convertPositionInScene(
      location.target,
      canvas.origin
    );

    location.position = this.convertPositionInScene(
      location.position,
      canvas.origin
    );

    canvas.GetControls().SetState(location);
    canvas.GetControls().reset();
  }

  centerViewToDevices() {
    const canvas = this.dxfViewer;

    if (!canvas) {
      return;
    }

    const CENTER_X = centerOfDevices(this.devices, "x");
    const CENTER_Y = centerOfDevices(this.devices, "y");

    const camera = canvas.GetCamera();
    const camDistance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));

    let ZOOM_LEVEL = 0;
    const { zoomLevel } = calculateZoomAndScale(
      camDistance,
      CENTER_X,
      CENTER_Y
    );

    if (zoomLevel > 4) {
      ZOOM_LEVEL = 2 - zoomReduceFactor;
    } else {
      ZOOM_LEVEL = zoomLevel - zoomReduceFactor;
    }

    this.moveCamera({ x: CENTER_X, y: CENTER_Y }, ZOOM_LEVEL);
  }

  destroy() {
    this.dxfViewer.Destroy();
  }
}
