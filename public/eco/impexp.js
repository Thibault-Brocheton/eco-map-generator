function exportBiome() {
  var link = document.createElement('a');
  link.download = 'Biomes-import.png';
  link.href = canvasB.toDataURL();
  link.click();
  link.remove();
}

function exportWater() {
  var link = document.createElement('a');
  link.download = 'Water-import.png';
  link.href = canvasW.toDataURL();
  link.click();
  link.remove();
}

function exportWaterLevel() {
  var link = document.createElement('a');
  link.download = 'WaterLevel-import.png';

  const myImageData = ctxHidden.getImageData(0, 0, size, size);
  const waterData = ctxW.getImageData(0, 0, size, size);

  const a = logEvery(200);

  for (let i = 0; i < size * size; i++) {
    myImageData.data[i * 4]     = waterData.data[i * 4] > 0 ? 134 : 0;
    myImageData.data[i * 4 + 1] = waterData.data[i * 4 + 1] > 0 ? 134 : 0;
    myImageData.data[i * 4 + 2] = waterData.data[i * 4 + 2] > 0 ? 134 : 0;
    myImageData.data[i * 4 + 3] = waterData.data[i * 4 + 3] > 0 ? 255 : 0;
  }

  ctxHidden.putImageData(myImageData, 0, 0);

  link.href = canvasHidden.toDataURL();
  link.click();
  link.remove();
}

function exportHeight() {
  var link = document.createElement('a');
  link.download = 'Height-import.png';

  const myImageData = ctxHidden.getImageData(0, 0, size, size);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < size * size; i++) {
    instanceMesh.getMatrixAt(i, matrix);
    const yValue = matrix.elements[5];

    let normalizedY;
    if (yValue > waterHeight) {
      normalizedY = (((yValue - waterHeight) / maxHeight * 0.5) + 0.5) * 255;
    } else {
      normalizedY = ((((waterHeight - yValue) / -waterHeight) * 0.5) + 0.5) * 255;
    }

    myImageData.data[i * 4]     = normalizedY;
    myImageData.data[i * 4 + 1] = normalizedY;
    myImageData.data[i * 4 + 2] = normalizedY;
    myImageData.data[i * 4 + 3] = 255;
  }

  ctxHidden.putImageData(myImageData, 0, 0);

  link.href = canvasHidden.toDataURL();
  link.click();
  link.remove();
}

function exportTemperature() {
  var link = document.createElement('a');
  link.download = 'Temperature-import.png';

  const myImageData = ctxHidden.getImageData(0, 0, size, size);

  const biomeImage = ctxB.getImageData(0, 0, size, size);

  for (let i = 0; i < size * size; i++) {
    const color = rgbToHex(biomeImage.data[i * 4], biomeImage.data[i * 4 + 1], biomeImage.data[i * 4 + 2]);

    if (!biomeColorToName[color]) continue;
    const biomeConfig = biomesConfiguration[biomeColorToName[color]];

    const avg = (biomeConfig.minTemp + biomeConfig.maxTemp) / 2
    const yValue = noise.perlin2(i % size / 200, Math.floor(i / size) / 200);

    myImageData.data[i * 4]     = (Math.max(Math.min(avg + yValue, biomeConfig.maxTemp), biomeConfig.minTemp)) * 255;
    myImageData.data[i * 4 + 1] = (Math.max(Math.min(avg + yValue, biomeConfig.maxTemp), biomeConfig.minTemp)) * 255;
    myImageData.data[i * 4 + 2] = (Math.max(Math.min(avg + yValue, biomeConfig.maxTemp), biomeConfig.minTemp)) * 255;
    myImageData.data[i * 4 + 3] = 255;
  }

  ctxHidden.putImageData(myImageData, 0, 0);

  link.href = canvasHidden.toDataURL();
  link.click();
  link.remove();
}

function exportMoisture() {
  var link = document.createElement('a');
  link.download = 'Moisture-import.png';

  const myImageData = ctxHidden.getImageData(0, 0, size, size);

  const biomeImage = ctxB.getImageData(0, 0, size, size);

  for (let i = 0; i < size * size; i++) {
    const color = rgbToHex(biomeImage.data[i * 4], biomeImage.data[i * 4 + 1], biomeImage.data[i * 4 + 2]);

    if (!biomeColorToName[color]) continue;
    const biomeConfig = biomesConfiguration[biomeColorToName[color]];

    const avg = (biomeConfig.minMoisture + biomeConfig.maxMoisture) / 2
    const yValue = noise.perlin2(i % size / 50, Math.floor(i / size) / 50) / 3;

    myImageData.data[i * 4]     = (Math.max(Math.min(avg + yValue, biomeConfig.maxMoisture), biomeConfig.minMoisture)) * 255;
    myImageData.data[i * 4 + 1] = (Math.max(Math.min(avg + yValue, biomeConfig.maxMoisture), biomeConfig.minMoisture)) * 255;
    myImageData.data[i * 4 + 2] = (Math.max(Math.min(avg + yValue, biomeConfig.maxMoisture), biomeConfig.minMoisture)) * 255;
    myImageData.data[i * 4 + 3] = 255;
  }

  ctxHidden.putImageData(myImageData, 0, 0);

  link.href = canvasHidden.toDataURL();
  link.click();
  link.remove();
}

function exportAll() {
  exportBiome();
  exportWater();
  exportHeight();
}

function importBiome(e) {
  if(e.target.files) {
    let imageFile = e.target.files[0]; //here we get the image file
    var reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = function (e) {
      var myImage = new Image(); // Creates image object
      myImage.src = e.target.result; // Assigns converted image to image object
      myImage.onload = function(ev) {
        reset();

        canvasB.width = myImage.width; // Assigns image's width to canvas
        canvasB.height = myImage.height; // Assigns image's height to canvas
        ctxB.drawImage(myImage,0,0); // Draws the image on canvas
      }
    }
  }
}

function importWater(e) {
  if(e.target.files) {
    let imageFile = e.target.files[0]; //here we get the image file
    var reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = function (e) {
      var myImage = new Image(); // Creates image object
      myImage.src = e.target.result; // Assigns converted image to image object
      myImage.onload = function(ev) {
        canvasW.width = myImage.width; // Assigns image's width to canvas
        canvasW.height = myImage.height; // Assigns image's height to canvas
        ctxW.drawImage(myImage,0,0); // Draws the image on canvas
      }
    }
  }
}

function importHeight(e) {
  if(e.target.files) {
    let imageFile = e.target.files[0]; //here we get the image file
    var reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = function (e) {
      var myImage = new Image(); // Creates image object
      myImage.src = e.target.result; // Assigns converted image to image object
      myImage.onload = function() {
        canvasHidden.width = myImage.width; // Assigns image's width to canvas
        canvasHidden.height = myImage.height; // Assigns image's height to canvas
        ctxHidden.drawImage(myImage,0,0); // Draws the image on canvas

        heightMapTo3d();
      };
    };
  }
}
