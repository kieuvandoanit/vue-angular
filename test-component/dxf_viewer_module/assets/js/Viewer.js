import { DxfViewer } from "./DxfViewer/DxfViewer";
// import DxfViewerWorker from "worker-loader!./DxfViewerWorker";
import * as THREE from "three";
import _ from "lodash";
import {
  calculateZoomAndScale,
  centerOfDevices,
  setLocation,
} from "./Helper/DrawHelper";
const fontJson = require("./helvetiker_regular.typeface");
const fontJson2 = require("./Inter_Bold.json");

const font = new THREE.Font(fontJson);
const fontInter = new THREE.Font(fontJson2);

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

let objectsMove = [];
let parentGroup = null;

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
    editPolygonMess: null,
    movingOffset: { x: 0, y: 0 },
    resizeMode: false,
    resizeStartPos: null,
    movingObject: { intersects: null },
    selectedGroup: null,
    preSelectedGroup: null,
    selectedArea: null,
    preSelectedArea: null,
    selectedPolygonArea: null,
    preselectedPolygonArea: null,
    resizeBoxes: [],

    polygonResizeBoxes: [],

    // Move device
    selectedDevice: null,
    preSelectedDevice: null,
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
  "/assets/icons/unscanlight.png"
);
const icoScanLight = new THREE.TextureLoader().load(
  "/assets/icons/scanlight.png"
);
const icoScanLightOn = new THREE.TextureLoader().load(
  "/assets/icons/scanlighton.png"
);
const icoSelectScanLightOn = new THREE.TextureLoader().load(
  "/assets/icons/selectscanlighton.png"
);
const icoSelectLight = new THREE.TextureLoader().load(
  "/assets/icons/selectlight.png"
);
const icoUnscanSelectedLight = new THREE.TextureLoader().load(
  "/assets/icons/unscanselected.png"
);
const iconSelectSensor = new THREE.TextureLoader().load(
  "/assets/icons/selectsensor.png"
);
const iconSelectUnscanSensor = new THREE.TextureLoader().load(
  "/assets/icons/selectunscansensor.png"
);
const icoGroup = new THREE.TextureLoader().load("/assets/icons/group.png");
const icoGroupActive = new THREE.TextureLoader().load(
  "/assets/icons/activegroup.png"
);
const icoTrackPeople = new THREE.TextureLoader().load(
  "/assets/icons/people.png"
);
const iconSelectGroup = new THREE.TextureLoader().load(
  "/assets/icons/selectgroup.png"
);
const iconSelectGroupActive = new THREE.TextureLoader().load(
  "/assets/icons/selectgroupactive.png"
);

const icoSensor = new THREE.TextureLoader().load("/assets/icons/sensor.png");
const icoUnscanSensor = new THREE.TextureLoader().load(
  "/assets/icons/unscan-sensor.svg"
);

const iconHeatMapTile = new THREE.TextureLoader().load(
  "/assets/icons/HeatmapTile.png"
);

const icoMoveGroup = new THREE.TextureLoader().load(
  "/assets/icons/move-group-off.png"
);

const icoMoveGroupOn = new THREE.TextureLoader().load(
  "/assets/icons/move-group-on.png"
);

const icoMoveSensor = new THREE.TextureLoader().load(
  "/assets/icons/move-sensor.png"
);

const icoMoveSensorOn = new THREE.TextureLoader().load(
  "/assets/icons/move-sensor-on.png"
);

const icoMoveLightScan = new THREE.TextureLoader().load(
  "/assets/icons/move-scanned-light.png"
);

const icoMoveLightUnscan = new THREE.TextureLoader().load(
  "/assets/icons/move-unscan-light.png"
);

const icoMoveLightScanOn = new THREE.TextureLoader().load(
  "/assets/icons/move-light-on-scanned.png"
);

const icoMoveLightUnscanOn = new THREE.TextureLoader().load(
  "/assets/icons/move-unscan-light-on.png"
);

const icoMoveSensorUnscan = new THREE.TextureLoader().load(
  "/assets/icons/move-unscan-sensor.png"
);
// const font = new THREE.FontLoader().load("/static/icons/sensor.png");

const groupTypes = ["Group", "Room", "Floor"];
const deviceTypes = ["fixture", "sensor"];
let dxfViewer = null;
let that = null;
let deviceByKeys = {};
let heatmapByKeys = {};
let groupByKeys = {};

let scale = 1;
let scaleFactor = 1;
let cameraDistance = 0;
let currentScale = 0;
let scaleResizeBox = 0;

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

export class Viewer {
  constructor(
    domContainer,
    options = null,
    groups = [],
    devices = [],
    areas = [],
    file = null,
    heatmaps = [],
    backgroundViewer = "#fff",
    structureMode = false
  ) {
    canvasObjects = createCanvasObjects();
    this.dxfViewer = new DxfViewer(domContainer, {
      clearColor: new THREE.Color(backgroundViewer),
      autoResize: true,
      colorCorrection: true,
    });

    dxfViewer = this;
    this.file = file || { floor_layer_name: "XREF", people_tracking: [] };

    this.areaMode = false;
    this.deviceMode = false;
    this.groupMode = false;
    this.moveAllInGroupMode = false;
    this.addMode = false;
    this.addDevice = false;

    this.drawPolygonArea = false;

    this.movingAction = false;

    this.sensorMode = true;
    this.enableMovingDevice = false;
    this.enableMovingGroup = false;
    this.enableMovingAllInGroup = false;

    this.deletedDeviceId = 0;
    this.deletedAreaId = 0;
    this.deletedGroupId = 0;

    this.heatmapMode = false;
    this.trackingMode = false;
    this.peoplePositionMode = false;
    this.heatMapPositionMode = false;
    this.structureMode = structureMode;

    this.trackingPeopleIds = [];
    this.visibleHeatMaps = [];
    this.peoplePositionIds = [];
    this.heatMapPositionIds = [];

    this.groups = [
      {
        name: "DDD",
        x: "0",
        y: "0",
        x_color: 0.0,
        y_color: 0.0,
        color_type: "cct",
        building_id: 65,
        id: 346,
        user_id: 2,
        type: "Group",
        is_active: false,
        project_id: 76,
        scene_status: false,
        scene_id: 2845,
        energy: 0,
        total_amount: 0,
        file_id: 112,
        is_layer: false,
        light: 6000,
        color: "6000",
        intensity: 100,
        device_ids: [],
        group_ids: [],
        positions: [],
        is_featured: false,
        devices_status: [],
      },
      {
        name: "Seizo 95",
        x: "1360.7705710131795",
        y: "3662.178420664635",
        x_color: 0.0,
        y_color: 0.0,
        color_type: "cct",
        building_id: 65,
        id: 344,
        user_id: 14,
        type: "Group",
        is_active: false,
        project_id: 76,
        scene_status: false,
        scene_id: 2829,
        energy: 0,
        total_amount: 0,
        file_id: 112,
        is_layer: false,
        light: 6000,
        color: "6000",
        intensity: 100,
        device_ids: [5542, 5615],
        group_ids: [],
        positions: [
          {
            x: "1360.7705710131795",
            y: "3662.178420664635",
            file_id: 112,
            f_x: "1072.0911047311922",
            f_y: "3646.6597590586193",
            f_width: "605.5806919986992",
            f_height: "16.371146746438626",
          },
        ],
        is_featured: false,
        devices_status: [
          { id: 5542, status: false },
          { id: 5615, status: false },
        ],
      },
      {
        name: "Track Linear",
        x: "1360.7705710131795",
        y: "3050.5938667795044",
        x_color: 0.0,
        y_color: 0.0,
        color_type: "cct",
        building_id: 65,
        id: 345,
        user_id: 14,
        type: "Group",
        is_active: false,
        project_id: 76,
        scene_status: false,
        scene_id: 2837,
        energy: 0,
        total_amount: 0,
        file_id: 112,
        is_layer: false,
        light: 6000,
        color: "6000",
        intensity: 100,
        device_ids: [5618, 5619, 5620],
        group_ids: [],
        positions: [
          {
            x: "1360.7705710131795",
            y: "3050.5938667795044",
            file_id: 112,
            f_x: "947.1299798510556",
            f_y: "3046.1615452291426",
            f_width: "763.662295669126",
            f_height: "8.12403433590407",
          },
        ],
        is_featured: false,
        devices_status: [
          { id: 5618, status: false },
          { id: 5619, status: false },
          { id: 5620, status: false },
        ],
      },
    ];
    this.devices = [
      {
        x: "2861",
        y: "3663",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5540,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "2791.293304877813",
        y: "3062.4093349833024",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 6",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5538,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3140.6280364511113",
        y: "3062.4093349833024",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 7",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "SENSORS",
        id: 5546,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "1072.0911047311922",
        y: "3646.6597590586193",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: "T0301S00067Q",
        channels: ["fusion"],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5542,
        file_id: 112,
        rotation: 0,
        groups: [
          {
            id: 344,
            name: "Seizo 95",
            type: "Group",
            project_id: 76,
            building_id: null,
          },
        ],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "2861",
        y: "3663",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Magnum 200",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5548,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-6832",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5556,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-6232",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5557,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-5633",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5558,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-5033",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5559,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-4426",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5560,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "-2388",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5572,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "-1488",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5573,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "-588",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5574,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "311",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5575,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "1211",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5576,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "2111",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5577,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3011",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5578,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3911",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5579,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "4811",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5580,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "5711",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5581,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6611",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5582,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-6832",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5588,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-6232",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5589,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-5633",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5590,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-5033",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5591,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-4426",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5592,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "-2388",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5604,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "-1488",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5605,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "-588",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5606,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "311",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5607,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "1211",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5608,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "2111",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5609,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3011",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5610,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3911",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5611,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "4811",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5612,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "5711",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5613,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6611",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5614,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "1677.6717967298914",
        y: "3663.030905805058",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: "T0301S00069E",
        channels: ["fusion"],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "SENSORS",
        id: 5615,
        file_id: 112,
        rotation: 0,
        groups: [
          {
            id: 344,
            name: "Seizo 95",
            type: "Group",
            project_id: 76,
            building_id: null,
          },
        ],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "2303.2238351827577",
        y: "3671.1545217644903",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5616,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3457.466072845496",
        y: "3655.4663517631443",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "SENSORS",
        id: 5617,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "947.1299798510556",
        y: "3046.1615452291426",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 1",
        mac_address: null,
        status: false,
        serial_number: "T0301S0006HI",
        channels: ["fusion"],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5618,
        file_id: 112,
        rotation: 0,
        groups: [
          {
            id: 345,
            name: "Track Linear",
            type: "Group",
            project_id: 76,
            building_id: null,
          },
        ],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "1328.9609882267946",
        y: "3054.2855795650466",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 2",
        mac_address: null,
        status: false,
        serial_number: "T0301S0006H9",
        channels: ["fusion"],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "SENSORS",
        id: 5619,
        file_id: 112,
        rotation: 0,
        groups: [
          {
            id: 345,
            name: "Track Linear",
            type: "Group",
            project_id: 76,
            building_id: null,
          },
        ],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "1710.7922755201816",
        y: "3046.1615452291426",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 3",
        mac_address: null,
        status: false,
        serial_number: "T0301S0006DZ",
        channels: ["fusion"],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5620,
        file_id: 112,
        rotation: 0,
        groups: [
          {
            id: 345,
            name: "Track Linear",
            type: "Group",
            project_id: 76,
            building_id: null,
          },
        ],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "2084.5002257717847",
        y: "3054.2855795650466",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 4",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "SENSORS",
        id: 5621,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "2441.9585733045146",
        y: "3054.2850217297505",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 5",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5622,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3489.9629074832333",
        y: "3070.533648236855",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 8",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "SENSORS",
        id: 5623,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3847.42181285126",
        y: "3070.533648236855",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 9",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5624,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
    ];
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
    // this.viewerObjects = null;
    this.polygonPoints = []; // use for create new or resize polygon
    this.selectedResizeBox = null;

    deviceByKeys = devices.reduce(
      (a, v) => ({ ...a, [this.getMeshName(v)]: v }),
      {}
    );

    heatmapByKeys = this.heatmaps.reduce(
      (a, v) => ({ ...a, [v.device_id]: v }),
      {}
    );

    this.groupByKeys = groups.reduce(
      (a, v) => ({ ...a, [this.getMeshName(v)]: v }),
      {}
    );

    this.creatingArea = null;
    this.creatingPolygonArea = null;
    this.creatingDevice = null;
    that = this;
  }

  // Change to area mode
  setAreaMode(status) {
    this.areaMode = status;

    this.deviceMode = false;
    this.groupMode = false;
    this.sensorMode = !status;
    this.heatmapMode = false;
    this.trackingMode = false;
    if (!status) {
      const api = canvasObjects;
      api.selectedArea = null;
      api.selectedPolygonArea = null;
      this.creatingArea = null;
      this.creatingPolygonArea = null;
      this.updateResizeBoxes(false, null, 0, 0);
      this.updatePolygonResizeBoxes(false, null);
    }
    this.refresh();
  }

  // Click button add area, call this
  addAreaObj(status) {
    // this.setAreaMode(status);
    this.addMode = status;
    this.addDevice = false;
    this.drawPolygonArea = false;
    this.refresh();
  }

  // Click button add polygon area, call this
  addPolygonAreaObj(status) {
    // this.setAreaMode(status);
    this.drawPolygonArea = status;
    this.addDevice = false;
    this.polygonPoints = [];
    this.refresh();
  }

  setDeviceMode(status) {
    this.deviceMode = status;
    this.sensorMode = status;

    this.areaMode = false;
    this.groupMode = false;
    this.heatmapMode = false;
    this.trackingMode = false;
    // this.refresh();
  }

  setGroupMode(status) {
    this.groupMode = status;
    if (this.moveAllInGroupMode && !status) {
      this.sensorMode = this.moveAllInGroupMode;
    } else {
      this.sensorMode = status;
    }

    this.areaMode = false;
    this.moveAllInGroupMode = false;
    this.deviceMode = false;
    this.heatmapMode = false;
    this.trackingMode = false;
    // this.refresh();
  }

  setMoveAllInGroupMode(status) {
    this.moveAllInGroupMode = status;
    if (this.groupMode && !status) {
      this.sensorMode = this.groupMode;
      this.groupMode = this.groupMode;
    } else {
      this.sensorMode = status;
      this.groupMode = status;
    }

    this.areaMode = false;

    this.deviceMode = false;
    this.heatmapMode = false;
    this.trackingMode = false;
  }

  // Click button add device, call this
  addDeviceObj(status) {
    this.addMode = status;
    this.addDevice = status;
    this.deviceMode = status;
    this.sensorMode = !status;

    this.areaMode = false;
    this.heatmapMode = false;
    this.trackingMode = false;
    this.refresh();
  }

  setEnableMovingDevice(status) {
    this.enableMovingDevice = status;
    this.enableMovingGroup = false;
    const api = canvasObjects;
    if (api.selectedObjects.length > 0) {
      const canvas = this.dxfViewer;
      if (!canvas) {
        return;
      }
      const scene = canvas.GetScene();
      const { children } = scene;

      children
        .filter(
          (e) => e.name.includes("box-Group") || e.name.includes("box-devices")
        )
        .forEach((e) => {
          e.material.map = this.getIcon(e.exData);
        });
      canvas.Render();
    }
  }

  setEnableMovingGroup(status) {
    this.enableMovingGroup = status;
    this.enableMovingDevice = false;
    const api = canvasObjects;
    if (api.selectedObjects.length > 0) {
      const canvas = this.dxfViewer;
      if (!canvas) {
        return;
      }
      const scene = canvas.GetScene();
      const { children } = scene;

      children
        .filter(
          (e) => e.name.includes("box-Group") || e.name.includes("box-devices")
        )
        .forEach((e) => {
          e.material.map = this.getIcon(e.exData);
        });
      canvas.Render();
    }
  }

  setEnableMovingAllInGroup(status) {
    this.enableMovingAllInGroup = status;
    this.enableMovingDevice = false;
    const api = canvasObjects;
    if (api.selectedObjects.length > 0) {
      const canvas = this.dxfViewer;
      if (!canvas) {
        return;
      }
      const scene = canvas.GetScene();
      const { children } = scene;
      parentGroup = api.selectedObjects[0];
      objectsMove = [];
      this.setListObjectNeedMove(api.selectedObjects, children);

      if (status) {
        children
          .filter(
            (e) =>
              e.name.includes("box-Group") || e.name.includes("box-devices")
          )
          .forEach((e) => {
            objectsMove.map((item) => {
              if (item.name === e.name) {
                e.material.visible = true;
                e.material.opacity = 0.5;
                api.selectedObjects.push(e.name);
              }
            });

            e.material.map = this.getIcon(e.exData);
          });
      } else {
        children
          .filter(
            (e) =>
              e.name.includes("box-Group") || e.name.includes("box-devices")
          )
          .forEach((e) => {
            objectsMove.map((item) => {
              if (item.name === e.name) {
                e.material.visible = false;
                e.material.opacity = 1;
                api.selectedObjects = api.selectedObjects.filter(
                  (item) => item !== e.name
                );
              }
            });

            e.material.map = this.getIcon(e.exData);
          });
      }

      canvas.Render();
    }
  }

  setListObjectNeedMove(selectedObjects, children) {
    let objectSelected = null;
    children
      .filter(
        (e) => e.name.includes("box-Group") || e.name.includes("box-devices")
      )
      .forEach((e) => {
        if (selectedObjects.indexOf(e.name) != -1) {
          objectSelected = e.exData;
        }
      });

    children
      .filter(
        (e) => e.name.includes("box-Group") || e.name.includes("box-devices")
      )
      .forEach((e) => {
        if (
          objectSelected.device_ids.indexOf(e.exData.id) != -1 &&
          (e.exData.type == "fixture" || e.exData.type == "sensor")
        ) {
          if (
            !objectsMove.some((item) => item.name === e.name) ||
            objectsMove.length === 0
          ) {
            objectsMove.push(e);
          }
        }

        if (
          objectSelected.group_ids.indexOf(e.exData.id) != -1 &&
          e.exData.type == "Group"
        ) {
          if (
            !objectsMove.some((item) => item.name === e.name) ||
            objectsMove.length === 0
          ) {
            objectsMove.push(e);
          }

          this.setListObjectNeedMove([e.name], children);
        }
      });

    if (objectSelected.group_ids.length === 0) {
      return;
    }
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
    this.groups = [
      {
        name: "DDD",
        x: "0",
        y: "0",
        x_color: 0.0,
        y_color: 0.0,
        color_type: "cct",
        building_id: 65,
        id: 346,
        user_id: 2,
        type: "Group",
        is_active: false,
        project_id: 76,
        scene_status: false,
        scene_id: 2845,
        energy: 0,
        total_amount: 0,
        file_id: 112,
        is_layer: false,
        light: 6000,
        color: "6000",
        intensity: 100,
        device_ids: [],
        group_ids: [],
        positions: [],
        is_featured: false,
        devices_status: [],
      },
      {
        name: "Seizo 95",
        x: "1360.7705710131795",
        y: "3662.178420664635",
        x_color: 0.0,
        y_color: 0.0,
        color_type: "cct",
        building_id: 65,
        id: 344,
        user_id: 14,
        type: "Group",
        is_active: false,
        project_id: 76,
        scene_status: false,
        scene_id: 2829,
        energy: 0,
        total_amount: 0,
        file_id: 112,
        is_layer: false,
        light: 6000,
        color: "6000",
        intensity: 100,
        device_ids: [5542, 5615],
        group_ids: [],
        positions: [
          {
            x: "1360.7705710131795",
            y: "3662.178420664635",
            file_id: 112,
            f_x: "1072.0911047311922",
            f_y: "3646.6597590586193",
            f_width: "605.5806919986992",
            f_height: "16.371146746438626",
          },
        ],
        is_featured: false,
        devices_status: [
          { id: 5542, status: false },
          { id: 5615, status: false },
        ],
      },
      {
        name: "Track Linear",
        x: "1360.7705710131795",
        y: "3050.5938667795044",
        x_color: 0.0,
        y_color: 0.0,
        color_type: "cct",
        building_id: 65,
        id: 345,
        user_id: 14,
        type: "Group",
        is_active: false,
        project_id: 76,
        scene_status: false,
        scene_id: 2837,
        energy: 0,
        total_amount: 0,
        file_id: 112,
        is_layer: false,
        light: 6000,
        color: "6000",
        intensity: 100,
        device_ids: [5618, 5619, 5620],
        group_ids: [],
        positions: [
          {
            x: "1360.7705710131795",
            y: "3050.5938667795044",
            file_id: 112,
            f_x: "947.1299798510556",
            f_y: "3046.1615452291426",
            f_width: "763.662295669126",
            f_height: "8.12403433590407",
          },
        ],
        is_featured: false,
        devices_status: [
          { id: 5618, status: false },
          { id: 5619, status: false },
          { id: 5620, status: false },
        ],
      },
    ];
    if (needRefresh) {
      this.drawFromArray(this.dxfViewer.origin, this.groups, "group");
      this.updateObjectsScale(true);
      this.refreshData();
      this.refresh();
    }
  }

  updateDevicesData(devicesData, needRefresh) {
    this.devices = [
      {
        x: "2861",
        y: "3663",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5540,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "2791.293304877813",
        y: "3062.4093349833024",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 6",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5538,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3140.6280364511113",
        y: "3062.4093349833024",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 7",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "SENSORS",
        id: 5546,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "1072.0911047311922",
        y: "3646.6597590586193",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: "T0301S00067Q",
        channels: ["fusion"],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5542,
        file_id: 112,
        rotation: 0,
        groups: [
          {
            id: 344,
            name: "Seizo 95",
            type: "Group",
            project_id: 76,
            building_id: null,
          },
        ],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "2861",
        y: "3663",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Magnum 200",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5548,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-6832",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5556,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-6232",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5557,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-5633",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5558,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-5033",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5559,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-4426",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5560,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "-2388",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5572,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "-1488",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5573,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "-588",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5574,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "311",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5575,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "1211",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5576,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "2111",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5577,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3011",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5578,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3911",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5579,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "4811",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5580,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "5711",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5581,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6611",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "FIXTURES",
        id: 5582,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-6832",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5588,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-6232",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5589,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-5633",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5590,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-5033",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5591,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6161",
        y: "-4426",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5592,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "-2388",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5604,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "-1488",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5605,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "-588",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5606,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "311",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5607,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "1211",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5608,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "2111",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5609,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3011",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5610,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3911",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5611,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "4811",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5612,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "5711",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5613,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "6611",
        y: "-2036",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: null,
        mA: null,
        ceil_height: 0,
        selected_cells: null,
        angle: 0,
        layer: "SENSORS",
        id: 5614,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "1677.6717967298914",
        y: "3663.030905805058",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: "T0301S00069E",
        channels: ["fusion"],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "SENSORS",
        id: 5615,
        file_id: 112,
        rotation: 0,
        groups: [
          {
            id: 344,
            name: "Seizo 95",
            type: "Group",
            project_id: 76,
            building_id: null,
          },
        ],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "2303.2238351827577",
        y: "3671.1545217644903",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5616,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3457.466072845496",
        y: "3655.4663517631443",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Seizo 95",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "SENSORS",
        id: 5617,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "947.1299798510556",
        y: "3046.1615452291426",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 1",
        mac_address: null,
        status: false,
        serial_number: "T0301S0006HI",
        channels: ["fusion"],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5618,
        file_id: 112,
        rotation: 0,
        groups: [
          {
            id: 345,
            name: "Track Linear",
            type: "Group",
            project_id: 76,
            building_id: null,
          },
        ],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "1328.9609882267946",
        y: "3054.2855795650466",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 2",
        mac_address: null,
        status: false,
        serial_number: "T0301S0006H9",
        channels: ["fusion"],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "SENSORS",
        id: 5619,
        file_id: 112,
        rotation: 0,
        groups: [
          {
            id: 345,
            name: "Track Linear",
            type: "Group",
            project_id: 76,
            building_id: null,
          },
        ],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "1710.7922755201816",
        y: "3046.1615452291426",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 3",
        mac_address: null,
        status: false,
        serial_number: "T0301S0006DZ",
        channels: ["fusion"],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5620,
        file_id: 112,
        rotation: 0,
        groups: [
          {
            id: 345,
            name: "Track Linear",
            type: "Group",
            project_id: 76,
            building_id: null,
          },
        ],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "2084.5002257717847",
        y: "3054.2855795650466",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 4",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "SENSORS",
        id: 5621,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "2441.9585733045146",
        y: "3054.2850217297505",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 5",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5622,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3489.9629074832333",
        y: "3070.533648236855",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 8",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "SENSORS",
        id: 5623,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
      {
        x: "3847.42181285126",
        y: "3070.533648236855",
        width: "0",
        height: "0",
        type: "fixture",
        block_name: "Linear 9",
        mac_address: null,
        status: false,
        serial_number: null,
        channels: [],
        mA: "0.0",
        ceil_height: 0,
        selected_cells: [],
        angle: 0,
        layer: "FIXTURES",
        id: 5624,
        file_id: 112,
        rotation: 0,
        groups: [],
        amount_people: 0,
        array_heat: {},
      },
    ];
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
    this.polygonPoints = [];
    if (needRefresh) {
      this.drawFromArray(this.dxfViewer.origin, this.areas, "area");
      this.refreshData();
      this.refresh();
    }
  }

  setDeletedDeviceId(id) {
    this.deletedDeviceId = id;
    this.removeDeviceOfScene(
      id,
      this.dxfViewer ? this.dxfViewer.GetScene() : null
    );
    this.refresh();
  }

  setDeletedAreaId(id) {
    this.deletedAreaId = id;
    this.removeAreaOfScene(
      id,
      this.dxfViewer ? this.dxfViewer.GetScene() : null
    );
    this.refresh();
  }

  setDeletedGroupId(id) {
    this.deletedGroupId = id;
    this.removeGroupOfScene(
      id,
      this.dxfViewer ? this.dxfViewer.GetScene() : null
    );
    this.refresh();
  }

  setSelectedGroup(group) {
    const canvas = this.dxfViewer;
    if (!canvas) {
      return;
    }
    const scene = canvas.GetScene();
    const { children } = scene;
    const api = canvasObjects;

    api.selectedObjects = [];
    api.selectedObjects.push(`box-Group-${group.id}`);

    if (group !== null && group.positions.length > 0) {
      this.zoomToGroup(group.positions[0]);
      this.activeGroup = group;
    }

    children
      .filter(
        (e) => e.name.includes("box-Group") || e.name.includes("box-devices")
      )
      .forEach((e) => {
        e.material.map = this.getIcon(e.exData);
      });
    canvas.Render();
  }

  setHistory(history) {
    this.history = history;

    let visibleGroups = [];

    for (let i = 0; i < this.activeGroup.group_ids.length; i++) {
      let childGroup = this.groups.find(
        (g) => g.id === this.activeGroup.group_ids[i]
      );
      if (
        childGroup &&
        (childGroup.device_ids.length > 0 || childGroup.group_ids.length > 0)
      ) {
        visibleGroups.push(childGroup.id);
      }
    }
    this.groupedDevices = [];
    this.visibleGroups = visibleGroups;
    this.visibleDevices = this.activeGroup.device_ids;

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
        if (this.activeGroup && this.activeGroup.scene_status) {
          e.material.map = icoGroupActive;
        } else {
          e.material.map = icoGroup;
        }
      });
    api.selectedObjects = [];
    this.refresh();
  }

  reloadViewer() {
    const api = canvasObjects;
    if (api != null) {
      api.selectedObjects = [];
    }
    this.refresh();
  }

  setFetchingSize(val) {
    let progress = document.getElementById("progress-viewer");
    if (progress) {
      progress.innerHTML = "Loading... ";
    }
  }

  setProgress(val) {
    let progress = document.getElementById("progress-bar");
    if (progress) {
      progress.style.width = val + "%";
      if (val == 1) {
        document.getElementById("contain-progress").style.display = "none";
      } else {
        document.getElementById("contain-progress").style.display = "block";
      }
    }
  }

  clearViewer() {
    this.dxfViewer.Clear();
  }

  destroyViewer() {
    this.dxfViewer.Destroy();
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
    console.log("viewer,", url);
    try {
      await this.dxfViewer.Load({
        url,
        fonts: [],
        progressCbk: (phase, size, totalSize) => {
          this.onProgress(phase, size, totalSize);
        },
        // workerFactory: DxfViewerWorker,
      });
    } catch (error) {
      console.warn(error);
    } finally {
      cameraDistance = this.dxfViewer.GetCamera().top;

      // this.dxfViewer.GetLayers().forEach((layer) => {
      //   this.dxfViewer.ShowLayer(
      //     layer.name,
      //     [this.file.floor_layer_name].includes(layer.name)
      //   );
      // });
      this.dxfViewer.GetScene().add(canvasObjects.grid);
      this.dxfViewer.GetScene().add(canvasObjects.plane);

      this.dxfViewer.GetCanvas().addEventListener("pointerdown", (e) => {
        this.pointerDown(e);
      });

      this.dxfViewer.GetCanvas().addEventListener("pointermove", (e) => {
        this.pointerMove(e);
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
      this.drawTrackingPaths(this.dxfViewer.origin, this.peoples);
      this.drawPeoplePositions(this.dxfViewer.origin, this.peoplePositions);
      this.drawHeatMapPositions(this.dxfViewer.origin, this.heatMapPositions);
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
      // Scale groups, devices
      const aa = (cameraDistance * 4) / 15000;
      const newScale = aa / camera.zoom;
      let groupsMesh = {};
      if (newScale != currentScale || force) {
        currentScale = newScale;
        api.objects.forEach((o) => {
          if (o.name.includes("box-Group")) {
            groupsMesh[o.exData.id] = o;
          }
          if (
            !o.name.includes("Rect-area") &&
            !o.name.includes("Polygon-area")
          ) {
            o.scale.set(newScale, newScale, 1);
          }
        });

        // update text name positions
        api.objects.forEach((o) => {
          if (o.name.includes("group-text")) {
            const groupId = parseInt(o.name.split("group-text-")[1]);
            o.position.y =
              groupsMesh[groupId].position.y -
              cameraDistance / 10 / camera.zoom;
            o.position.x = groupsMesh[groupId].position.x;
          }
        });
      }

      // Scale resize boxes
      const bb = (cameraDistance * 4) / 20000;
      const newScale2 = bb / camera.zoom;
      if (newScale2 != scaleResizeBox || force) {
        scaleResizeBox = newScale2;
        api.resizeBoxes.forEach((r) => {
          r.scale.set(newScale2, newScale2, 1);
        });
        api.polygonResizeBoxes.forEach((r) => {
          r.scale.set(newScale2, newScale2, 1);
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

    const shapes = fontInter.generateShapes(text, height);
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

  handleClickAtArea(mesh) {
    const canvas = this.dxfViewer;
    const api = canvasObjects;

    if (!canvas) {
      return;
    }
    const scene = canvas.GetScene();
    const { children } = scene;
    const areaTextNames = children.filter(
      (e) => e.name.indexOf("area-text") !== -1
    );
    if (this.onClick) {
      let data = null;
      if (mesh) {
        data = mesh.exData || { type: "area" };
        const { position, geometry } = mesh;
        const { width, height } = geometry.parameters;
        const dxfPos = this.convertScenePositionToDxf(
          position,
          this.dxfViewer.origin
        );
        const exData = {
          x: dxfPos.x - width / 2,
          y: dxfPos.y - height / 2,
          width,
          height,
          positions: [],
        };

        // if change area, update it text name positions
        canvasObjects.objects.forEach((o) => {
          if (o.name.endsWith(`area-text-${data.id}`)) {
            o.position.y = dxfPos.y;
            o.position.x = dxfPos.x;
          }
        });
        data = { ...data, ...exData };
        const areaId = parseInt(mesh.name.split("Rect-area-")[1]);
        areaTextNames.forEach((e) => {
          const areaNameId = parseInt(e.name.split("area-text-")[1]);
          if (areaId === areaNameId) {
            e.material.visible = false;
          } else {
            e.material.visible = true;
          }
        });
      }
      this.onClick("single", data);
    }
  }

  handleClickAtPolygonArea(mesh) {
    const canvas = this.dxfViewer;
    const api = canvasObjects;

    if (!canvas) {
      return;
    }
    const scene = canvas.GetScene();
    const { children } = scene;
    const areaTextNames = children.filter(
      (e) => e.name.indexOf("area-text") !== -1
    );

    if (this.onClick) {
      let data = null;
      if (mesh) {
        data = mesh.exData || { type: "area" };
        const { position, geometry } = mesh;
        // const dxfPos = this.convertScenePositionToDxf(position, this.dxfViewer.origin);

        let newPoints = [];
        geometry.parameters.shapes.curves.forEach((p, index) => {
          if (index == 0) {
            newPoints.push({ x: p.v1.x + position.x, y: p.v1.y + position.y });
            newPoints.push({ x: p.v2.x + position.x, y: p.v2.y + position.y });
          } else {
            newPoints.push({ x: p.v2.x + position.x, y: p.v2.y + position.y });
          }
        });
        newPoints = this.sortShapePointPolygon(newPoints);

        const exData = {
          positions: newPoints,
        };

        let total_x = 0;
        let total_y = 0;
        for (let i = 0; i < newPoints.length; i++) {
          total_x += newPoints[i].x;
          total_y += newPoints[i].y;
        }

        canvasObjects.objects.forEach((o) => {
          if (o.name.endsWith(`area-text-${data.id}`)) {
            o.position.y = total_y / newPoints.length;
            o.position.x = total_x / newPoints.length;
          }
        });

        data = { ...data, ...exData };
        const areaId = parseInt(mesh.name.split("Polygon-area-")[1]);
        areaTextNames.forEach((e) => {
          const areaNameId = parseInt(e.name.split("area-text-")[1]);
          if (areaId === areaNameId) {
            e.material.visible = false;
          } else {
            e.material.visible = true;
          }
        });
      }
      this.onClick("single", data);
    }
  }

  handleCreateAndMoveAllObject(meshes) {
    if (this.onClick) {
      let data = null;
      let listData = [];
      if (meshes.length > 0) {
        meshes.map((mesh) => {
          data = mesh.exData || { type: "fixture" };
          const { position } = mesh;
          const dxfPos = this.convertScenePositionToDxf(
            position,
            this.dxfViewer.origin
          );
          const exData = {
            x: dxfPos.x,
            y: dxfPos.y,
          };

          // if moving group, update it text name positions
          if (data.type === "Group") {
            const camera = this.dxfViewer?.GetCamera();
            canvasObjects.objects.forEach((o) => {
              if (o.name.endsWith(`group-text-${data.id}`)) {
                o.position.y =
                  dxfPos.y - cameraDistance / 10 / (camera?.zoom || 1);
                o.position.x = dxfPos.x;
              }
            });
          }
          listData.push({ ...data, ...exData });
          data = { ...data, ...exData };
          mesh.exData = data;
        });
      }

      this.onClick("single", listData);
    }
  }

  handleCreateAndMoveObject(mesh) {
    if (this.onClick) {
      let data = null;
      if (mesh) {
        data = mesh.exData || { type: "fixture" };
        const { position } = mesh;
        const dxfPos = this.convertScenePositionToDxf(
          position,
          this.dxfViewer.origin
        );
        const exData = {
          x: dxfPos.x,
          y: dxfPos.y,
        };

        // if moving group, update it text name positions
        if (data.type === "Group") {
          const camera = this.dxfViewer?.GetCamera();
          canvasObjects.objects.forEach((o) => {
            if (o.name.endsWith(`group-text-${data.id}`)) {
              o.position.y =
                dxfPos.y - cameraDistance / 10 / (camera?.zoom || 1);
              o.position.x = dxfPos.x;
            }
          });
        }
        data = { ...data, ...exData };
      }
      mesh.exData = data;
      this.onClick("single", data);
    }
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

  findObjectByName(name) {
    const canvas = this.dxfViewer;
    const scene = canvas.GetScene();
    const { children } = scene;
    const findData = children.filter((e) => e.name == name);
    return findData;
  }

  drawPolygonResizeBox(vector, r, s) {
    const canvas = this.dxfViewer;
    const scene = canvas.GetScene();
    const CircleGeo = new THREE.CircleGeometry(r, s);
    const RingMaterial = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      color: 0xf97316,
      opacity: 0.9,
      visible: true,
      transparent: true,
    });

    const voxel = new THREE.Mesh(CircleGeo, RingMaterial);
    voxel.position.copy(vector);
    voxel.name = `polygon-resize-box`;
    voxel.renderOrder = 10000;
    voxel.scale.set(scaleResizeBox, scaleResizeBox, 1);
    canvasObjects.polygonResizeBoxes.push(voxel);
    scene.add(voxel);
  }

  updatePolygonResizeBoxes(shown, polygon_mesh) {
    const api = canvasObjects;
    const resizeBoxes = this.findObjectByName("polygon-resize-box");
    const CircleGeo = new THREE.CircleGeometry(60, 32);

    api.polygonResizeBoxes.forEach((mess) => {
      mess.material.visible = shown;
    });

    if (polygon_mesh) {
      const points = polygon_mesh.exData.positions;
      this.polygonPoints = [];
      // draw more polygon resize box if it not enough
      if (resizeBoxes.length < points.length) {
        const temp = points.length - resizeBoxes.length;
        const pos = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < temp; i++) {
          this.drawPolygonResizeBox(pos, 60, 32);
        }
      }
      // Update position and visible of polygon resize box
      api.polygonResizeBoxes.forEach((mess, index) => {
        if (index < points.length) {
          let x = points[index].x + polygon_mesh.position.x;
          let y = points[index].y + polygon_mesh.position.y;
          this.polygonPoints.push({ x: x, y: y });
          let nPos = new THREE.Vector3(x, y, 0);
          mess.position.copy(nPos);
          mess.geometry = CircleGeo;
          mess.material.visible = true;
        } else {
          mess.material.visible = false;
        }
      });
    }
  }

  drawResizeBox(vector, w, h) {
    const canvas = this.dxfViewer;
    const scene = canvas.GetScene();

    const CircleGeo = new THREE.BoxBufferGeometry(w, h, 1);
    const RingMaterial = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      color: 0xf97316,
      opacity: 0.9,
      visible: false,
      transparent: true,
    });
    [1, 2, 3, 4].forEach(() => {
      const voxel = new THREE.Mesh(CircleGeo, RingMaterial);
      voxel.position.copy(vector);
      voxel.name = `resize-box`;
      voxel.renderOrder = 10000;
      voxel.scale.set(scaleResizeBox, scaleResizeBox, 1);
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
    const CircleGeo = new THREE.BoxBufferGeometry(200, 200, 1);

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

  removeDeviceOfScene(id, scene) {
    const api = canvasObjects;
    const { children } = scene;
    const meshName = `box-devices-${id}`;
    const devices = children.filter((e) => e.name.includes(meshName));
    devices.forEach((device) => {
      scene.remove(device);
    });

    const tempObjects = api.objects.filter((o) => !o.name.endsWith(meshName));
    api.objects = tempObjects;
  }

  removeAreaOfScene(id, scene) {
    const api = canvasObjects;
    const { children } = scene;

    const meshName = `Rect-area-${id}`;
    const polygonMeshName = `Polygon-area-${id}`;
    const areas = children.filter(
      (area) =>
        area.name.endsWith(meshName) || area.name.endsWith(polygonMeshName)
    );
    areas.forEach((area) => {
      scene.remove(area);
    });

    api.selectedArea = null;
    api.preSelectedArea = null;
    api.selectedPolygonArea = null;
    api.preSelectedPolygonArea = null;

    // Filter to remove area from objects
    const tempObjects = api.objects.filter(
      (o) => !o.name.endsWith(meshName) && !o.name.endsWith(polygonMeshName)
    );
    api.objects = tempObjects;

    // Hide the grab-edges after remove area
    api.resizeBoxes.forEach((mess) => {
      mess.material.visible = false;
    });

    api.polygonResizeBoxes.forEach((mess) => {
      mess.material.visible = false;
    });
  }

  removeGroupOfScene(id, scene) {
    const api = canvasObjects;
    const { children } = scene;
    const meshName = `box-Group-${id}`;
    const groups = children.filter((e) => e.name.includes(meshName));
    groups.forEach((group) => {
      scene.remove(group);
    });

    const tempObjects = api.objects.filter((o) => !o.name.endsWith(meshName));
    api.objects = tempObjects;
  }

  refresh() {
    const canvas = this.dxfViewer;
    const api = canvasObjects;

    if (!canvas) {
      return;
    }

    const scene = canvas.GetScene();
    const { children } = scene;
    // this.viewerObjects(children);
    const heatCells = children.filter(
      (e) =>
        e.name.indexOf("heat-cell-group") != -1 ||
        e.name.indexOf("heat-text") !== -1
    );

    const otherObjects = children.filter(
      (e) =>
        e.name.indexOf("box-") !== -1 ||
        e.name.indexOf("Rect-area") !== -1 ||
        e.name.indexOf("group-text") !== -1 ||
        e.name.indexOf("area-text") !== -1 ||
        e.name.indexOf("Polygon-area") !== -1
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
            e.material.visible = true;
          } else {
            e.material.visible = false;
          }
        }

        if (e.name.indexOf("Polygon-area") !== -1) {
          if (this.areaMode) {
            e.material.visible = true;
          } else {
            e.material.visible = false;
          }
        }

        if (e.name.indexOf("area-text") !== -1) {
          e.material.visible = false;
          const areaId = parseInt(e.name.split("area-text-")[1]);
          if (this.areaMode && this.areas.find((a) => a.id === areaId)) {
            e.material.visible = true;
          }
        }

        if (e.name.indexOf("group-text") !== -1) {
          e.material.visible = false;
          const groupId = parseInt(e.name.split("group-text-")[1]);
          if (
            groupId &&
            this.visibleGroups.includes(groupId) &&
            !this.enableMovingGroup &&
            !this.enableMovingAllInGroup &&
            !this.areaMode
          ) {
            e.material.visible = true;
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
            if (this.structureMode) {
              if (this.areaMode) {
                e.material.visible = false;
              } else {
                e.material.visible = true;
              }
            } else {
              if (deviceTypes.includes(exData.type)) {
                if (exData.serial_number) {
                  e.material.visible = true;
                }

                if (exData.groups.length === 0) {
                  e.material.visible = false;
                }
              } else {
                e.material.visible = true;
              }
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
            e.material.opacity = 1;
          }
        }
      });
      console.log(api.objects);
    }

    api.selectedObjects = [];
    this.updateResizeBoxes(false, null, 0, 0);
    this.updatePolygonResizeBoxes(false, null);
    // if (this.onClick) {
    //   this.onClick("single", null);
    // }
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
        let childGroup = this.groups.find(
          (g) => g.id === this.activeGroup.group_ids[i]
        );
        if (
          childGroup &&
          (childGroup.device_ids.length > 0 || childGroup.group_ids.length > 0)
        ) {
          visibleGroups.push(childGroup.id);
        }
      }
      this.visibleGroups = visibleGroups;
    } else {
      this.groups.forEach((group) => {
        childGroups.push(...group.group_ids);
        childDevices.push(...group.device_ids);
      });

      this.groups.forEach((group) => {
        if (
          !childGroups.includes(group.id) &&
          (group.device_ids.length > 0 || group.group_ids.length > 0)
        ) {
          if (group.group_ids.length > 0 && group.device_ids.length == 0) {
            for (let i = 0; i < group.group_ids.length; i++) {
              let childGroup = this.groups.find(
                (g) => g.id === group.group_ids[i]
              );
              if (
                childGroup &&
                (childGroup.device_ids.length > 0 ||
                  childGroup.group_ids.length > 0)
              ) {
                visibleGroups.push(group.id);
              }
            }
          } else {
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
            e.object?.name.includes("Polygon-area") ||
            false
          );
        } else {
          return (
            e.object?.material?.visible &&
            !e.object?.name.includes("Rect-area") &&
            !e.object?.name.includes("Polygon-area") &&
            !e.object?.name.includes("group-text")
          );
        }
      });

    return intersects;
  }

  // return position of polygon resize box when click it
  findPolygonResizeBoxClicked() {
    const canvas = this.dxfViewer;
    const cam = canvas.GetCamera();
    const api = canvasObjects;
    // let update = false;
    api.raycaster.setFromCamera(api.v2, cam);

    const intersects = api.raycaster.intersectObjects(api.polygonResizeBoxes);

    if (intersects.length > 0) {
      return {
        x: intersects[0].object.position.x,
        y: intersects[0].object.position.y,
      };
    }
    return;
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
      this.drawTextGroup(data, v1, true);
    } else if (type === "area") {
      // update data and position of area when have change
      if (data.positions.length > 2) {
        const name = this.getMeshName(data);
        const points = data.positions;
        let total_x = 0;
        let total_y = 0;
        for (let i = 0; i < points.length; i++) {
          total_x += points[i].x;
          total_y += points[i].y;
        }
        const vector = new THREE.Vector3(
          total_x / points.length,
          total_y / points.length,
          0
        );

        if (meshes[name]) {
          for (let i = 0; i < points.length; i++) {
            points[i] = {
              x: points[i].x - meshes[name].position.x,
              y: points[i].y - meshes[name].position.y,
            };
          }
          let polygonShape = new THREE.Shape().moveTo(points[0].x, points[0].y);

          for (let i = 1; i < points.length; i++) {
            polygonShape = polygonShape.lineTo(points[i].x, points[i].y);
          }
          meshes[name].geometry = new THREE.ShapeGeometry(polygonShape);
        }
        this.drawTextArea(data, vector, true);
      } else {
        const v1 = this.convertPositionInScene(
          { x: data.x, y: data.y, z: 0 },
          origin
        );
        v1.x = v1.x + data.width / 2;
        v1.y = v1.y + data.height / 2;

        const name = this.getMeshName(data);
        if (meshes[name]) {
          meshes[name].geometry = new THREE.BoxBufferGeometry(
            data.width,
            data.height,
            1
          );
          meshes[name].position.copy(v1);
        }
        this.drawTextArea(data, v1, true);
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

  getIcon(data, iname = null) {
    const api = canvasObjects;
    const name = iname || this.getMeshName(data);
    const index = api.selectedObjects.indexOf(name);
    if (index < 0) {
      if (data.type === "fixture") {
        if (
          data.serial_number == null ||
          data.serial_number.length < 3 ||
          data.serial_number == ""
        ) {
          return icoUnscanLight;
        } else {
          if (data.status) {
            return icoScanLightOn;
          } else {
            return icoScanLight;
          }
        }
      } else if (data.type == "sensor") {
        if (
          data.serial_number == null ||
          data.serial_number.length < 3 ||
          data.serial_number == ""
        ) {
          // Thieu hinh sensor chua scan
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
      if (data.type === "fixture") {
        if (
          data.serial_number == null ||
          data.serial_number.length < 3 ||
          data.serial_number == ""
        ) {
          // move icon - unscan - light off
          if (this.enableMovingDevice) {
            return icoMoveLightUnscan;
          }
          return icoUnscanSelectedLight;
        } else {
          if (data.status) {
            // move icon - scanned - light on
            if (this.enableMovingDevice) {
              return icoMoveLightScanOn;
            }
            return icoSelectScanLightOn;
          } else {
            // move icon - scanned - light off
            if (this.enableMovingDevice) {
              return icoMoveLightScan;
            }
            return icoSelectLight;
          }
        }
      } else if (data.type == "sensor") {
        if (
          data.serial_number == null ||
          data.serial_number.length < 3 ||
          data.serial_number == ""
        ) {
          // move icon - unscan - sensor
          if (this.enableMovingDevice) {
            return icoMoveSensorUnscan;
          }
          return iconSelectUnscanSensor;
        } else {
          // move icon - scanned - sensor
          if (this.enableMovingDevice) {
            return icoMoveSensor;
          }
          return iconSelectSensor;
        }
      } else {
        if (data.scene_status) {
          // move icon - group active
          if (this.enableMovingGroup || this.enableMovingAllInGroup) {
            return icoMoveGroupOn;
          }
          return iconSelectGroupActive;
        } else {
          // move icon - group inactive
          if (this.enableMovingGroup || this.enableMovingAllInGroup) {
            return icoMoveGroup;
          }
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
        // save drawing area
        if (this.creatingArea) {
          const sortPoints = this.sortShapePointPolygon(d.positions);
          let polygonShape = new THREE.Shape().moveTo(
            sortPoints[0].x,
            sortPoints[0].y
          );

          for (let i = 1; i < sortPoints.length; i++) {
            polygonShape = polygonShape.lineTo(
              sortPoints[i].x,
              sortPoints[i].y
            );
          }
          const geometry = new THREE.ShapeGeometry(polygonShape);
          this.creatingArea.geometry = geometry;
          this.creatingArea.position.copy(new THREE.Vector3(0, 0, 0));
          this.creatingArea.name = this.getMeshName(d);
          this.creatingArea.exData = d;
          const v1 = this.convertPositionInScene(
            { x: d.x, y: d.y, z: 0 },
            origin
          );
          v1.x = v1.x + d.width / 2;
          v1.y = v1.y + d.height / 2;
          this.drawTextArea(d, v1);
          this.creatingArea = null;
        } else if (this.creatingPolygonArea) {
          this.creatingPolygonArea.name = this.getMeshName(d);
          this.creatingPolygonArea.exData = d;
          let total_x = 0;
          let total_y = 0;
          for (let i = 0; i < d.positions.length; i++) {
            total_x += d.positions[i].x;
            total_y += d.positions[i].y;
          }
          const vector = new THREE.Vector3(
            total_x / d.positions.length,
            total_y / d.positions.length,
            0
          );
          this.drawTextArea(d, vector);
        } else {
          // draw area from DB
          if (d.positions.length > 2) {
            const mesh = this.createPolygonShape(
              d.positions,
              this.getMeshName(d)
            );
            mesh.exData = d;
            api.objects.push(mesh);
            let total_x = 0;
            let total_y = 0;
            for (let i = 0; i < d.positions.length; i++) {
              total_x += d.positions[i].x;
              total_y += d.positions[i].y;
            }
            const vector = new THREE.Vector3(
              total_x / d.positions.length,
              total_y / d.positions.length,
              0
            );
            this.drawTextArea(d, vector);
          } else {
            const v1 = this.convertPositionInScene(
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
            this.drawTextArea(d, v1);
          }
        }
      } else {
        if (this.creatingDevice) {
          this.creatingDevice.name = this.getMeshName(d);
          this.creatingDevice.exData = d;
          this.creatingDevice = null;
        } else {
          const v1 = this.convertPositionInScene(
            { x: d.x, y: d.y, z: 0 },
            origin
          );
          this.drawAt(v1, lightSize, d);

          // We need to init the heat cell for all sensors so we do not care about them later
          if (d.type == "sensor") {
            // this.prepareHeatMapCells(v1, d);
          }
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

  drawTextGroup(data, vector, redraw = false) {
    const api = canvasObjects;
    const canvas = this.dxfViewer;
    const scene = canvas.GetScene();
    if (redraw) {
      const groupTexts = api.objects.filter((e) =>
        e.name.endsWith(`group-text-${data.id}`)
      );
      groupTexts.forEach((e) => {
        scene.remove(e);
      });
      api.objects = api.objects.filter(
        (e) => !e.name.endsWith(`group-text-${data.id}`)
      );
    }

    const namePos = new THREE.Vector3(
      vector.x,
      vector.y - cameraDistance / 10,
      vector.z
    );
    const text2 = this.createTextAt(
      data.name || "",
      namePos,
      `group-text-${data.id}`,
      100,
      0xffffff
    );

    text2.renderOrder = 10000;
    // text2.exData = data;

    api.objects.push(text2);

    const textWidth = text2.geometry?.boundingBox?.max?.x * 2 || 0;
    const textHeight = text2.geometry?.boundingBox?.max?.y * 2 || 0;

    const BoxGeo = new THREE.BoxBufferGeometry(
      textWidth + 100,
      textHeight + 100,
      0
    );
    const BasicMat = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      visible: true,
      color: 0xffffff,
      opacity: 0.2,
      transparent: true,
    });

    const mesh = new THREE.Mesh(BoxGeo, BasicMat);
    mesh.position.copy(namePos);
    mesh.name = `group-text-${data.id}`;
    // mesh.exData = data;
    mesh.renderOrder = 10000;

    mesh.onBeforeRender = (renderer) => {
      renderer.clearDepth();
    };
    scene.add(mesh);

    var geo = new THREE.EdgesGeometry(BoxGeo);
    var mat = new THREE.LineBasicMaterial({ color: 0xc7c7c7, linewidth: 1 });
    const wireframe = new THREE.LineSegments(geo, mat);
    // wireframe.name = `group-text-${data.id}`;
    wireframe.position.copy(namePos);
    wireframe.name = `group-text-${data.id}`;
    wireframe.renderOrder = 10000;
    // wireframe.exData = data;
    scene.add(wireframe);

    api.objects.push(wireframe);
    api.objects.push(mesh);
  }

  drawTextArea(data, vector, redraw = false) {
    const api = canvasObjects;
    const canvas = this.dxfViewer;
    const scene = canvas.GetScene();
    if (redraw) {
      const areaTexts = api.objects.filter((e) =>
        e.name.endsWith(`area-text-${data.id}`)
      );
      areaTexts.forEach((e) => {
        scene.remove(e);
      });
      api.objects = api.objects.filter(
        (e) => !e.name.endsWith(`area-text-${data.id}`)
      );
    }

    const namePos = new THREE.Vector3(vector.x, vector.y, vector.z);
    const text2 = this.createTextAt(
      data.name || "",
      namePos,
      `area-text-${data.id}`,
      100,
      0xffffff
    );

    text2.renderOrder = 10000;
    text2.exData = data;

    api.objects.push(text2);
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

    // if type is group, create its text name
    if (type === "Group") {
      this.drawTextGroup(data, vector);
    }
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
    return voxel;
  }

  handleClickAt() {
    const api = canvasObjects;
    const intersects = this.findObjectClicked();
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const mesh = intersect.object;
      if (intersect.object !== api.plane) {
        if (mesh.name.includes("box") || mesh.name == "new-device") {
          const { exData } = mesh;
          if (this.onClick) {
            if (canvasObjects.selectedObjects.length > 1) {
              const selectedDevices = this.devices.filter((e) =>
                canvasObjects.selectedObjects.includes(this.getMeshName(e))
              );
              const selectedGroups = this.groups.filter((e) =>
                canvasObjects.selectedObjects.includes(this.getMeshName(e))
              );

              if (selectedGroups.length > 0) {
                const idGroupsSelected = [];
                selectedGroups.forEach((group) => {
                  idGroupsSelected.push(group.id);
                });

                api.objects.forEach((o) => {
                  if (o.name.includes(`group-text-`)) {
                    const groupId = parseInt(o.name.split("group-text-")[1]);
                    if (idGroupsSelected.includes(groupId)) {
                      o.material.visible = false;
                    } else {
                      if (this.visibleGroups.includes(groupId)) {
                        o.material.visible = true;
                      }
                    }
                  }
                });
              }

              this.dxfViewer?.Render();
              this.onClick("multi", selectedDevices, selectedGroups);
            } else {
              let result = exData;
              if (deviceTypes.includes(exData.type)) {
                const selectedDevices = this.devices.filter((e) => {
                  return mesh.name.endsWith(`-${e.id}`);
                });

                if (selectedDevices.length) {
                  result = selectedDevices[0];
                } else if (mesh.name == "new-device") {
                  result = exData;
                }
              } else {
                const selectedGroups = this.groups.filter((e) => {
                  return mesh.name.endsWith(`-${e.id}`);
                });

                const selectingGroups = this.groups.filter((e) =>
                  canvasObjects.selectedObjects.includes(this.getMeshName(e))
                );

                if (selectedGroups.length) {
                  result = selectedGroups[0];
                }

                const groupsObj = {};
                selectingGroups.forEach((group) => {
                  groupsObj[group.id] = group;
                });
                api.objects.forEach((o) => {
                  if (o.name.includes(`group-text-`)) {
                    const groupId = parseInt(o.name.split("group-text-")[1]);
                    if (groupId in groupsObj) {
                      o.material.visible = false;
                    } else {
                      if (this.visibleGroups.includes(groupId)) {
                        o.material.visible = true;
                      }
                    }
                  }
                });

                this.dxfViewer?.Render();
              }
              if (api.selectedObjects.length == 0) {
                this.onClick("single", null);
              } else {
                this.onClick("single", result);
              }
            }
          } else {
            // if (this.onShapeClick) {
            //   this.onShapeClick(exData.id, exData);
            // }
          }
        }
      }
    } else {
      api.objects.forEach((o) => {
        if (!this.areaMode) {
          if (o.name.includes(`group-text-`)) {
            const groupId = parseInt(o.name.split("group-text-")[1]);
            o.material.visible = this.visibleGroups.includes(groupId);
          }
        }
      });
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
    this.selectedResizeBox = null;
  }

  getMeshName(object) {
    if (object && object.type == "area") {
      if (object.positions.length > 2) {
        return `Polygon-area-${object.id}`;
      }
      return `Rect-area-${object.id}`;
    }

    if (object && object.hasOwnProperty("is_new")) {
      return "new-device";
    }

    return `box-${deviceTypeName[object.type] || "unknow"}-${object.id}`;
  }

  convertPositionInScene(pos, originScene) {
    const x = parseFloat(pos.x);
    const y = parseFloat(pos.y);
    return new THREE.Vector3(x - originScene.x, y - originScene.y, pos.z);
  }

  convertScenePositionToDxf(pos, originScene) {
    const x = parseFloat(pos.x);
    const y = parseFloat(pos.y);
    return new THREE.Vector3(x + originScene.x, y + originScene.y, pos.z);
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

    if (name === "drawing-select-box") {
      voxel.position.copy(vector);
      voxel.name = name;
      voxel.renderOrder = -9999;
    } else {
      voxel.position.copy(vector);
      voxel.name = name;
      if (exData) {
        voxel.exData = exData;
      }
      voxel.renderOrder = -9999;
    }
    scene.add(voxel);
    canvas.Render();
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
    scene.add(voxel);
    api.objects.push(voxel);
  }
  // sort point in polygon area to avoid weird shape
  sortShapePointPolygon(points) {
    // return points;
    // Calculate average X, Y in point list
    const avgX = _.meanBy(points, (p) => parseInt(p.x, 10));
    const avgY = _.meanBy(points, (p) => parseInt(p.y, 10));
    const result = _.sortBy(points, (a) => {
      return Math.atan2(a.y - avgY, a.x - avgX);
    });
    return result;
  }
  // draw polygon area
  createPolygonShape(points = [], name = "Polygon-area-new") {
    if (points.length < 3) {
      return;
    }

    const sortPoints = this.sortShapePointPolygon(points);
    const canvas = this.dxfViewer;
    const scene = canvas.GetScene();
    let polygonShape = new THREE.Shape().moveTo(
      sortPoints[0].x,
      sortPoints[0].y
    );

    for (let i = 1; i < sortPoints.length; i++) {
      polygonShape = polygonShape.lineTo(sortPoints[i].x, sortPoints[i].y);
    }
    const geometry = new THREE.ShapeGeometry(polygonShape);
    const material = new THREE.MeshBasicMaterial({
      color: 0x2ae5fa,
      opacity: 0.5,
      side: THREE.FrontSide,
      transparent: true,
      visible: true,
    });
    const meshName = name;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = meshName;
    mesh.renderOrder = 9999;

    const { children } = scene;
    const polygonAreas = children.filter((e) => e.name.includes(meshName));
    polygonAreas.forEach((p) => {
      scene.remove(p);
    });
    scene.add(mesh);
    canvas.Render();
    return mesh;
  }

  pointerDown(e) {
    this.movingAction = false;
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
        api.selectedArea = null;
        api.selectedPolygonArea = null;
        this.creatingArea = null;
        this.creatingPolygonArea = null;
        this.creatingDevice = null;
        this.updateResizeBoxes(false, api.startPos, 0, 0);
        this.updatePolygonResizeBoxes(false, null);

        if (this.addDevice) {
          const dxfPos = this.convertScenePositionToDxf(
            api.startPos,
            this.dxfViewer.origin
          );
          const exData = {
            block_name: "New device",
            serial_number: "",
            mac_address: "",
            channels: null,
            file_id: this.file.id,
            x: dxfPos.x,
            y: dxfPos.y,
            type: "fixture",
            ceil_height: 0,
            angle: 0,
            rotation: 0,
            is_new: true,
          };

          const mesh = this.drawAt(api.startPos, lightSize, exData);
          mesh.scale.set(currentScale, currentScale, 1);
          mesh.name = "drawing-device";
          this.creatingDevice = mesh;
        }
      } else if (this.drawPolygonArea) {
        // Draw point to create polygon
        api.startPos = this.getMouseActionPos(e, canvas, api);
        const pos = new THREE.Vector3(api.startPos.x, api.startPos.y, 0);
        this.polygonPoints.push({ x: pos.x, y: pos.y });
        this.drawPolygonResizeBox(pos, 60, 32);
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
          return mesh.name.includes("box-") || mesh.name == "new-device";
        });

        if (objects.length) {
          // Click to select or deselect 1 device
          const mesh = objects[0].object;
          if (mesh != api.selectedDevice || mesh != api.selectedGroup) {
            const data = mesh.exData;
            const index = api.selectedObjects.indexOf(mesh.name);
            let name = mesh.name == "new-device" ? mesh.name : null;
            if (data.type === "Group") {
              name = mesh.name;
            }
            if (
              index >= 0 &&
              !this.enableMovingDevice &&
              !this.enableMovingGroup &&
              !this.enableMovingAllInGroup
            ) {
              api.selectedObjects.splice(index, 1);
              mesh.material.map = this.getIcon(data, name);
            } else {
              const currentSelected = [...api.selectedObjects];
              if (this.structureMode) {
                if (
                  this.enableMovingDevice ||
                  this.deviceMode ||
                  this.enableMovingGroup ||
                  this.groupMode
                ) {
                  api.selectedObjects = [mesh.name];
                  if (data.type === "Group") {
                    api.objects.forEach((o) => {
                      if (o.name.includes(`group-text-`)) {
                        const groupId = parseInt(
                          o.name.split("group-text-")[1]
                        );
                        if (data.id == groupId) {
                          o.material.visible = false;
                        } else {
                          if (this.visibleGroups.includes(groupId)) {
                            o.material.visible = true;
                          }
                        }
                      }
                    });
                  }
                } else {
                  if (e.ctrlKey) {
                    api.selectedObjects.push(mesh.name);
                  } else {
                    api.selectedObjects = [mesh.name];
                  }
                }
              } else {
                api.selectedObjects = [mesh.name];
              }

              if (api.selectedObjects.length) {
                const scene = canvas.GetScene();
                const { children } = scene;
                children
                  .filter((e) => currentSelected.includes(e.name))
                  .forEach((e) => {
                    e.material.map = this.getIcon(e.exData);
                  });
              }
              mesh.material.map = this.getIcon(data, name);
            }
          }
        } else {
          // Click none to deselect all objects
          if (!this.areaMode) {
            api.startPos = this.getMouseActionPos(e, canvas, api);
          }

          const currentSelected = [...api.selectedObjects];
          api.selectedObjects = [];
          const scene = canvas.GetScene();
          const { children } = scene;

          children
            .filter((e) => currentSelected.includes(e.name))
            .forEach((e) => {
              e.material.map = this.getIcon(e.exData);
            });
        }
        const intersects = baseIntersects.filter((e) => {
          const mesh = e.object;
          const data =
            deviceByKeys[this.getMeshName(mesh.exData)] || mesh.exData;

          if (this.sensorMode) {
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
              // this.prepareSensorGridCells(api.selectedSensor);
            }
            if (
              this.enableMovingDevice ||
              this.enableMovingGroup ||
              this.enableMovingAllInGroup
            ) {
              api.movingMess = intersects[0];
              const { point, object } = intersects[0];
              api.movingOffset = {
                x: point.x - object.position.x,
                y: point.y - object.position.y,
              };
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
              if (index >= 0) {
                api.sensorSelectedCells.splice(index, 1);
              } else {
                api.sensorSelectedCells.push(cell_number);
              }
              // if (this.onUpdateHeatGrid) {
              //   this.onUpdateHeatGrid([...api.sensorSelectedCells]);
              // }
            }
          }
        }

        const resizeAndMovingObjects = baseIntersects.filter((e) => {
          const mesh = e.object;

          if (this.sensorMode) {
            if (this.groupMode) {
              if (!this.enableMovingGroup && !this.enableMovingAllInGroup) {
                return false;
              }
              const data =
                groupByKeys[this.getMeshName(mesh.exData)] || mesh.exData;
              return mesh.name.endsWith(`Group-${data.id}`);
            } else {
              if (!this.enableMovingDevice && !this.enableMovingAllInGroup) {
                return false;
              }
              const data =
                deviceByKeys[this.getMeshName(mesh.exData)] || mesh.exData;
              return (
                mesh.name.endsWith(`devices-${data.id}`) ||
                mesh.name == "new-device"
              );
            }
          } else {
            return (
              mesh.name.includes("Rect-area") ||
              mesh.name.includes("Polygon-area")
            );
          }
        });

        if (resizeAndMovingObjects.length) {
          if (this.sensorMode) {
            api.movingMess = resizeAndMovingObjects[0];
            // point is position mouse click.
            const { point, object } = resizeAndMovingObjects[0];

            if (this.groupMode) {
              if (api.selectedGroup != object) {
                api.selectedGroup = object;
                return;
              }
            } else {
              if (api.selectedDevice != object) {
                api.preSelectedDevice = object;
                api.selectedDevice = object;
                // api.selectedDevice = null;
                this.creatingDevice = null;
                return;
              }
            }

            api.movingOffset = {
              x: point.x - object.position.x,
              y: point.y - object.position.y,
            };
          } else {
            api.movingMess = resizeAndMovingObjects[0];
            const { point, object } = resizeAndMovingObjects[0];

            if (object.exData.type === "area") {
              if (object.exData.positions.length > 2) {
                // prepare to move polygon area
                if (api.selectedPolygonArea != object) {
                  api.preSelectedPolygonArea = object;
                  api.selectedPolygonArea = null;
                  this.creatingPolygonArea = null;
                  this.polygonPoints = object.exData.positions;
                  return;
                }
                api.movingOffset = {
                  x: point.x - object.position.x,
                  y: point.y - object.position.y,
                };
                this.selectedResizeBox = this.findPolygonResizeBoxClicked();
                // prepare to move resize box of polygon
                if (this.selectedResizeBox && this.polygonPoints.length > 0) {
                  api.resizeMode = true;
                  this.selectedResizeBox.index = this.polygonPoints.findIndex(
                    (i) => i.x === this.selectedResizeBox.x
                  );
                  api.resizeStartPos = {
                    x: this.selectedResizeBox.x,
                    y: this.selectedResizeBox.y,
                  };
                }
              } else {
                if (api.selectedArea != object) {
                  api.preSelectedArea = object;
                  api.selectedArea = null;
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
                  Math.abs(Math.abs(api.movingOffset.y) - height / 2) <
                    resizeMin
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
            }
          }
        } else {
          if (this.groupMode) {
            api.selectedGroup = null;
          }
          if (this.sensorMode) {
            api.selectedDevice = null;
            this.creatingDevice = null;
          } else {
            api.selectedArea = null;
            api.selectedPolygonArea = null;
            this.creatingArea = null;
            this.creatingPolygonArea = null;
            this.updateResizeBoxes(false, null, 0, 0);
            this.updatePolygonResizeBoxes(false, null);
          }
        }
      }
      return;
    }
  }

  pointerMove(e) {
    const api = canvasObjects;
    if (!api.startPos && !api.movingMess) {
      return;
    }
    // Adding device do not need action pointer move
    if (this.addMode && this.addDevice) {
      return;
    }
    if (this.drawPolygonArea) {
      return;
    }

    const canvas = this.dxfViewer;
    const currentPos = this.getMouseActionPos(e, canvas, api);

    // Handle drawing
    if (api.startPos && currentPos) {
      if (this.areaMode) {
        const rectInfo = this.calcRectByTwoPoint(api.startPos, currentPos);
        const findData = this.findObjectByName("drawing-rect");

        if (findData.length > 0) {
          const rect = findData[0];
          const CircleGeo = new THREE.BoxBufferGeometry(
            rectInfo.width,
            rectInfo.height,
            1
          );
          rect.renderOrder = 9999;
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
      } else {
        const rectInfo = this.calcRectByTwoPoint(api.startPos, currentPos);
        const findData = this.findObjectByName("drawing-select-box");

        if (findData.length > 0) {
          const rect = findData[0];
          const CircleGeo = new THREE.BoxBufferGeometry(
            rectInfo.width,
            rectInfo.height,
            1
          );
          rect.renderOrder = 9999;
          rect.position.copy(new THREE.Vector3(rectInfo.x, rectInfo.y, 0));
          rect.geometry = CircleGeo;
          canvas.Render();
          return;
        }

        this.drawRect(
          new THREE.Vector3(rectInfo.x, rectInfo.y, 0),
          rectInfo.width,
          rectInfo.height,
          "drawing-select-box"
        );
      }
      return;
    }

    // We need to select group first befrore moving or resizing
    if (
      !api.selectedArea &&
      !api.selectedDevice &&
      !api.selectedGroup &&
      !api.selectedPolygonArea
    ) {
      return;
    }
    this.movingAction = true;
    // Handle moving and resize
    if (api.movingMess && currentPos) {
      if (api.resizeMode) {
        if (!api.resizeStartPos) {
          return;
        }
        // moving polygon resize box
        if (api.movingMess.object.exData.positions.length > 2) {
          this.selectedResizeBox.x = currentPos.x;
          this.selectedResizeBox.y = currentPos.y;
          this.polygonPoints[this.selectedResizeBox.index] = {
            x: currentPos.x,
            y: currentPos.y,
          };
          const sortPoints = this.sortShapePointPolygon(this.polygonPoints);
          let polygonShape = new THREE.Shape().moveTo(
            sortPoints[0].x,
            sortPoints[0].y
          );

          for (let i = 1; i < sortPoints.length; i++) {
            polygonShape = polygonShape.lineTo(
              sortPoints[i].x,
              sortPoints[i].y
            );
          }
          const geometry = new THREE.ShapeGeometry(polygonShape);
          api.movingMess.object.exData.positions = this.polygonPoints;
          api.movingMess.object.geometry = geometry;
          api.movingMess.object.position = new THREE.Vector3(0, 0, 0);
          this.updatePolygonResizeBoxes(true, api.movingMess.object);
        } else {
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
        }
      } else {
        // moving device or group
        if (this.moveAllInGroupMode) {
          if (api.movingMess.object.name === parentGroup) {
            const newPos = new THREE.Vector3(
              currentPos.x - api.movingOffset.x,
              currentPos.y - api.movingOffset.y,
              0
            );
            this.moveChildGroupDevice(api.movingMess.object, newPos);
            api.movingMess.object.position.copy(newPos);
          }
        } else {
          const newPos = new THREE.Vector3(
            currentPos.x - api.movingOffset.x,
            currentPos.y - api.movingOffset.y,
            0
          );
          api.movingMess.object.position.copy(newPos);
        }

        if (
          this.enableMovingDevice ||
          this.enableMovingGroup ||
          this.enableMovingAllInGroup
        ) {
        } else {
          // Update resizing box
          const { width, height } = api.movingMess.object.geometry.parameters;
          if (api.movingMess.object.exData.type === "area") {
            if (api.movingMess.object.exData.positions.length > 2) {
              this.updatePolygonResizeBoxes(true, api.movingMess.object);
            } else {
              this.updateResizeBoxes(
                true,
                api.movingMess.object.position,
                width,
                height
              );
            }
          }
        }
      }

      canvas.Render();
    }
  }

  pointerUp(e) {
    if (this.heatmapMode || this.trackingMode || e.button === 2) {
      return;
    }

    const api = canvasObjects;
    const canvas = this.dxfViewer;
    const currentPos = this.getMouseActionPos(e, canvas, api);

    let isDraw = false;
    // Handle adding rect
    if (api.startPos) {
      // Handle adding device
      if (this.addDevice) {
        const findData = this.findObjectByName("drawing-device");
        if (findData.length > 0) {
          const rect = findData[0];
          rect.name = "new-device";

          api.selectedObjects = [rect.name];
          api.selectedDevice = rect;
          api.preSelectedDevice = rect;
          isDraw = true;
          this.addMode = false;
          this.sensorMode = true;
        }
      } else {
        // Rect will be added.
        if (this.areaMode) {
          // click to draw polygon area button and create polygon area
          if (this.drawPolygonArea) {
            this.createPolygonShape(this.polygonPoints);
            const findPolygonArea = this.findObjectByName("Polygon-area-new");

            if (findPolygonArea.length > 0) {
              const mesh = findPolygonArea[0];
              const exData = {
                name: "New polygon area",
                type: "area",
                positions: this.sortShapePointPolygon(this.polygonPoints),
                is_new: true,
              };
              mesh.exData = exData;

              const tempObjects = api.objects.filter(
                (o) => !o.name.includes("Polygon-area-new")
              );
              api.objects = tempObjects;
              api.objects.push(mesh);
              this.creatingPolygonArea = mesh;
              this.onClick("single", mesh.exData);
            }
          }
          const findData = this.findObjectByName("drawing-rect");
          if (findData.length > 0) {
            const rect = findData[0];
            rect.name = "Rect-area";
            const { position, geometry } = rect;
            const { width, height } = geometry.parameters;
            const dxfPos = this.convertScenePositionToDxf(
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
              positions: [],
              is_new: true,
            };
            rect.exData = exData;
            api.objects.push(rect);
            api.selectedArea = rect;
            api.preSelectedArea = rect;
            isDraw = true;
            this.addMode = false;
          }
          const findPolygonArea = this.findObjectByName("Polygon-area-new");
          if (findPolygonArea.length > 0) {
            const polygon = findPolygonArea[0];
            api.selectedPolygonArea = polygon;
            api.preSelectedPolygonArea = polygon;
          }
        } else {
          const findData = this.findObjectByName("drawing-select-box");
          if (findData.length > 0) {
            const rect = findData[0];
            const { position, geometry } = rect;
            const { width, height } = geometry.parameters;
            const x = position.x;
            const y = position.y;

            let selectedDevices = [];
            let selectedGroups = [];

            api.objects.forEach((o) => {
              if (
                o.position.x >= x - width / 2 &&
                o.position.x <= x + width / 2 &&
                o.position.y >= y - height / 2 &&
                o.position.y <= y + height / 2 &&
                o.name.includes("box-") &&
                o.material.visible == true
              ) {
                if (o.name.includes("box-devices-")) {
                  selectedDevices.push(o.exData);
                } else if (o.name.includes("box-Group-")) {
                  selectedGroups.push(o.exData);
                }
                api.selectedObjects.push(o.name);
              }
            });

            // Remove select box when button mouse up
            const scene = this.dxfViewer ? this.dxfViewer.GetScene() : null;
            const { children } = scene;
            const meshName = "drawing-select-box";
            const selectBox = children.filter((box) => box.name === meshName);
            selectBox.forEach((box) => {
              scene.remove(box);
            });

            if (selectedGroups.length > 0) {
              const idGroupsSelected = [];
              selectedGroups.forEach((group) => {
                idGroupsSelected.push(group.id);
              });

              api.objects.forEach((o) => {
                if (o.name.includes(`group-text-`)) {
                  const groupId = parseInt(o.name.split("group-text-")[1]);
                  if (idGroupsSelected.includes(groupId)) {
                    o.material.visible = false;
                  } else {
                    if (this.visibleGroups.includes(groupId)) {
                      o.material.visible = true;
                    }
                  }
                }
              });
            }

            children
              .filter((e) => api.selectedObjects.includes(e.name))
              .forEach((e) => {
                e.material.map = this.getIcon(e.exData);
              });
            if (api.selectedObjects.length > 1) {
              this.onClick("multi", selectedDevices, selectedGroups);
            } else {
              this.onClick(
                "single",
                selectedDevices.length > 0
                  ? selectedDevices[0]
                  : selectedGroups[0]
              );
            }
          }
        }
      }
    }
    api.startPos = null;
    let upInside = false;
    let upInsideDevice = false;
    if (api.preSelectedArea) {
      const intersects = this.findObjectAtPos(e).filter((e) => {
        const mesh = e.object;
        return mesh.name.includes("Rect-area");
      });

      for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object == api.preSelectedArea) {
          upInside = true;
          break;
        }
      }

      if (upInside || isDraw) {
        api.selectedArea = api.preSelectedArea;
        api.preSelectedArea = null;
        // Add resize boxes
        const { position, geometry } = api.selectedArea;
        const { width, height } = geometry.parameters;
        this.updateResizeBoxes(true, position, width, height);
        this.updatePolygonResizeBoxes(false, null);
      } else {
        api.preSelectedArea = null;
      }
    }
    if (api.preSelectedPolygonArea) {
      const intersects = this.findObjectAtPos(e).filter((e) => {
        const mesh = e.object;
        return mesh.name.includes("Polygon-area");
      });

      for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object == api.preSelectedPolygonArea) {
          upInside = true;
          break;
        }
      }

      if (upInside || isDraw) {
        api.selectedPolygonArea = api.preSelectedPolygonArea;
        api.preSelectedPolygonArea = null;
        this.updatePolygonResizeBoxes(true, api.selectedPolygonArea);
        this.updateResizeBoxes(false, null, 0, 0);
      } else {
        api.preSelectedPolygonArea = null;
      }
    }

    if (api.preSelectedDevice) {
      const intersects = this.findObjectAtPos(e).filter((e) => {
        const mesh = e.object;
        const data = deviceByKeys[this.getMeshName(mesh.exData)] || mesh.exData;
        return (
          mesh.name.includes(`devices-${data.id}`) || mesh.name == "new-device"
        );
      });

      for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object == api.preSelectedDevice) {
          upInsideDevice = true;
          break;
        }
      }
      if (upInsideDevice || isDraw) {
        api.selectedDevice = api.preSelectedDevice;
        api.preSelectedDevice = null;
        // Add resize boxes
      } else {
        api.preSelectedDevice = null;
      }
    }

    if (e.button == 0) {
      // Disable show/hide sensor grid
      // if (api.selectedSensor) {
      //   this.showHideSensorGrid(api.selectedSensor, true);
      // } else {
      //   this.showHideSensorGrid(api.selectedSensor, false);
      // }
    }
    if (upInside || upInsideDevice || isDraw || api.movingMess) {
      if (this.sensorMode) {
        if (isDraw || this.movingAction) {
          if (this.groupMode) {
            // move all in group
            if (this.moveAllInGroupMode) {
              let temp = objectsMove;
              if (!temp.some((item) => item.name === api.selectedGroup.name)) {
                temp.push(api.selectedGroup);
              }
              this.handleCreateAndMoveAllObject(temp);
            } else {
              this.handleCreateAndMoveObject(api.selectedGroup);
            }
          } else {
            this.handleCreateAndMoveObject(api.selectedDevice);
          }
        }
        // Add this code to add new device
        if (!api.selectedDevice?.exData?.id) {
          this.creatingDevice = api.selectedDevice;
        } else {
          this.creatingDevice = null;
        }
      } else {
        if (
          this.areaMode &&
          api.movingMess &&
          api.movingMess.object.exData.positions.length > 2
        ) {
          // highlight selected resize box of polygon
          api.editPolygonMess = api.movingMess;
          api.polygonResizeBoxes.forEach((mess) => {
            if (this.selectedResizeBox) {
              mess.material.color.setHex(
                this.selectedResizeBox.x === mess.position.x
                  ? 0x0cf049
                  : 0xf97316
              );
            } else {
              mess.material.color.setHex(0xf97316);
            }
          });
          // insert or delete points in polygon by ctrl + click
          if (e.altKey) {
            if (this.selectedResizeBox) {
              if (this.polygonPoints.length > 3) {
                this.polygonPoints = this.polygonPoints.filter(
                  (point) => point.x !== this.selectedResizeBox.x
                );
                const sortPoints = this.sortShapePointPolygon(
                  this.polygonPoints
                );
                let polygonShape = new THREE.Shape().moveTo(
                  sortPoints[0].x,
                  sortPoints[0].y
                );

                for (let i = 1; i < sortPoints.length; i++) {
                  polygonShape = polygonShape.lineTo(
                    sortPoints[i].x,
                    sortPoints[i].y
                  );
                }
                const geometry = new THREE.ShapeGeometry(polygonShape);
                api.movingMess.object.exData.positions = this.polygonPoints;
                api.movingMess.object.geometry = geometry;
                api.movingMess.object.position = new THREE.Vector3(0, 0, 0);
                this.updatePolygonResizeBoxes(true, api.movingMess.object);
              }
            } else {
              this.selectedResizeBox = { x: currentPos.x, y: currentPos.y };
              this.polygonPoints.push(this.selectedResizeBox);
              const sortPoints = this.sortShapePointPolygon(this.polygonPoints);
              let polygonShape = new THREE.Shape().moveTo(
                sortPoints[0].x,
                sortPoints[0].y
              );

              for (let i = 1; i < sortPoints.length; i++) {
                polygonShape = polygonShape.lineTo(
                  sortPoints[i].x,
                  sortPoints[i].y
                );
              }
              const geometry = new THREE.ShapeGeometry(polygonShape);
              api.movingMess.object.exData.positions = this.polygonPoints;
              api.movingMess.object.geometry = geometry;
              api.movingMess.object.position = new THREE.Vector3(0, 0, 0);
              this.updatePolygonResizeBoxes(true, api.movingMess.object);
            }
          }
        }
        if (this.areaMode && api.selectedArea) {
          this.handleClickAtArea(api.selectedArea);
        } else if (this.areaMode && api.selectedPolygonArea) {
          this.handleClickAtPolygonArea(api.selectedPolygonArea);
        }
        if (!api.selectedArea?.exData?.id) {
          this.creatingArea = api.selectedArea;
        } else {
          this.creatingArea = null;
        }
        if (!api.selectedPolygonArea?.exData?.id) {
          this.creatingPolygonArea = api.selectedPolygonArea;
        } else {
          this.creatingPolygonArea = null;
        }
      }
    } else {
      if (this.areaMode && !this.drawPolygonArea) {
        this.handleClickAtArea(null);
        this.polygonPoints = [];
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
        this.dxfViewer.Render();
        return;
      }
    } catch (e) {
      console.log(e);
    }
    const x = (e.offsetX / e.target.clientWidth) * 2 - 1;
    const y = -(e.offsetY / e.target.clientHeight) * 2 + 1;
    api.v2 = new THREE.Vector2(x, y);
    api.movingObject = { intersects: null };
    if (e.button == 0 && !e.altKey) {
      if (!this.movingAction) {
        if (!this.addDevice) {
          if (!this.drawPolygonArea) {
            this.handleClickAt();
          }
          this.addDevice = false;
        }
        this.addDevice = false;
      }
    }
    api.isMove = false;
    this.dxfViewer.Render();
  }

  onBack() {
    if (this.history.length == 0) {
      return;
    }
    this.activeGroup = this.history.pop();
    if (this.activeGroup) {
      this.activeGroup = this.groups.find((g) => g.id === this.activeGroup.id);
      this.groupedDevices = [];
      let visibleGroups = [];

      for (let i = 0; i < this.activeGroup.group_ids.length; i++) {
        let group = this.groups.find(
          (g) => g.id === this.activeGroup.group_ids[i]
        );
        if (
          group &&
          (group.device_ids.length > 0 || group.group_ids.length > 0)
        ) {
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
    if (
      this.heatmapMode ||
      this.trackingMode ||
      this.enableMovingGroup ||
      this.enableMovingDevice ||
      this.enableMovingAllInGroup
    ) {
      return;
    }
    // console.log("double click");
    if (this.activeGroup) {
      this.activeGroup = this.groups.find((g) => g.id === this.activeGroup.id);
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
      let group = this.groups.find((g) => g.id === objects[0].object.exData.id);
      this.activeGroup = group;

      if (group) {
        let visibleGroups = [];

        for (let i = 0; i < this.activeGroup.group_ids.length; i++) {
          let childGroup = this.groups.find(
            (g) => g.id === this.activeGroup.group_ids[i]
          );
          if (
            childGroup &&
            (childGroup.device_ids.length > 0 ||
              childGroup.group_ids.length > 0)
          ) {
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
          if (group && group.scene_status) {
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

  convertLocation(canvas, x, y, zoom) {
    const location = setLocation(x, y, zoom);

    location.target = this.convertPositionInScene(
      location.target,
      canvas.origin
    );

    location.position = this.convertPositionInScene(
      location.position,
      canvas.origin
    );

    return location;
  }

  moveCamera(coordinate, zoom) {
    const canvas = this.dxfViewer;
    if (!canvas || !canvas.origin) {
      return;
    }

    const location = this.convertLocation(
      canvas,
      coordinate.x,
      coordinate.y,
      zoom || canvas.GetCamera().zoom
    );

    canvas.GetControls().SetState(location);
    canvas.GetControls().reset();
  }

  zoomToGroup(group) {
    const canvas = this.dxfViewer;
    if (!canvas || !canvas.origin) {
      return;
    }

    const api = canvasObjects;
    api.v2 = new THREE.Vector2(group.x, group.y);

    const location = this.convertLocation(canvas, group.x, group.y, 4);

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

  moveChildGroupDevice(parentGroup, position) {
    const api = canvasObjects;

    const canvas = this.dxfViewer;
    if (!canvas) {
      return;
    }

    const scene = canvas.GetScene();
    const { children } = scene;

    objectsMove.forEach((e) => {
      const newPos = new THREE.Vector3(
        e.position.x + (position.x - parentGroup.position.x),
        e.position.y + (position.y - parentGroup.position.y),
        0
      );
      e.position.copy(newPos);
    });
  }

  destroy() {
    this.dxfViewer.Destroy();
  }
}
