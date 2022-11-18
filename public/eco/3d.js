const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function init3dView() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);
  scene.add(new THREE.HemisphereLight(0xffffcc, 0x19bbdc, 1));

  const camera = new THREE.PerspectiveCamera(90, 1, 0.1, 10000);

  const renderer = new THREE.WebGLRenderer({antialias: false});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.state.size, window.state.size);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.zoomSpeed = 1;
  controls.panSpeed = 1;

  const stats = new Stats();
  stats.setMode(0);

  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0';
  stats.domElement.style.bottom = '0';

  const updateCameraOrbit = () => {
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
  };

  controls.addEventListener('end', () => {
    updateCameraOrbit();
  });

  updateCameraOrbit();

  function animate() {
    requestAnimationFrame(animate);

    if (window.state.activeDimension === '3d') {
      controls.update();

      renderer.render(scene, camera);
      stats.update();
    }
  }

  animate();

  const material = new THREE.MeshBasicMaterial();
  const matrix = new THREE.Matrix4();
  const threeColor = new THREE.Color();

  const geometryBox = new THREE.BoxGeometry(1, 1, 1);
  const instanceMesh = new THREE.InstancedMesh(geometryBox, material, window.state.size * window.state.size);

  instanceMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
  instanceMesh.castShadow = true;
  instanceMesh.receiveShadow = true;
  scene.add(instanceMesh);

  const instanceXZ = {};

  for (let j = 0; j < window.state.size; j++) {
    for (let i = 0; i < window.state.size; i++) {
      const id = i + j * window.state.size;
      matrix.setPosition(i, 0.5, j);
      instanceMesh.setMatrixAt(id, matrix);
      instanceMesh.setColorAt(id, threeColor.setHex(Number('0x000000')));
      instanceXZ[`${i}:${j}`] = id;
    }
  }

  camera.position.set(window.state.size / 2, 200, window.state.size);
  controls.target = new THREE.Vector3(window.state.size / 2, 100, window.state.size / 2);

  window.state.scene = scene;
  window.state.camera = camera;
  window.state.renderer = renderer;
  window.state.controls = controls;
  window.state.stats = stats;
  window.state.instanceMesh = instanceMesh;
  window.state.instanceXZ = instanceXZ;

  container3d.appendChild(renderer.domElement);
  container3d.appendChild(stats.domElement);
}

function drawWith3dTool(res, e) {
  if (res === 'up' || res === 'out') {
    window.state.isPointerDown = false;
  }

  if (res === 'down') {
    window.state.isPointerDown = true;

    res = 'move';
  }

  if (res === 'move' && window.state.isPointerDown) {
    if (window.state.tool3d === 'elevation') {
      raycaster.setFromCamera(pointer, window.state.camera);

      const intersects = raycaster.intersectObjects(window.state.scene.children);

      if (intersects.length) {
        console.log(intersects[0]);

        const centerMatrix = new THREE.Matrix4();
        intersects[0].object.getMatrixAt(intersects[0].instanceId, centerMatrix);

        const centerX = centerMatrix.elements[12];
        const centerZ = centerMatrix.elements[14];

        const matrix = new THREE.Matrix4();

        for (let i = -elevationWidth; i <= elevationWidth; i++) {
          for (let j = -elevationWidth; j <= elevationWidth; j++) {
            if (distance(centerX, centerZ, centerX + i, centerZ + j) < elevationWidth) {
              let instanceId = window.state.instanceXZ[`${centerX + i}:${centerZ + j}`];

              if (instanceId) {
                intersects[0].object.getMatrixAt(instanceId, matrix);

                handleHeightAddition(matrix, elevationHeight);

                intersects[0].object.setMatrixAt(instanceId, matrix);
              }
            }
          }
        }

        intersects[0].object.instanceMatrix.needsUpdate = true;
      }
    } else if (window.state.tool3d === 'color') {
      raycaster.setFromCamera(pointer, window.state.camera);

      const intersects = raycaster.intersectObjects(window.state.scene.children).filter(a => a.faceIndex === 5 || a.faceIndex === 4);
      const threeColor = new THREE.Color();

      for (let i = 0; i < intersects.length; i++) {
        if (i === 0) {
          console.log(intersects[i]);
        }

        intersects[i].object.setColorAt(intersects[i].instanceId, threeColor.setHex(0xff0000));
      }

      if (intersects.length) {
        intersects[0].object.instanceColor.needsUpdate = true;
      }
    }
  }
}

function handleHeightAddition(matrix, elevation) {
  handleHeightSet(matrix, matrix.elements[5] + elevation);
}

function generateHeightmapBasic() {
  const myImageData = biomeContext.getImageData(0, 0, window.state.size, window.state.size);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < window.state.size * window.state.size; i++) {
    window.state.instanceMesh.getMatrixAt(i, matrix);

    const color = rgbToHex(myImageData.data[i * 4], myImageData.data[i * 4 + 1], myImageData.data[i * 4 + 2]);

    if (!biomeColorToName[color]) continue;

    const biomeHeight = biomesConfiguration[biomeColorToName[color]];

    const coeff = ((biomeHeight.min + biomeHeight.max) / 2);

    if (coeff > 0) {
      handleHeightSet(matrix, (coeff * (maxHeight - waterHeight) + waterHeight));
    } else {
      handleHeightSet(matrix, waterHeight + coeff * waterHeight);
    }

    window.state.instanceMesh.setMatrixAt(i, matrix);
  }

  window.state.instanceMesh.instanceMatrix.needsUpdate = true;
}

function generateHeightmapPerlin() {
  const seed = parseInt(document.getElementById("perlin-seed").value);
  const spreadX = parseInt(document.getElementById("perlin-spread-x").value);
  const spready = parseInt(document.getElementById("perlin-spread-y").value);
  const power = parseInt(document.getElementById("perlin-power").value);

  noise.seed(seed);

  const myImageData = biomeContext.getImageData(0, 0, window.state.size, window.state.size);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < window.state.size; i++) {
    for (let j = 0; j < window.state.size; j++) {
      const id = j + i * window.state.size;

      const p = noise.perlin2(i / spreadX, j / spready);

      window.state.instanceMesh.getMatrixAt(id, matrix);

      const color = rgbToHex(myImageData.data[id * 4], myImageData.data[id * 4 + 1], myImageData.data[id * 4 + 2]);
      if (!biomeColorToName[color]) continue;

      const biomeHeight = getRealMinMax(biomesConfiguration[biomeColorToName[color]]);

      let newElevation = matrix.elements[5] + Math.floor(p * power);

      if (newElevation < biomeHeight.min) {
        newElevation = biomeHeight.min;
      }

      if (newElevation > biomeHeight.max) {
        newElevation = biomeHeight.max;
      }

      handleHeightSet(matrix, newElevation);

      window.state.instanceMesh.setMatrixAt(id, matrix);
    }
  }

  window.state.instanceMesh.instanceMatrix.needsUpdate = true;
}

function togglePrintWater() {
  if (window.state.printWaterChanges) {

  } else {
    const waterPower = parseInt(document.getElementById('water-power').value) / 10;
    const myImageData = waterContext.getImageData(0, 0, window.state.size, window.state.size);
    const matrix = new THREE.Matrix4();
    const depthArray = getAllWaterDepth(myImageData);

    for (let i = 0; i < window.state.size * window.state.size; i++) {
      window.state.instanceMesh.getMatrixAt(i, matrix);

      if (depthArray[i] > 0 && matrix.elements[5] > waterHeight - 5) {
        const value = matrix.elements[5] - (Math.ceil(depthArray[i] * waterPower));
        handleHeightSet(matrix, value);
        window.state.instanceMesh.setMatrixAt(i, matrix);
      }
    }

    window.state.instanceMesh.instanceMatrix.needsUpdate = true;
  }
}

function simpleMinimumDistanceToLand(myImageData, i) {
  const pathes = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ];

  const distances = [];

  for (const path of pathes) {
    let distance = 0;
    let currentId = i;

    do {
      distance++;
      currentId = i - path
      let color = rgbToHex(myImageData.data[i * 4], myImageData.data[i * 4 + 1], myImageData.data[i * 4 + 2]);
    }
    while (color);

    distances.push(distance);
  }

  return distances.reduce((acc, cur) => acc < cur ? acc : cur, window.state.size);
}

function getAllWaterDepth(myImageData) {
  const waterDepth = [];
  const waterNeighbours = new Set();

  for (let i = 0; i < window.state.size * window.state.size; i++) {
    if (myImageData.data[i * 4 + 3] === 0) {
      waterDepth.push(0);
    } else {
      waterDepth.push(window.state.size);

      if (getNeighboursAtDistance(i, 1).map(n => myImageData.data[n * 4 + 3]).some(n => n === 0)) {
        waterNeighbours.add(i);
      }
    }
  }

  const iterator = waterNeighbours.values();
  let iteratorValue = iterator.next();

  while (!iteratorValue.done) {
    const currentId = iteratorValue.value;

    const neighbours = getNeighboursAtDistance(currentId, 1, false);

    waterDepth[currentId] = Math.min(...(neighbours.map(n => waterDepth[n]))) + 1;

    for (const neighbourId of neighbours) {
      if (waterDepth[neighbourId] === window.state.size) {
        waterNeighbours.add(neighbourId)
      }
    }

    iteratorValue = iterator.next();
  }

  return waterDepth;
}

function elevationToGrey(elevation) {
  return (elevation + 1) / 2 * 255;
}

function greyToElevation(grey) {
  return grey / 255 * 2 - 1;
}

function elevationToHeight(elevation) {
  return elevation >= 0 ? elevation * (maxHeight - waterHeight) + waterHeight : waterHeight + elevation * waterHeight;
}

function heightToElevation(height) {
  return height >= waterHeight ? (height - waterHeight) / (maxHeight - waterHeight) : - (waterHeight - height) / waterHeight;
}

function getRealMinMax(height) {
  return {
    min: elevationToHeight(height.min),
    max: elevationToHeight(height.max),
  }
}

function getNeighboursAtDistance(id, width, includeCenter = true) {
  const neighbours = [];

  for (let x = -width; x <= width; x++) {
    for (let y = -width * window.state.size; y <= width * window.state.size; y += window.state.size) {
      let localId = id + x + y;

      if (!includeCenter && x === 0 && y === 0) {
        continue;
      }

      if (localId < 0) {
        localId += window.state.size * window.state.size;
      }

      if (localId >= window.state.size * window.state.size) {
        localId -= window.state.size * window.state.size
      }

      if (localId % window.state.size > id % window.state.size && x < 0) {
        localId += window.state.size;
      }

      if (localId % window.state.size < id % window.state.size && x > 0) {
        localId -= window.state.size;
      }

      if (localId < 0) {
        localId += window.state.size * window.state.size;
      }

      if (localId >= window.state.size * window.state.size) {
        localId -= window.state.size * window.state.size
      }

      neighbours.push(localId);
    }
  }

  return neighbours;
}

function smoothHeightMap() {
  let loop = parseInt(document.getElementById('smooth-loop').value);

  if (loop <= 0) {
    loop = 1;
  }

  let width = parseInt(document.getElementById('smooth-width').value);

  if (width <= 0) {
    width = 1;
  }

  const myImageData = biomeContext.getImageData(0, 0, window.state.size, window.state.size);
  const neighbours = [];

  for (let k = 0; k < Math.pow(1 + width * 2, 2); k++) {
    neighbours.push(new THREE.Matrix4());
  }

  const matrix = new THREE.Matrix4();
  for (let k = 0; k < loop; k++) {
    const newHeight = [];

    for (let i = 0; i < window.state.size * window.state.size; i++) {
      const neighboursId = getNeighboursAtDistance(i, width);

      for (let j = 0; j < neighboursId.length; j++) {
        window.state.instanceMesh.getMatrixAt(neighboursId[j], neighbours[j]);
      }

      const averageHeight = neighbours.map(m => m.elements[5]).reduce((acc, cur) => acc + cur) / neighbours.length;

      newHeight.push(averageHeight);
    }

    for (let i = 0; i < window.state.size * window.state.size; i++) {
      window.state.instanceMesh.getMatrixAt(i, matrix);

      const color = rgbToHex(myImageData.data[i * 4], myImageData.data[i * 4 + 1], myImageData.data[i * 4 + 2]);
      if (!biomeColorToName[color]) continue;

      const biomeHeight = getRealMinMax(biomesConfiguration[biomeColorToName[color]]);

      let newElevation = newHeight[i];

      if (newElevation < biomeHeight.min) {
        newElevation = biomeHeight.min;
      }

      if (newElevation > biomeHeight.max) {
        newElevation = biomeHeight.max;
      }

      handleHeightSet(matrix, newElevation);

      window.state.instanceMesh.setMatrixAt(i, matrix);
    }
  }

  window.state.instanceMesh.instanceMatrix.needsUpdate = true;
}

function onPointerMove(event) {
  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components
  const box = container3d.getBoundingClientRect();

  pointer.x = ((event.clientX - box.left) / window.state.size) * 2 - 1;
  pointer.y = -((event.clientY - box.top) / window.state.size) * 2 + 1;
}

function refresh3dContent(colorWater = true, useWaterHeight = true) {
  const biomesData = biomeContext.getImageData(0, 0, window.state.size, window.state.size);
  const waterData = waterContext.getImageData(0, 0, window.state.size, window.state.size);
  const heightData = heightContext.getImageData(0, 0, window.state.size, window.state.size);
  const waterlevelData = waterlevelContext.getImageData(0, 0, window.state.size, window.state.size);

  const matrix = new THREE.Matrix4();
  const threeColor = new THREE.Color();

  for (let i = 0; i < window.state.size * window.state.size; i++) {
    window.state.instanceMesh.getMatrixAt(i, matrix);

    let greyValue = heightData.data[i * 4];
    const waterlevelValue = waterlevelData.data[i * 4];

    if (waterlevelValue > 0 && useWaterHeight) {
      greyValue = waterlevelValue;
    }

    handleHeightSet(matrix, elevationToHeight(greyToElevation(greyValue));

    window.state.instanceMesh.setMatrixAt(i, matrix);

    let color = rgbToHex(biomesData.data[i * 4], biomesData.data[i * 4 + 1], biomesData.data[i * 4 + 2]);
    const waterColor = rgbToHex(waterData.data[i * 4], waterData.data[i * 4 + 1], waterData.data[i * 4 + 2]);

    if (waterColor !== '#000000' && colorWater) {
      color = waterColor;
    }

    let randomTaint = Math.random() - 0.5;
    if (randomTaint < -0.2 || randomTaint > 0.2) randomTaint = 0;
    color = pSBc(randomTaint / 2, color);

    const colorHex = Number('0x' + color.substring(1, color.length));

    window.state.instanceMesh.setColorAt(i, threeColor.setHex(colorHex));
  }

  window.state.instanceMesh.instanceMatrix.needsUpdate = true;
  window.state.instanceMesh.instanceColor.needsUpdate = true;
}

function changeElevationWidth() {
  elevationWidth = parseInt(document.getElementById("elevationWidth").value);
  console.log("elevation width is now", elevationWidth);
}

function changeElevationHeight() {
  elevationHeight = parseInt(document.getElementById("elevationHeight").value);
  console.log("elevation height is now", elevationHeight);
}

function toolMove() {
  window.state.tool3d = 'move';
  document.getElementById('elevationWidth').style.display = 'none';
  document.getElementById('elevationHeight').style.display = 'none';
  window.state.controls.enabled = true;

  console.log('3d tool is now', window.state.tool3d)
}

function toolElevation() {
  window.state.tool3d = 'elevation';
  document.getElementById('elevationWidth').style.display = 'block';
  document.getElementById('elevationHeight').style.display = 'block';
  window.state.controls.enabled = false;

  console.log('3d tool is now', window.state.tool3d)
}

function toolColor() {
  window.state.tool3d = 'color';
  document.getElementById('elevationWidth').style.display = 'none';
  document.getElementById('elevationHeight').style.display = 'none';
  window.state.controls.enabled = false;

  console.log('3d tool is now', tool3d)
}

function forceCoastHeight() {
  const myImageData = biomeContext.getImageData(0, 0, window.state.size, window.state.size);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < window.state.size * window.state.size; i++) {
    window.state.instanceMesh.getMatrixAt(i, matrix);

    const color = rgbToHex(myImageData.data[i * 4], myImageData.data[i * 4 + 1], myImageData.data[i * 4 + 2]);

    if (biomeColorToName[color] !== 'Coast') continue;

    handleHeightSet(matrix, waterHeight);

    window.state.instanceMesh.setMatrixAt(i, matrix);
  }

  window.state.instanceMesh.instanceMatrix.needsUpdate = true;
}

function togglePlaneWater() {
  if (window.state.planeWater) {
    window.state.scene.remove(window.state.planeWater);
    window.state.planeWater = null;
  } else {
    const geoWater = new THREE.PlaneGeometry(window.state.size, window.state.size);
    const matWater = new THREE.MeshBasicMaterial({
      color: 0x4682b4,
      side: THREE.DoubleSide,
      opacity: 0.8,
      transparent: true
    });
    const planeWater = new THREE.Mesh(geoWater, matWater);
    planeWater.position.x = window.state.size / 2;
    planeWater.position.y = waterHeight;
    planeWater.position.z = window.state.size / 2;
    planeWater.rotateX(-Math.PI / 2);

    window.state.scene.add(planeWater);

    window.state.planeWater = planeWater;
  }
}

function apply3dElevationToCanvas() {
  const waterPower = parseInt(document.getElementById('water-power').value) / 10;

  const heightData = heightContext.getImageData(0, 0, window.state.size, window.state.size);
  const waterlevelData = waterlevelContext.getImageData(0, 0, window.state.size, window.state.size);

  const waterData = waterContext.getImageData(0, 0, window.state.size, window.state.size);
  const depthArray = getAllWaterDepth(waterData);

  const matrix = new THREE.Matrix4();

  for (let i = 0; i < window.state.size * window.state.size; i++) {
    window.state.instanceMesh.getMatrixAt(i, matrix);

    const greyValue = elevationToGrey(heightToElevation(matrix.elements[5]));

    if (depthArray[i] > 0) {
      waterlevelData.data[i * 4]     = greyValue;
      waterlevelData.data[i * 4 + 1] = greyValue;
      waterlevelData.data[i * 4 + 2] = greyValue;
      waterlevelData.data[i * 4 + 3] = 255;

      const greyHeightValue = elevationToGrey(heightToElevation(matrix.elements[5] - (Math.ceil(depthArray[i] * waterPower))));

      heightData.data[i * 4]     = greyHeightValue;
      heightData.data[i * 4 + 1] = greyHeightValue;
      heightData.data[i * 4 + 2] = greyHeightValue;
      heightData.data[i * 4 + 3] = 255;

    } else {
      waterlevelData.data[i * 4]     = 0;
      waterlevelData.data[i * 4 + 1] = 0;
      waterlevelData.data[i * 4 + 2] = 0;
      waterlevelData.data[i * 4 + 3] = 0;

      heightData.data[i * 4]     = greyValue;
      heightData.data[i * 4 + 1] = greyValue;
      heightData.data[i * 4 + 2] = greyValue;
      heightData.data[i * 4 + 3] = 255;
    }
  }

  waterlevelContext.putImageData(waterlevelData, 0, 0);
  heightContext.putImageData(heightData, 0, 0);
}