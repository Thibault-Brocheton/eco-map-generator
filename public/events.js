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

  showLayerWaterlevelButton.addEventListener("click", function (e) {
    e.stopPropagation();
    e.preventDefault();
    showLayer('waterlevel');
  });

  window.addEventListener('pointermove', onPointerMove);

  let inputMap = document.getElementById('inputMap');
  inputMap.addEventListener('change', (event) => {
    const rebaseHeightMap = document.getElementById('rebaseHeightmap').checked;

    importExistingMap(event, rebaseHeightMap);
  });
}

function mouseEvent(...args) {
  if (state.activeDimension === '2d') {
    drawWithTool(...args);
  } else {
    drawWith3dTool(...args);
  }
}