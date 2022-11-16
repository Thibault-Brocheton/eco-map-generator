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

let is3dDrawing = false;
let planeWater;
var isDrawing = false;

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