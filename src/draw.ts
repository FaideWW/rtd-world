export function draw(
  canvasEl: HTMLCanvasElement,
  method: "midpointDisplacement" | "diamondSquare"
) {
  const ctx = canvasEl.getContext("2d");
  const width = canvasEl.clientWidth;
  const height = canvasEl.clientHeight;

  if (!ctx || width === 0 || height === 0) return;

  const tgenStart = performance.now();
  let heights: number[][] = [];
  if (method === "midpointDisplacement") {
    heights = midpointDisplacement2D(width, height, 1000, 0.8);
  } else if (method === "diamondSquare") {
    heights = diamondSquare(width, height, 1000, 0.8);
  }
  normalizeHeightMap(heights, 255);
  const tgenTime = performance.now() - tgenStart;
  console.log(`terrain generation took ${tgenTime}ms`);

  const renderStart = performance.now();

  const buffer = ctx.createImageData(width, height);

  for (let i = 0; i < buffer.data.length; i += 4) {
    const iPixel = Math.floor(i / 4);
    const y = Math.floor(iPixel / height) % heights.length;
    const x = (iPixel % width) % heights[y].length;

    buffer.data[i] = heights[y][x];
    buffer.data[i + 1] = heights[y][x];
    buffer.data[i + 2] = heights[y][x];
    buffer.data[i + 3] = 255;
  }

  ctx.putImageData(buffer, 0, 0);

  const renderTime = performance.now() - renderStart;
  console.log(`frame render took ${renderTime}ms`);
}

function normalizeHeightMap(heightMap: number[][], max: number) {
  let minHeight = Infinity;
  let maxHeight = -Infinity;
  for (let y = 0; y < heightMap.length; y++) {
    for (let x = 0; x < heightMap[y].length; x++) {
      if (heightMap[y][x] < minHeight) minHeight = heightMap[y][x];
      if (heightMap[y][x] > maxHeight) maxHeight = heightMap[y][x];
    }
  }

  const range = maxHeight - minHeight;

  for (let y = 0; y < heightMap.length; y++) {
    for (let x = 0; x < heightMap[y].length; x++) {
      heightMap[y][x] = Math.floor(
        ((heightMap[y][x] - minHeight) / range) * max
      );
    }
  }
}

function midpointDisplacement2D(
  width: number,
  height: number,
  maxRand: number,
  decayFactor: number
): number[][] {
  const heightMap: number[][] = new Array(height);
  for (let y = 0; y < heightMap.length; y++) {
    heightMap[y] = new Array(width).fill(0);
  }

  // put random values in the corners
  // top left
  heightMap[0][0] = Math.random() * maxRand;
  // top right
  heightMap[0][width - 1] = Math.random() * maxRand;
  // bottom left
  heightMap[height - 1][0] = Math.random() * maxRand;
  // bottom right
  heightMap[height - 1][width - 1] = Math.random() * maxRand;

  // [xMin, xMax, yMin, yMax, randomness]
  const queue: Array<[number, number, number, number, number]> = [];
  let queueIndex = 0;

  queue.push([0, width - 1, 0, height - 1, maxRand / 2]);

  while (queueIndex < queue.length) {
    const next = queue[queueIndex++];
    if (!next) continue; // why Typescript, why
    const [xMin, xMax, yMin, yMax, randomness] = next;

    const xMid = Math.floor((xMax + xMin) / 2);
    const yMid = Math.floor((yMax + yMin) / 2);

    const halfRand = randomness / 2;

    // calculate the midpoints of each edge, and add randomness

    // mid-left = midpoint(topleft, bottomleft)
    heightMap[yMid][xMin] =
      (heightMap[yMin][xMin] + heightMap[yMax][xMin]) / 2 +
      (Math.random() * randomness - halfRand);

    // mid-right = midpoint(topright, bottomright)
    heightMap[yMid][xMax] =
      (heightMap[yMin][xMax] + heightMap[yMax][xMax]) / 2 +
      (Math.random() * randomness - halfRand);

    // mid-top = midpoint(topleft, topright)
    heightMap[yMin][xMid] =
      (heightMap[yMin][xMin] + heightMap[yMin][xMax]) / 2 +
      (Math.random() * randomness - halfRand);

    // mid-bottom = midpoint(bottomleft, bottomright)
    heightMap[yMax][xMid] =
      (heightMap[yMax][xMin] + heightMap[yMax][xMax]) / 2 +
      (Math.random() * randomness - halfRand);

    // center = avg(midleft, midright, midtop, midbottom)
    const center =
      (heightMap[yMid][xMin] +
        heightMap[yMid][xMax] +
        heightMap[yMin][xMid] +
        heightMap[yMax][xMid]) /
        4 +
      (Math.random() * randomness - halfRand);

    heightMap[yMid][xMid] = center;

    // Recurse if we can find another midpoint
    if (xMax - xMin > 2) {
      queue.push([xMin, xMid, yMin, yMid, randomness * decayFactor]);
      queue.push([xMid, xMax, yMin, yMid, randomness * decayFactor]);
      queue.push([xMin, xMid, yMid, yMax, randomness * decayFactor]);
      queue.push([xMid, xMax, yMid, yMax, randomness * decayFactor]);
    }
  }
  return heightMap;
}

function diamondSquare(
  width: number,
  height: number,
  maxRand: number,
  decayFactor: number
): number[][] {
  const heightMap: number[][] = new Array(height);
  for (let y = 0; y < heightMap.length; y++) {
    heightMap[y] = new Array(width).fill(0);
  }

  // put random values in the corners
  // top left
  heightMap[0][0] = Math.random() * maxRand;
  // top right
  heightMap[0][width - 1] = Math.random() * maxRand;
  // bottom left
  heightMap[height - 1][0] = Math.random() * maxRand;
  // bottom right
  heightMap[height - 1][width - 1] = Math.random() * maxRand;

  // [xMin, xMax, yMin, yMax, randomness]
  const queue: Array<[number, number, number, number, number]> = [];
  let queueIndex = 0;

  queue.push([0, width - 1, 0, height - 1, maxRand / 2]);

  while (queueIndex < queue.length) {
    const next = queue[queueIndex++];
    if (!next) continue; // why Typescript, why
    const [xMin, xMax, yMin, yMax, randomness] = next;

    const xMid = Math.floor((xMax + xMin) / 2);
    const yMid = Math.floor((yMax + yMin) / 2);

    const halfRand = randomness / 2;

    // calculate the midpoints of each edge, and add randomness

    // mid-left = midpoint(topleft, bottomleft)
    heightMap[yMid][xMin] =
      (heightMap[yMin][xMin] + heightMap[yMax][xMin]) / 2 +
      (Math.random() * randomness - halfRand);

    // mid-right = midpoint(topright, bottomright)
    heightMap[yMid][xMax] =
      (heightMap[yMin][xMax] + heightMap[yMax][xMax]) / 2 +
      (Math.random() * randomness - halfRand);

    // mid-top = midpoint(topleft, topright)
    heightMap[yMin][xMid] =
      (heightMap[yMin][xMin] + heightMap[yMin][xMax]) / 2 +
      (Math.random() * randomness - halfRand);

    // mid-bottom = midpoint(bottomleft, bottomright)
    heightMap[yMax][xMid] =
      (heightMap[yMax][xMin] + heightMap[yMax][xMax]) / 2 +
      (Math.random() * randomness - halfRand);

    // center = avg(midleft, midright, midtop, midbottom)
    const center =
      (heightMap[yMid][xMin] +
        heightMap[yMid][xMax] +
        heightMap[yMin][xMid] +
        heightMap[yMax][xMid]) /
        4 +
      (Math.random() * randomness - halfRand);

    heightMap[yMid][xMid] = center;

    // Recurse if we can find another midpoint
    if (xMax - xMin > 2) {
      queue.push([xMin, xMid, yMin, yMid, randomness * decayFactor]);
      queue.push([xMid, xMax, yMin, yMid, randomness * decayFactor]);
      queue.push([xMin, xMid, yMid, yMax, randomness * decayFactor]);
      queue.push([xMid, xMax, yMid, yMax, randomness * decayFactor]);
    }
  }
  return heightMap;
}
