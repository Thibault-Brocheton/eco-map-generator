document.addEventListener('DOMContentLoaded', () => {
  const canvasB = document.getElementById("map_biomes");
  const canvasW = document.getElementById("map_water");
  const mapHeight = document.getElementById('map_height');

  canvasB.addEventListener("mousemove", function (e) {
    drawWithTool('move', e);
  }, false);
  canvasB.addEventListener("mousedown", function (e) {
    drawWithTool('down', e);
  }, false);
  canvasB.addEventListener("mouseup", function (e) {
    drawWithTool('up', e);
  }, false);
  canvasB.addEventListener("mouseout", function (e) {
    drawWithTool('out', e);
  }, false);

  canvasW.addEventListener("mousemove", function (e) {
    drawWithTool('move', e);
  }, false);
  canvasW.addEventListener("mousedown", function (e) {
    drawWithTool('down', e);
  }, false);
  canvasW.addEventListener("mouseup", function (e) {
    drawWithTool('up', e);
  }, false);
  canvasW.addEventListener("mouseout", function (e) {
    drawWithTool('out', e);
  }, false);

  mapHeight.addEventListener("mousemove", function (e) {
    drawWith3dTool('move', e);
  }, false);
  mapHeight.addEventListener("mousedown", function (e) {
    drawWith3dTool('down', e);
  }, false);
  mapHeight.addEventListener("mouseup", function (e) {
    drawWith3dTool('up', e);
  }, false);
  mapHeight.addEventListener("mouseout", function (e) {
    drawWith3dTool('out', e);
  }, false);

  window.addEventListener( 'pointermove', onPointerMove );

  let inputHeightmap = document.getElementById('inputHeightmap');
  inputHeightmap.addEventListener('change', importHeight);

  let inputWater = document.getElementById('inputWater');
  inputWater.addEventListener('change', importWater);

  let inputBiome = document.getElementById('inputBiome');
  inputBiome.addEventListener('change', importBiome);
});
