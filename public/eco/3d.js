function heightMapTo3d() {
  if (!instanceMesh) {
    alert('Initialize 3D View first');
    return;
  }

  const myImageData = ctxHidden.getImageData(0, 0, size, size);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < size * size; i++) {
    instanceMesh.getMatrixAt(i, matrix);
    const greyValue = myImageData.data[i * 4 + 3];

    handleHeightSet(matrix, greyValue * maxHeight / 255)

    instanceMesh.setMatrixAt(i, matrix);
  }

  instanceMesh.instanceMatrix.needsUpdate = true;
}

function init3dView() {
  function createStats() {
    var stats = new Stats();
    stats.setMode(0);

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0';
    stats.domElement.style.top = '0';

    return stats;
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);
  scene.add(new THREE.HemisphereLight(0xffffcc, 0x19bbdc, 1));

  camera = new THREE.PerspectiveCamera( 90, 1, 0.1, 10000 );
  //camera = new THREE.OrthographicCamera();

  renderer = new THREE.WebGLRenderer({ antialias : false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize( size, size );

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.zoomSpeed = 1;
  controls.panSpeed = 1;

  const updateCameraOrbit = () => {
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
  };

  controls.addEventListener('end', () => {
    updateCameraOrbit();
  });

  stats = createStats();

  updateCameraOrbit();

  function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render( scene, camera );
    stats.update();
  }

  animate();

  mapHeight.appendChild( renderer.domElement );
  mapHeight.appendChild( stats.domElement );
}

function drawWith3dTool(res, e) {
  if (res === 'up' || res === 'out') {
    is3dDrawing = false;
  }

  if (res === 'down') {
    is3dDrawing = true;

    res = 'move';
  }

  if (res === 'move' && is3dDrawing) {
    if (tool3d === 'elevation') {
      raycaster.setFromCamera( pointer, camera );

      const intersects = raycaster.intersectObjects( scene.children );

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
              let instanceId = instanceXZ[`${centerX + i}:${centerZ + j}`];

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
    } else if (tool3d === 'color') {
      raycaster.setFromCamera( pointer, camera );

      const intersects = raycaster.intersectObjects( scene.children ).filter(a => a.faceIndex === 5 || a.faceIndex === 4);
      const threeColor = new THREE.Color();

      for (let i = 0; i < intersects.length; i ++) {
        if (i=== 0) {
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

function handleHeightSet(matrix, height) {
  if (height > maxHeight) {
    matrix.elements[5] = maxHeight;
    matrix.elements[13] = maxHeight / 2;
  } else if (height < 1) {
    matrix.elements[5] = 1;
    matrix.elements[13] = 0.5;
  } else {
    matrix.elements[5] = height;
    matrix.elements[13] = matrix.elements[5] / 2;
  }
}

function handleHeightAddition(matrix, elevation) {
  handleHeightSet(matrix, matrix.elements[5] + elevation);
}

function generateHeightmapBasic() {
  const myImageData = ctxB.getImageData(0, 0, size, size);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < size * size; i++) {
    instanceMesh.getMatrixAt(i, matrix);

    const color = rgbToHex(myImageData.data[i * 4], myImageData.data[i * 4 + 1], myImageData.data[i * 4 + 2]);

    if (!biomeColorToName[color]) continue;

    const biomeHeight = biomesConfiguration[biomeColorToName[color]];

    const coeff = ((biomeHeight.min + biomeHeight.max) / 2);

    if (coeff > 0) {
      handleHeightSet(matrix, (coeff * (maxHeight - waterHeight) + waterHeight));
    } else {
      handleHeightSet(matrix, waterHeight + coeff * waterHeight);
    }

    instanceMesh.setMatrixAt(i, matrix);
  }

  instanceMesh.instanceMatrix.needsUpdate = true;
}

function generateHeightmapPerlin() {
  const seed = parseInt(document.getElementById("perlin-seed").value);
  const spreadX = parseInt(document.getElementById("perlin-spread-x").value);
  const spready = parseInt(document.getElementById("perlin-spread-y").value);
  const power = parseInt(document.getElementById("perlin-power").value);

  noise.seed(seed);

  const myImageData = ctxB.getImageData(0, 0, size, size);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const id = j + i * size;

      const p = noise.perlin2(i / spreadX, j / spready);

      instanceMesh.getMatrixAt(id, matrix);

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

      instanceMesh.setMatrixAt(id, matrix);
    }
  }
  instanceMesh.instanceMatrix.needsUpdate = true;
}

function printWater() {
  const waterPower = parseInt(document.getElementById('water-power').value) / 10;
  const myImageData = ctxW.getImageData(0, 0, size, size);
  const matrix = new THREE.Matrix4();
  const depthArray = getAllWaterDepth(myImageData);

  for (let i = 0; i < size * size; i++) {
    instanceMesh.getMatrixAt(i, matrix);

    if (depthArray[i] > 0 && matrix.elements[5] > waterHeight - 5) {
      const value = matrix.elements[5] - (Math.ceil(depthArray[i] * waterPower));
      handleHeightSet(matrix, value);
      instanceMesh.setMatrixAt(i, matrix);
    }
  }

  instanceMesh.instanceMatrix.needsUpdate = true;
}

function simpleMinimumDistanceToLand(myImageData, i) {
  const pathes = [
    [-1, -1],
    [ 0, -1],
    [ 1, -1],
    [-1,  0],
    [ 1,  0],
    [-1,  1],
    [ 0,  1],
    [ 1,  1],
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
    while(color);

    distances.push(distance);
  }

  return distances.reduce((acc, cur) => acc < cur ? acc : cur, size);
}

function getAllWaterDepth(myImageData) {
  const waterDepth = [];
  const waterNeighbours = new Set();

  for (let i = 0; i < size * size; i++) {
    if (myImageData.data[i * 4 + 3] === 0) {
      waterDepth.push(0);
    } else {
      waterDepth.push(size);

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
      if (waterDepth[neighbourId] === size) {
        waterNeighbours.add(neighbourId)
      }
    }

    iteratorValue = iterator.next();
  }

  return waterDepth;
}

function getRealHeight(height) {
  return height >= 0 ? height * (maxHeight - waterHeight) + waterHeight : waterHeight + height * waterHeight;
}

function getRealMinMax(height) {
  return {
    min: getRealHeight(height.min),
    max: getRealHeight(height.max),
  }
}

function getNeighboursAtDistance(id, width, includeCenter = true) {
  const neighbours = [];

  for (let x = - width; x <= width; x++) {
    for (let y = - width * size; y <= width * size; y += size) {
      let localId = id + x + y;

      if (!includeCenter && x === 0 && y === 0) {
        continue;
      }

      if (localId < 0) {
        localId += size * size;
      }

      if (localId >= size * size) {
        localId -= size * size
      }

      if (localId % size > id % size && x < 0) {
        localId += size;
      }

      if (localId % size < id % size && x > 0) {
        localId -= size;
      }

      if (localId < 0) {
        localId += size * size;
      }

      if (localId >= size * size) {
        localId -= size * size
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

  const myImageData = ctxB.getImageData(0, 0, size, size);
  const neighbours = [];

  for (let k = 0; k < Math.pow(1 + width * 2, 2); k++) {
    neighbours.push(new THREE.Matrix4());
  }

  const matrix = new THREE.Matrix4();
  for (let k = 0; k < loop; k++) {
    const newHeight = [];

    for (let i = 0; i < size * size; i++) {
      const neighboursId = getNeighboursAtDistance(i, width);

      for (let j = 0; j < neighboursId.length; j++) {
        instanceMesh.getMatrixAt(neighboursId[j], neighbours[j]);
      }

      const averageHeight = neighbours.map(m => m.elements[5]).reduce((acc, cur) => acc + cur) / neighbours.length;

      newHeight.push(averageHeight);
    }

    for (let i = 0; i < size * size; i++) {
      instanceMesh.getMatrixAt(i, matrix);

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

      instanceMesh.setMatrixAt(i, matrix);
    }
  }

  instanceMesh.instanceMatrix.needsUpdate = true;
}

function update3dView() {
  renderer.setSize( size, size );
}

function onPointerMove(event) {
  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components
  const box = mapHeight.getBoundingClientRect();

  pointer.x = ((event.clientX - box.left) / size) * 2 - 1;
  pointer.y = -((event.clientY - box.top) / size) * 2 + 1;

}
function refresh3dContent() {
  const axesHelper = new THREE.AxesHelper( 5 );
  axesHelper.setColors('red', 'green', 'blue')
  scene.add( axesHelper );

  if (instanceMesh) {
    scene.remove(instanceMesh);
  }

  const biomeImageData = ctxB.getImageData(0, 0, size, size);
  const biomeWaterData = ctxW.getImageData(0, 0, size, size);

  const workArray = [];
  let x = 0;

  for (let i = 0; i < biomeImageData.data.length / 4; i++) {
    if (i % size === 0) {
      x = 0;
    }

    if (!workArray[x]) {
      workArray[x] = [];
    }

    let color = rgbToHex(biomeImageData.data[i*4], biomeImageData.data[i*4 + 1], biomeImageData.data[i*4 + 2]);
    let waterColor = rgbToHex(biomeWaterData.data[i*4], biomeWaterData.data[i*4 + 1], biomeWaterData.data[i*4 + 2]);

    if (waterColor !== '#000000') {
      color = waterColor;
    }

    workArray[x].push(color);

    x++;
  }

  let localSize = size;

  const material = new THREE.MeshBasicMaterial();
  const matrix = new THREE.Matrix4();
  const threeColor = new THREE.Color();

  const geometryBox = new THREE.BoxGeometry( 1, 1, 1 );
  instanceMesh = new THREE.InstancedMesh( geometryBox, material, localSize * localSize );
  instanceMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
  instanceMesh.castShadow = true;
  instanceMesh.receiveShadow = true;
  scene.add( instanceMesh );

  for (let j = 0; j < localSize; j++) {
    for (let i = 0; i < localSize; i++) {
      matrix.setPosition(i, 0.5, j);
      instanceMesh.setMatrixAt(i + j * localSize, matrix );
      instanceXZ[`${i}:${j}`] = i + j * localSize;
      let color = workArray[i][j];
      let randomTaint = Math.random() - 0.5;
      if (randomTaint < -0.2 || randomTaint > 0.2) randomTaint = 0;
      color = pSBc(randomTaint / 2, color);

      const colorHex = Number('0x' + color.substring(1, color.length));

      instanceMesh.setColorAt(i + j * localSize, threeColor.setHex(colorHex));
    }
  }

  camera.position.set(localSize/2, 200, localSize);
  controls.target = new THREE.Vector3(localSize / 2, 100, localSize / 2);
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
  tool3d = 'move';
  document.getElementById('elevationWidth').style.display = 'none';
  document.getElementById('elevationHeight').style.display = 'none';
  controls.enabled = true;

  console.log('3d tool is now', tool3d)
}
function toolElevation() {
  tool3d = 'elevation';
  document.getElementById('elevationWidth').style.display = 'block';
  document.getElementById('elevationHeight').style.display = 'block';
  controls.enabled = false;

  console.log('3d tool is now', tool3d)
}
function toolColor() {
  tool3d = 'color';
  document.getElementById('elevationWidth').style.display = 'none';
  document.getElementById('elevationHeight').style.display = 'none';
  controls.enabled = false;

  console.log('3d tool is now', tool3d)
}

function forceCoastHeight() {
  const myImageData = ctxB.getImageData(0, 0, size, size);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < size * size; i++) {
    instanceMesh.getMatrixAt(i, matrix);

    const color = rgbToHex(myImageData.data[i * 4], myImageData.data[i * 4 + 1], myImageData.data[i * 4 + 2]);

    if (biomeColorToName[color] !== 'Coast') continue;

    handleHeightSet(matrix, waterHeight);

    instanceMesh.setMatrixAt(i, matrix);
  }

  instanceMesh.instanceMatrix.needsUpdate = true;
}