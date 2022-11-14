const maxHeight = 160;
const waterHeight = 60;

let color = '#000000';
let width = 10;
let elevationHeight = 10;
let elevationWidth = 10;
let tool = 'pen';
let tool3d = 'move';
let size = 720;

let scene;
let camera;
let renderer;
let controls;
let instanceMesh;

const instanceXZ = {};

let activeCanvas;
let activeContext;

let is3dDrawing = false;
let planeWater;
var isDrawing = false;

let canvasB;
let canvasW;
let mapHeight;

let canvasHidden;

let ctxB;
let ctxW;
let ctxHidden;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

document.addEventListener('DOMContentLoaded', () => {
  canvasB = document.getElementById("map_biomes");
  canvasW = document.getElementById("map_water");
  mapHeight = document.getElementById('map_height');

  canvasHidden = document.getElementById("hidden_height");

  ctxB = canvasB.getContext("2d");
  ctxB.imageSmoothingEnabled = false;
  ctxW = canvasW.getContext("2d");
  ctxHidden = canvasHidden.getContext("2d");

  init3dView();
});

function reset() {
  size = parseInt(document.getElementById("size").value);

  for (let canvas of [canvasB, canvasW, canvasHidden]) {
    canvas.width = size;
    canvas.height = size;
  }

  mapHeight.style.width = size + 'px';
  mapHeight.style.height = size + 'px';

  ctxB.fillStyle = 'rgb(0,0,0)';
  ctxB.fillRect(0, 0, size, size);

  ctxW.fillStyle = 'rgba(0,0,0,0)';
  ctxW.fillRect(0, 0, size, size);

  showBiomes();

  update3dView();

  var content = document.getElementById("content");
  content.style.display = 'block';
}

function showBiomes() {
  activeCanvas = canvasB;
  activeContext = ctxB;
  canvasB.style.display = 'block';
  canvasW.style.display = 'none';
  mapHeight.style.display = 'none';
}

function toggleWater() {
  toolPen();

  if (canvasW.style.display === 'block') {
    canvasW.style.display = 'none';
    activeCanvas = canvasB;
    activeContext = ctxB;
    document.getElementById('color-water').style.display = 'none';
    document.getElementById('toolFill').style.display = 'block';
    document.getElementById('color-biomes').style.display = 'block';
    switchColor("#000000");
    document.getElementById('toggle-water').innerHTML = "Show Water";
  } else {
    canvasW.style.display = 'block';
    activeCanvas = canvasW;
    activeContext = ctxW;
    switchColor('#000000');
    document.getElementById('color-water').style.display = 'block';
    document.getElementById('toolFill').style.display = 'none';
    document.getElementById('color-biomes').style.display = 'none';
    document.getElementById('toggle-water').innerHTML = "Hide Water";
  }
}

function toggle3d() {
  if (mapHeight.style.display === 'block') {
    document.getElementById('toggle-3d').innerHTML = "Show 3D";
    document.getElementById('toolbar2d').style.display = "block";
    document.getElementById('toolbar3d').style.display = "none";
    mapHeight.style.display = 'none';
  } else {
    document.getElementById('toggle-3d').innerHTML = "Hide 3D";
    document.getElementById('toolbar2d').style.display = "none";
    document.getElementById('toolbar3d').style.display = "block";
    mapHeight.style.display = 'block';
    refresh3dContent();
  }
}

function togglePlaneWater() {
  if (planeWater) {
    scene.remove(planeWater);
    planeWater = undefined;
  } else {
    const geoWater = new THREE.PlaneGeometry(size, size);
    const matWater = new THREE.MeshBasicMaterial({
      color: 0x99FFFF,
      side: THREE.DoubleSide,
      opacity: 0.5,
      transparent: true
    });
    planeWater = new THREE.Mesh(geoWater, matWater);
    planeWater.position.x = size / 2;
    planeWater.position.y = waterHeight;
    planeWater.position.z = size / 2;
    planeWater.rotateX(-Math.PI / 2);

    scene.add(planeWater);
  }
}