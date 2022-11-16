function initEvents() {
  viewsContainerDiv.addEventListener("mousemove", function (e) {
    mouseEvent('move', e);
  }, false);
  viewsContainerDiv.addEventListener("mousedown", function (e) {
    mouseEvent('down', e);
  }, false);
  viewsContainerDiv.addEventListener("mouseup", function (e) {
    mouseEvent('up', e);
  }, false);
  viewsContainerDiv.addEventListener("mouseout", function (e) {
    mouseEvent('out', e);
  }, false);

  viewsContainerDiv.addEventListener("wheel", function (event) {

  }, false);

  showLayerBiomesButton.addEventListener("click", function (e) {
    e.stopPropagation();
    e.preventDefault();
    showLayer('biomes');
  });

  showLayerWaterButton.addEventListener("click", function (e) {
    e.stopPropagation();
    e.preventDefault();
    showLayer('water');
  });

  showLayerTemperatureButton.addEventListener("click", function (e) {
    e.stopPropagation();
    e.preventDefault();
    showLayer('temperature');
  });

  showLayerRainfallButton.addEventListener("click", function (e) {
    e.stopPropagation();
    e.preventDefault();
    showLayer('rainfall');
  });

  showLayerHeightButton.addEventListener("click", function (e) {
    e.stopPropagation();
    e.preventDefault();
    showLayer('height');
  });

  window.addEventListener('pointermove', onPointerMove);

  let inputHeightmap = document.getElementById('inputHeightmap');
  inputHeightmap.addEventListener('change', importHeight);

  let inputWater = document.getElementById('inputWater');
  inputWater.addEventListener('change', importWater);

  let inputBiome = document.getElementById('inputBiome');
  inputBiome.addEventListener('change', importBiome);

  let inputMap = document.getElementById('inputMap');
  inputMap.addEventListener('change', importExistingMap);
}

function mouseEvent(...args) {
  if (state.activeDimension === '2d') {
    drawWithTool(...args);
  } else {
    drawWith3dTool(...args);
  }
}