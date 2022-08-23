import * as THREE from 'three';

export function toggleObject(objMesh) {
  if (objMesh.material) {
    objMesh.material.visible = !objMesh.material.visible;
  }
}

export function findId(meshobj) {
  const info = meshobj.name.split(',');
  const id = parseInt(info[1], 10);

  return { id: id, name: info[0] };
}
export function toggleById(id, arrayMesh) {
  try {
    const idyellow = id + 1;
    const idred = id + 2;
    toggleObject(arrayMesh[idyellow]);
    toggleObject(arrayMesh[idred]);
  } catch (ex) {
    console.log(ex);
  }
}

export function convertPositionInScene(pos, originScene) {
  const x = parseFloat(pos.x);
  const y = parseFloat(pos.y);
  return new THREE.Vector3(x - originScene.x, y - originScene.y, pos.z);
}

export function convertScenePositionToDxf(pos, originScene) {
  const x = parseFloat(pos.x);
  const y = parseFloat(pos.y);
  return new THREE.Vector3(x + originScene.x, y + originScene.y, pos.z);
}

export function findMeshByDeviceId(devId, arrayMesh) {
  const it = arrayMesh.filter((v) => v.name.includes(`box-${devId}`));
  return it[0];
}

export function getScreenPosition(x, y, z, camera, width, height) {
  const p = new THREE.Vector3(x, y, z);
  const vector = p.project(camera);

  vector.x = ((vector.x + 1) / 2) * width;
  vector.y = (-(vector.y - 1) / 2) * height;

  return vector;
}

export function cameraPointing(camera, vector) {
  return vector.applyQuaternion(camera.quaternion).add(camera.position);
}
export function cameraDirection(camera, vector) {
  return vector.applyQuaternion(camera.quaternion);
}

export function point2Vector(e, camera) {
  const mouse2D = new THREE.Vector3();
  let mouse3D = new THREE.Vector3();
  mouse2D.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse2D.y = -(e.clientY / window.innerHeight) * 2 + 1;
  mouse2D.z = 0;

  mouse3D = mouse2D.clone().unproject(camera);

  const dir = cameraDirection(camera, new THREE.Vector3(0, 0, -1));
  // const dist = -camera.position.z / dir.z

  return mouse3D;
  // coordinate & distance
  // let vector = new THREE.Vector3(
  //   (e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1,
  //   -1);

  // vector.unproject(camera);
  // let dir = vector.sub(camera.position).normalize();
  // let distance = -camera.position.z / dir.z;
  // let pos = camera.position.clone().add(dir.multiplyScalar(distance));
  // return pos;
}

export function setPlaneByPoint() {
  // const api = canvasAPI.current;
  // api.plane.position.set(api.pointer.x, api.pointer.y, api.pointer.z)
  // api.plane.position.divideScalar(15000).floor().multiplyScalar(15000).addScalar(7500)
  // api.plane.position.z = 0
}
export function setBoxPoint() {
  // const api = canvasAPI.current;
  // if (btnDraw.current)
  //   if (btnDraw.current.className.length > 2) {
  //     api.roll.position.set(api.pointer.x, api.pointer.y, api.pointer.z)
  //     api.roll.position.divideScalar(wbox).floor().multiplyScalar(wbox).addScalar(wbox / 2); //box addScalar
  //   }
}

// const dy = 1000; // for create object
// function createObj(intersect, api, wbox1) {
//   const scene = canvas.GetScene();
//   const CircleGeo = new THREE.CircleBufferGeometry(wbox1, wbox1);

//   const CircleMaterial = new THREE.MeshBasicMaterial({
//     color: '#f00',
//     visible: true,
//   });

//   const RingGeometry = new THREE.RingBufferGeometry(wbox1 - 100, wbox1, 32);
//   const RingMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
//   const mesh = new THREE.Mesh(RingGeometry, RingMaterial);

//   mesh.position.copy(intersect.point).add(intersect.face.normal);
//   mesh.position.y += dy;
//   mesh.position.z -= 0.03;
//   mesh.name = `Ring${api.objects.length}`;

//   const voxel = new THREE.Mesh(CircleGeo, CircleMaterial);
//   voxel.position.copy(intersect.point).add(intersect.face.normal);
//   voxel.position.y += dy; // fraction
//   voxel.name = `box${api.objects.length}`;

//   scene.add(voxel);
//   api.objects.push(voxel);
//   scene.add(mesh);
//   api.objects.push(mesh);
// }
