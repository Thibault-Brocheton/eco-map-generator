const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function heightMapTo3d() {
  if (!instanceMesh) {
    alert('Initialize 3D View first');
    return;
  }

  const myImageData = ctxHidden.getImageData(0, 0, size, size);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < size * size; i++) {
    instanceMesh.getMatrixAt(i, matrix);
    const greyValue = myImageData.data[i * 4];

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
    stats.domElement.style.bottom = '0';

    return stats;
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);
  scene.add(new THREE.HemisphereLight(0xffffcc, 0x19bbdc, 1));

  camera = new THREE.PerspectiveCamera( 90, 1, 0.1, 10000 );
  //camera = new THREE.OrthographicCamera();

  renderer = new THREE.WebGLRenderer({ antialias : false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize( window.state.size, window.state.size );

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

  container3d.appendChild( renderer.domElement );
  container3d.appendChild( stats.domElement );
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

function handleHeightAddition(matrix, elevation) {
  handleHeightSet(matrix, matrix.elements[5] + elevation);
}

function generateHeightmapBasic() {
  const myImageData = biomeContext.getImageData(0, 0, window.state.size, window.state.size);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < window.state.size * window.state.size; i++) {
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

  const myImageData = biomeContext.getImageData(0, 0, window.state.size, window.state.size);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < window.state.size; i++) {
    for (let j = 0; j < window.state.size; j++) {
      const id = j + i * window.state.size;

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
  const myImageData = ctxW.getImageData(0, 0, window.state.size, window.state.size);
  const matrix = new THREE.Matrix4();
  const depthArray = getAllWaterDepth(myImageData);

  for (let i = 0; i < window.state.size * window.state.size; i++) {
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
    for (let y = - width * window.state.size; y <= width * window.state.size; y += window.state.size) {
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
        instanceMesh.getMatrixAt(neighboursId[j], neighbours[j]);
      }

      const averageHeight = neighbours.map(m => m.elements[5]).reduce((acc, cur) => acc + cur) / neighbours.length;

      newHeight.push(averageHeight);
    }

    for (let i = 0; i < window.state.size * window.state.size; i++) {
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

function onPointerMove(event) {
  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components
  const box = container3d.getBoundingClientRect();

  pointer.x = ((event.clientX - box.left) / window.state.size) * 2 - 1;
  pointer.y = -((event.clientY - box.top) / window.state.size) * 2 + 1;
}

function refresh3dContent() {
  if (instanceMesh) {
    scene.remove(instanceMesh);
  }

  const biomeImageData = biomeContext.getImageData(0, 0, window.state.size, window.state.size);
  const biomeWaterData = waterContext.getImageData(0, 0, window.state.size, window.state.size);

  const workArray = [];
  let x = 0;

  for (let i = 0; i < biomeImageData.data.length / 4; i++) {
    if (i % window.state.size === 0) {
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

  const material = new THREE.MeshBasicMaterial();
  const matrix = new THREE.Matrix4();
  const threeColor = new THREE.Color();

  const geometryBox = new THREE.BoxGeometry( 1, 1, 1 );
  instanceMesh = new THREE.InstancedMesh( geometryBox, material, window.state.size * window.state.size );
  instanceMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
  instanceMesh.castShadow = true;
  instanceMesh.receiveShadow = true;
  scene.add( instanceMesh );

  for (let j = 0; j < window.state.size; j++) {
    for (let i = 0; i < window.state.size; i++) {
      matrix.setPosition(i, 0.5, j);
      instanceMesh.setMatrixAt(i + j * window.state.size, matrix );
      instanceXZ[`${i}:${j}`] = i + j * window.state.size;
      let color = workArray[i][j];
      let randomTaint = Math.random() - 0.5;
      if (randomTaint < -0.2 || randomTaint > 0.2) randomTaint = 0;
      color = pSBc(randomTaint / 2, color);

      const colorHex = Number('0x' + color.substring(1, color.length));

      instanceMesh.setColorAt(i + j * window.state.size, threeColor.setHex(colorHex));
    }
  }

  camera.position.set(window.state.size/2, 200, window.state.size);
  controls.target = new THREE.Vector3(window.state.size / 2, 100, window.state.size / 2);
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
  const myImageData = biomeContext.getImageData(0, 0, window.state.size, window.state.size);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < window.state.size * window.state.size; i++) {
    instanceMesh.getMatrixAt(i, matrix);

    const color = rgbToHex(myImageData.data[i * 4], myImageData.data[i * 4 + 1], myImageData.data[i * 4 + 2]);

    if (biomeColorToName[color] !== 'Coast') continue;

    handleHeightSet(matrix, waterHeight);

    instanceMesh.setMatrixAt(i, matrix);
  }

  instanceMesh.instanceMatrix.needsUpdate = true;
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