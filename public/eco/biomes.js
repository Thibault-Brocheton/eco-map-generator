function switchColor(newColor) {
  color = newColor;
  console.log("color is now", color);
}

function changeBrushWidth() {
  width = parseInt(document.getElementById("brushWidth").value);
  console.log("pen width is now", width);
}

function toolPen() {
  tool = 'pen';
  document.getElementById('brushWidth').style.display = 'block';
  console.log('tool is now', tool)
}

function toolFill() {
  tool = 'fill';
  document.getElementById('brushWidth').style.display = 'none';
  console.log('tool is now', tool)
}

function drawWithTool(res, e) {
  if (res === 'up' || res === 'out') {
    isDrawing = false;
  }

  if (tool === 'pen') {
    if (res === 'down') {
      isDrawing = true;

      res = 'move';
    }

    if (res === 'move' && isDrawing) {
      var box = activeCanvas.getBoundingClientRect();

      var x = e.clientX - box.left;
      var y = e.clientY - box.top;

      drawAliasedCircle(x, y);
    }
  } else if (tool === 'fill') {
    if (res === 'down') {
      const myImageData = activeContext.getImageData(0, 0, size, size);

      var box = activeCanvas.getBoundingClientRect();

      var coordX = e.clientX - box.left;
      var coordY = e.clientY - box.top;

      console.log("click coords is ", coordX, ":", coordY);

      const workArray = [];
      let x = 0;

      for (let i = 0; i < myImageData.data.length / 4; i++) {
        if (i % size === 0) {
          x = 0;
        }

        if (!workArray[x]) {
          workArray[x] = [];
        }

        workArray[x].push(rgbToHex(myImageData.data[i*4], myImageData.data[i*4 + 1], myImageData.data[i*4 + 2]));

        x++;
      }

      const toBeVisited = new Set();
      toBeVisited.add(`${coordX}:${coordY}`);
      const firstColor = workArray[coordX][coordY];
      const colorRgb = hexToRgb(color);

      const iterator = toBeVisited.values();
      let iteratorValue = iterator.next();

      while (!iteratorValue.done) {
        let [x, y] = iteratorValue.value.split(':');

        x = parseInt(x);
        y = parseInt(y);

        if (workArray[x][y] === firstColor) {
          workArray[x][y] = colorRgb;

          myImageData.data[(x + y * size) * 4] = colorRgb.r;
          myImageData.data[(x + y * size) * 4 + 1] = colorRgb.g;
          myImageData.data[(x + y * size) * 4 + 2] = colorRgb.b;

          handleNeighbor(x    , y + 1, toBeVisited, workArray, firstColor);
          handleNeighbor(x + 1, y,     toBeVisited, workArray, firstColor);
          handleNeighbor(x - 1, y,     toBeVisited, workArray, firstColor);
          handleNeighbor(x    , y - 1, toBeVisited, workArray, firstColor);
        }

        iteratorValue = iterator.next();
      }

      activeContext.putImageData(myImageData, 0, 0);
    }
  }
}

function drawAliasedCircle(xc, yc) {
  activeContext.beginPath();

  var x = width, y = 0, cd = 0;

  // middle line
  activeContext.rect(xc - x, yc, width<<1, 1);

  while (x > y) {
    cd -= (--x) - (++y);
    if (cd < 0) cd += x++;
    activeContext.rect(xc - y, yc - x, y<<1, 1);
    activeContext.rect(xc - x, yc - y, x<<1, 1);
    activeContext.rect(xc - x, yc + y, x<<1, 1);
    activeContext.rect(xc - y, yc + x, y<<1, 1);
  }

  if (activeContext === ctxW && color === '#000000') {
    console.log('erase');
    activeContext.globalCompositeOperation = 'destination-out';
    activeContext.fillStyle = '#000000';
    activeContext.strokeStyle = '#000000';
  } else {
    activeContext.globalCompositeOperation = 'source-over';
    activeContext.fillStyle = color;
    activeContext.strokeStyle = color;
  }
  activeContext.fill();
  activeContext.closePath();
}

function handleNeighbor(posX, posY, toBeVisited, workArray, firstColor) {
  if (posY >= size || posY < 0 || posX >= size || posX < 0) {
    return;
  }

  const coords = `${posX}:${posY}`;

  if (workArray[posX][posY] === firstColor) {
    toBeVisited.add(coords);
  }
}