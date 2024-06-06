const initialState = {
  size: 0,
  activeLayer: 'biomes',
  activeCanvas: null,
  activeContext: null,
  activeDimension: '2d',
  tool2d: 'pen',
  tool3d: 'move',
  brushWidth: 10,
  eraserWidth: 10,
  blurPower: 200,
  color: '#000000',
  isPointerDown: false,
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  stats: null,
  instanceMesh: null,
  instanceXZ: null,
  planeWater: null,
  printWaterChanges: null,
  elevationHeight: 10,
  elevationWidth: 10,
}

let sizeInput;

let closeMapDiv;
let mapCreationDiv;
let contentDiv;
let viewsContainerDiv;
let toolbar2dDiv;
let toolbar3dDiv;
let toolsDiv;

let colorsBiomesDiv;
let colorsWaterDiv;
let colorsTemperatureDiv;
let colorsRainfallDiv;
let colorsHeightDiv;
let colorsWaterlevelDiv;

let biomeCanvas;
let waterCanvas;
let temperatureCanvas;
let rainfallCanvas;
let heightCanvas;
let waterlevelCanvas;

let biomeContext;
let waterContext;
let temperatureContext;
let rainfallContext;
let heightContext;
let waterlevelContext;

let showLayerBiomesButton;
let showLayerWaterButton;
let showLayerTemperatureButton;
let showLayerRainfallButton;
let showLayerHeightButton;
let showLayerWaterlevelButton;

let container3d;

let switchViewImg;

const layersAssoc = {};

document.addEventListener('DOMContentLoaded', () => {
  resetState();

  // Inputs
  sizeInput = document.getElementById('size');

  // Divs
  closeMapDiv = document.getElementById('close-map');
  mapCreationDiv = document.getElementById('map-creation');
  contentDiv = document.getElementById('content');
  viewsContainerDiv = document.getElementById('views-container');
  toolbar2dDiv = document.getElementById('toolbar-2d');
  toolbar3dDiv = document.getElementById('toolbar-3d');
  toolsDiv = document.getElementById('tools');

  colorsBiomesDiv = document.getElementById('colors-biomes');
  colorsWaterDiv = document.getElementById('colors-water');
  colorsTemperatureDiv = document.getElementById('colors-temperature');
  colorsRainfallDiv = document.getElementById('colors-rainfall');
  colorsHeightDiv = document.getElementById('colors-height');
  colorsWaterlevelDiv = document.getElementById('colors-waterlevel');

  // Canvas
  biomeCanvas = document.getElementById('biome-layer');
  waterCanvas = document.getElementById('water-layer');
  temperatureCanvas = document.getElementById('temperature-layer');
  rainfallCanvas = document.getElementById('rainfall-layer');
  heightCanvas = document.getElementById('height-layer');
  waterlevelCanvas = document.getElementById('waterlevel-layer');

  // Canvas Contexts
  biomeContext = biomeCanvas.getContext('2d', { willReadFrequently: true });
  waterContext = waterCanvas.getContext('2d', { willReadFrequently: true });
  temperatureContext = temperatureCanvas.getContext('2d', { willReadFrequently: true });
  rainfallContext = rainfallCanvas.getContext('2d', { willReadFrequently: true });
  heightContext = heightCanvas.getContext('2d', { willReadFrequently: true });
  waterlevelContext = waterlevelCanvas.getContext('2d', { willReadFrequently: true });

  // Buttons
  showLayerBiomesButton = document.getElementById('show-layer-biomes');
  showLayerWaterButton = document.getElementById('show-layer-water');
  showLayerTemperatureButton = document.getElementById('show-layer-temperature');
  showLayerRainfallButton = document.getElementById('show-layer-rainfall');
  showLayerHeightButton = document.getElementById('show-layer-height');
  showLayerWaterlevelButton = document.getElementById('show-layer-waterlevel');
  switchViewImg = document.getElementById('switch-view-img');

  // 3D
  container3d = document.getElementById('container-3d');

  // Assocs
  layersAssoc.biomes = {
    canvas: biomeCanvas,
    context: biomeContext,
    button: showLayerBiomesButton,
    colorsDiv: colorsBiomesDiv,
  };

  layersAssoc.water = {
    canvas: waterCanvas,
    context: waterContext,
    button: showLayerWaterButton,
    colorsDiv: colorsWaterDiv,
  };

  layersAssoc.temperature = {
    canvas: temperatureCanvas,
    context: temperatureContext,
    button: showLayerTemperatureButton,
    colorsDiv: colorsTemperatureDiv,
  };

  layersAssoc.rainfall = {
    canvas: rainfallCanvas,
    context: rainfallContext,
    button: showLayerRainfallButton,
    colorsDiv: colorsRainfallDiv,
  };

  layersAssoc.height = {
    canvas: heightCanvas,
    context: heightContext,
    button: showLayerHeightButton,
    colorsDiv: colorsHeightDiv,
  };

  layersAssoc.waterlevel = {
    canvas: waterlevelCanvas,
    context: waterlevelContext,
    button: showLayerWaterlevelButton,
    colorsDiv: colorsWaterlevelDiv,
  };


  initEvents();
});

function createMap() {
  const size = parseInt(sizeInput.value);

  if (!size || size <= 0 || size % 4 !== 0) {
    alert("Size must be a positive integer and must be a multiple of 4.");
  }

  window.state.size = size * 10;

  initializeCanvas(window.state.size);

  enterMapEdition();
}

function initializeCanvas(size) {
  for (let canvas of [biomeCanvas, waterCanvas, temperatureCanvas, rainfallCanvas, heightCanvas, waterlevelCanvas]) {
    canvas.width = size;
    canvas.height = size;
  }

  biomeContext.fillStyle = biomesConfiguration["DeepOcean"].color;
  biomeContext.fillRect(0, 0, size, size);

  waterContext.fillStyle = 'rgba(0,0,0,0)';
  waterContext.fillRect(0, 0, size, size);

  temperatureContext.fillStyle = 'rgb(0,0,0)';
  temperatureContext.fillRect(0, 0, size, size);

  rainfallContext.fillStyle = 'rgb(0,0,0)';
  rainfallContext.fillRect(0, 0, size, size);

  heightContext.fillStyle = 'rgb(0,0,0)';
  heightContext.fillRect(0, 0, size, size);

  waterlevelContext.fillStyle = 'rgba(0,0,0,0)';
  waterlevelContext.fillRect(0, 0, size, size);
}

function enterMapEdition() {
  closeMapDiv.style.display = 'flex';
  mapCreationDiv.style.display = 'none';
  contentDiv.style.display = 'block';

  window.state.activeCanvas = biomeCanvas;
  window.state.activeContext = biomeContext;

  init3dView();
}

function exitMapEdition() {
  if (!confirm('Are you sure you want to stop edition of this map ? All work will be lost unless you export it first !')) {
    return;
  }

  closeMapDiv.style.display = 'none';
  mapCreationDiv.style.display = 'flex';
  contentDiv.style.display = 'none';

  resetState();
}

function resetState() {
  window.state = {...initialState};

  if (container3d && container3d.firstChild) {
    while (container3d.firstChild) {
      container3d.removeChild(container3d.lastChild);
    }
  }
}

function showLayer(layer) {
  if (layer === window.state.activeLayer) {
    return;
  }

  window.state.activeLayer = layer;
  window.state.activeCanvas = layersAssoc[layer].canvas;
  window.state.activeContext = layersAssoc[layer].context;

  for (const layerKey in layersAssoc) {
    if (layerKey === layer) {
      layersAssoc[layerKey].canvas.style.display = 'block';
      layersAssoc[layerKey].button.classList.add('active');
      layersAssoc[layerKey].colorsDiv.style.display = 'block';
    } else {
      layersAssoc[layerKey].button.classList.remove('active');
      layersAssoc[layerKey].colorsDiv.style.display = 'none';

      if (layerKey === 'height' && layer === 'waterlevel') {
        layersAssoc[layerKey].canvas.style.display = 'block';
      } else if (layerKey !== 'biomes') {
        layersAssoc[layerKey].canvas.style.display = 'none';
      }
    }
  }

  for (const child of toolsDiv.children) {
    if (!child.dataset || !child.dataset.tools) {
      continue;
    }

    child.style.display = child.dataset.tools.includes(layer) ? 'block' : 'none';
  }
}

function switchView() {
  if (window.state.activeDimension === '3d') {
    switchViewImg.src = '/assets/3d.svg';
    toolbar2dDiv.style.display = 'block';
    toolbar3dDiv.style.display = 'none';
    container3d.style.display = 'none';
    window.state.activeDimension = '2d';
    apply3dElevationToCanvas();
  } else {
    switchViewImg.src = '/assets/2d.svg';
    toolbar2dDiv.style.display = 'none';
    toolbar3dDiv.style.display = 'block';
    container3d.style.display = 'block';
    window.state.activeDimension = '3d';

    refresh3dContent();
  }
}