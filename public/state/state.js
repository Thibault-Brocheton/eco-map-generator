const initialState = {
  size: 0,
  activeLayer: 'biomes',
  activeCanvas: null,
  activeContext: null,
  activeDimension: '2d',
  tool2d: 'pen',
  tool3d: 'move',
  isPointerDown: false,
}

resetState();

let sizeInput;

let closeMapDiv;
let mapCreationDiv;
let contentDiv;
let viewsContainerDiv;
let toolbar2dDiv;
let toolbar3dDiv;

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
  // Inputs
  sizeInput = document.getElementById('size');

  // Divs
  closeMapDiv = document.getElementById('close-map');
  mapCreationDiv = document.getElementById('map-creation');
  contentDiv = document.getElementById('content');
  viewsContainerDiv = document.getElementById('views-container');
  toolbar2dDiv = document.getElementById('toolbar2d');
  toolbar3dDiv = document.getElementById('toolbar3d');

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
  };

  layersAssoc.water = {
    canvas: waterCanvas,
    context: waterContext,
    button: showLayerWaterButton,
  };

  layersAssoc.temperature = {
    canvas: temperatureCanvas,
    context: temperatureContext,
    button: showLayerTemperatureButton,
  };

  layersAssoc.rainfall = {
    canvas: rainfallCanvas,
    context: rainfallContext,
    button: showLayerRainfallButton,
  };

  layersAssoc.height = {
    canvas: heightCanvas,
    context: heightContext,
    button: showLayerHeightButton,
  };

  layersAssoc.waterlevel = {
    canvas: waterlevelCanvas,
    context: waterlevelContext,
    button: showLayerWaterlevelButton,
  };


  initEvents();
});

function createMap() {
  const size = parseInt(sizeInput.value);

  if (!size || size <= 0 || size % 4 !== 0) {
    alert("Size must be a positive integer and must be a multiple of 4.");
  }

  window.state.size = size * 10;

  for (let canvas of [biomeCanvas, waterCanvas, temperatureCanvas, rainfallCanvas, heightCanvas]) {
    canvas.width = window.state.size;
    canvas.height = window.state.size;
  }

  biomeContext.fillStyle = biomesConfiguration["DeepOcean"].color;
  biomeContext.fillRect(0, 0, window.state.size, window.state.size);

  waterContext.fillStyle = 'rgba(0,0,0,0)';
  waterContext.fillRect(0, 0, window.state.size, window.state.size);

  temperatureContext.fillStyle = 'rgb(0,0,0)';
  temperatureContext.fillRect(0, 0, window.state.size, window.state.size);

  rainfallContext.fillStyle = 'rgb(0,0,0)';
  rainfallContext.fillRect(0, 0, window.state.size, window.state.size);

  heightContext.fillStyle = 'rgb(0,0,0)';
  heightContext.fillRect(0, 0, window.state.size, window.state.size);

  enterMapEdition();
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
    } else {
      layersAssoc[layerKey].button.classList.remove('active');

      if (layerKey === 'height' && layer === 'waterlevel') {
        layersAssoc[layerKey].canvas.style.display = 'block';
      } else if (layerKey !== 'biomes') {
        layersAssoc[layerKey].canvas.style.display = 'none';
      }
    }
  }
}

function switchView() {
  if (window.state.activeDimension === '3d') {
    switchViewImg.src = '/assets/3d.svg';
    toolbar2dDiv.style.display = 'block';
    toolbar3dDiv.style.display = 'none';
    container3d.style.display = 'none';
    window.state.activeDimension = '2d';
  } else {
    switchViewImg.src = '/assets/2d.svg';
    toolbar2dDiv.style.display = 'none';
    toolbar3dDiv.style.display = 'block';
    container3d.style.display = 'block';
    window.state.activeDimension = '3d';
    refresh3dContent();
  }
}