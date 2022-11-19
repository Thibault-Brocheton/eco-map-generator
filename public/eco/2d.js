function switchColor(newColor) {
  window.state.color = newColor;
  console.log("color is now", window.state.color);
}

function changeBrushWidth() {
  window.state.brushWidth = parseInt(document.getElementById("brushWidth").value);
  console.log("pen width is now", window.state.brushWidth);
}

function changeEraserWidth() {
  window.state.eraserWidth = parseInt(document.getElementById("eraserWidth").value);
  console.log("eraser width is now", window.state.eraserWidth);
}

function changeBlur() {
  window.state.blurPower = parseInt(document.getElementById("blurPower").value);
  console.log("eraser width is now", window.state.blurPower);
}

function toolPen() {
  window.state.tool2d = 'pen';
  console.log('tool is now', window.state.tool2d)
}

function toolEraser() {
  window.state.tool2d = 'eraser';
  console.log('tool is now', window.state.tool2d)
}

function toolFill() {
  window.state.tool2d = 'fill';
  console.log('tool is now', window.state.tool2d)
}

function drawWithTool(res, e) {
  if (res === 'up' || res === 'out') {
    window.state.isPointerDown = false;
  }

  if (window.state.tool2d === 'pen') {
    if (res === 'down') {
      window.state.isPointerDown = true;

      res = 'move';
    }

    if (res === 'move' && window.state.isPointerDown) {
      let box = window.state.activeCanvas.getBoundingClientRect();

      let x = e.clientX - Math.floor(box.left);
      let y = e.clientY - Math.floor(box.top);

      drawAliasedCircle(x, y, window.state.brushWidth);
    }
  } else if (window.state.tool2d === 'eraser') {
    if (res === 'down') {
      window.state.isPointerDown = true;

      res = 'move';
    }

    if (res === 'move' && window.state.isPointerDown) {
      let box = window.state.activeCanvas.getBoundingClientRect();

      let x = e.clientX - Math.floor(box.left);
      let y = e.clientY - Math.floor(box.top);

      drawAliasedCircle(x, y, window.state.eraserWidth, true);
    }
  } else if (window.state.tool2d === 'fill') {
    if (res === 'down') {
      const myImageData = window.state.activeContext.getImageData(0, 0, window.state.size, window.state.size);

      let box = window.state.activeCanvas.getBoundingClientRect();

      let coordX = e.clientX - Math.floor(box.left);
      let coordY = e.clientY - Math.floor(box.top);

      console.log("click coords is ", coordX, ":", coordY);

      const workArray = [];
      let x = 0;

      for (let i = 0; i < myImageData.data.length / 4; i++) {
        if (i % window.state.size === 0) {
          x = 0;
        }

        if (!workArray[x]) {
          workArray[x] = [];
        }

        workArray[x].push(rgbToHex(myImageData.data[i * 4], myImageData.data[i * 4 + 1], myImageData.data[i * 4 + 2]));

        x++;
      }

      const toBeVisited = new Set();
      toBeVisited.add(`${coordX}:${coordY}`);
      const firstColor = workArray[coordX][coordY];
      const colorRgb = hexToRgb(window.state.color);

      const iterator = toBeVisited.values();
      let iteratorValue = iterator.next();

      while (!iteratorValue.done) {
        let [x, y] = iteratorValue.value.split(':');

        x = parseInt(x);
        y = parseInt(y);

        if (workArray[x][y] === firstColor) {
          workArray[x][y] = colorRgb;

          myImageData.data[(x + y * window.state.size) * 4] = colorRgb.r;
          myImageData.data[(x + y * window.state.size) * 4 + 1] = colorRgb.g;
          myImageData.data[(x + y * window.state.size) * 4 + 2] = colorRgb.b;

          handleNeighbor(x    , y + 1, toBeVisited, workArray, firstColor);
          handleNeighbor(x + 1, y,     toBeVisited, workArray, firstColor);
          handleNeighbor(x - 1, y,     toBeVisited, workArray, firstColor);
          handleNeighbor(x    , y - 1, toBeVisited, workArray, firstColor);
        }

        iteratorValue = iterator.next();
      }

      window.state.activeContext.putImageData(myImageData, 0, 0);
    }
  }
}

function drawAliasedCircle(xc, yc, width, erase = false) {
  window.state.activeContext.beginPath();

  let x = width;
  let y = 0;
  let cd = 0;

  // middle line
  window.state.activeContext.rect(xc - x, yc, width<<1, 1);

  while (x > y) {
    cd -= (--x) - (++y);
    if (cd < 0) cd += x++;
    window.state.activeContext.rect(xc - y, yc - x, y<<1, 1);
    window.state.activeContext.rect(xc - x, yc - y, x<<1, 1);
    window.state.activeContext.rect(xc - x, yc + y, x<<1, 1);
    window.state.activeContext.rect(xc - y, yc + x, y<<1, 1);
  }

  if (erase) {
    window.state.activeContext.globalCompositeOperation = 'destination-out';
    window.state.activeContext.fillStyle = '#000000';
    window.state.activeContext.strokeStyle = '#000000';
  } else {
    window.state.activeContext.globalCompositeOperation = 'source-over';
    window.state.activeContext.fillStyle = window.state.color;
    window.state.activeContext.strokeStyle = window.state.color;
  }
  window.state.activeContext.fill();
  window.state.activeContext.closePath();
}

function handleNeighbor(posX, posY, toBeVisited, workArray, firstColor) {
  if (posY >= window.state.size || posY < 0 || posX >= window.state.size || posX < 0) {
    return;
  }

  const coords = `${posX}:${posY}`;

  if (workArray[posX][posY] === firstColor) {
    toBeVisited.add(coords);
  }
}

function generateLayer() {
  const biomesData = biomeContext.getImageData(0, 0, window.state.size, window.state.size);
  const activeData = window.state.activeContext.getImageData(0, 0, window.state.size, window.state.size);

  noise.seed(Math.floor(Math.random() * 65536));

  for (let i = 0; i < window.state.size * window.state.size; i++) {
    const color = rgbToHex(biomesData.data[i * 4], biomesData.data[i * 4 + 1], biomesData.data[i * 4 + 2]);

    if (!biomeColorToName[color]) continue;

    const biomesConfig = biomesConfiguration[biomeColorToName[color]];
    const biomesRange = window.state.activeLayer === 'temperature' ? { min: biomesConfig.minTemp, max: biomesConfig.maxTemp } : { min: biomesConfig.minMoisture, max: biomesConfig.maxMoisture };

    const random = Math.abs(noise.simplex2((i % window.state.size) / window.state.blurPower, Math.floor(i / window.state.size) / window.state.blurPower));

    const coeff = biomesRange.min + (random * (biomesRange.max - biomesRange.min));

    activeData.data[i * 4] = coeff * 255;
    activeData.data[i * 4 + 1] = coeff * 255;
    activeData.data[i * 4 + 2] = coeff * 255;
    activeData.data[i * 4 + 3] = 255;
  }

  window.state.activeContext.putImageData(activeData, 0, 0);
}

function blur(imageObj, context, passes) {
  var i, x, y;
  passes = passes || 4;
  context.globalAlpha = 1 / passes;
  // Loop for each blur pass.
  for (i = 1; i <= passes; i++) {
    for (y = -1; y < 2; y++) {
      for (x = -1; x < 2; x++) {
        context.drawImage(imageObj, x, y);
      }
    }
  }
  context.globalAlpha = 1.0;
}
