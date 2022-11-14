function exportBiome() {
  var link = document.createElement('a');
  link.download = 'Biomes_import.png';
  link.href = canvasB.toDataURL();
  link.click();
  link.remove();
}

function exportWater() {
  var link = document.createElement('a');
  link.download = 'Water_import.png';
  link.href = canvasW.toDataURL();
  link.click();
  link.remove();
}

function exportHeight() {
  var link = document.createElement('a');
  link.download = 'Heightmap_import.png';

  const myImageData = ctxHidden.getImageData(0, 0, size, size);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < size * size; i++) {
    instanceMesh.getMatrixAt(i, matrix);
    const yValue = matrix.elements[5];

    const normalizedY = yValue / maxHeight * 255;

    myImageData.data[i * 4]     = 255;
    myImageData.data[i * 4 + 1] = 255;
    myImageData.data[i * 4 + 2] = 255;
    myImageData.data[i * 4 + 3] = normalizedY;
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
