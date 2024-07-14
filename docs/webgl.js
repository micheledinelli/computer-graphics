let canvas = document.getElementById("canvas");
let gl = canvas.getContext("webgl");

// Define vertex and fragment shader source code
let vertexShaderSource = `
    attribute vec4 position;
    attribute vec2 texCoord;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    varying vec2 v_texCoord;
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * position;
        v_texCoord = texCoord;
    }
`;

let fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    void main() {
        gl_FragColor = texture2D(u_texture, v_texCoord);
    }
`;

// Create shaders
let vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

// Create shader program
let shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

// Define vertices and texture coordinates for a sphere
let latitudeBands = 100;
let longitudeBands = 100;
let radius = 2;

let vertexPositionData = [];
let normalData = [];
let textureCoordData = [];
let indexData = [];

for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
  let theta = (latNumber * Math.PI) / latitudeBands;
  let sinTheta = Math.sin(theta);
  let cosTheta = Math.cos(theta);

  for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
    let phi = (longNumber * 2 * Math.PI) / longitudeBands;
    let sinPhi = Math.sin(phi);
    let cosPhi = Math.cos(phi);

    let x = cosPhi * sinTheta;
    let y = cosTheta;
    let z = sinPhi * sinTheta;
    let u = 1 - longNumber / longitudeBands;
    let v = 1 - latNumber / latitudeBands;

    normalData.push(x);
    normalData.push(y);
    normalData.push(z);
    textureCoordData.push(u);
    textureCoordData.push(v);
    vertexPositionData.push(radius * x);
    vertexPositionData.push(radius * y);
    vertexPositionData.push(radius * z);
  }
}

for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
  for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
    let first = latNumber * (longitudeBands + 1) + longNumber;
    let second = first + longitudeBands + 1;
    indexData.push(first);
    indexData.push(second);
    indexData.push(first + 1);

    indexData.push(second);
    indexData.push(second + 1);
    indexData.push(first + 1);
  }
}

let vertexPositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(vertexPositionData),
  gl.STATIC_DRAW
);

let textureCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(textureCoordData),
  gl.STATIC_DRAW
);

let indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(
  gl.ELEMENT_ARRAY_BUFFER,
  new Uint16Array(indexData),
  gl.STATIC_DRAW
);

let positionAttribLocation = gl.getAttribLocation(shaderProgram, "position");
gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionAttribLocation);

let texCoordLocation = gl.getAttribLocation(shaderProgram, "texCoord");
gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(texCoordLocation);

// Define projection and model-view matrices
let projectionMatrix = mat4.create();
let modelViewMatrix = mat4.create();

// Set up the perspective projection matrix
mat4.perspective(
  projectionMatrix,
  Math.PI / 4,
  canvas.width / canvas.height,
  0.1,
  100.0
);

// Set up the initial model-view matrix (identity matrix)
mat4.identity(modelViewMatrix);

// Set up the WebGL viewport
gl.viewport(0, 0, canvas.width, canvas.height);

// Set up the projection and model-view matrices as uniforms
let projectionMatrixLocation = gl.getUniformLocation(
  shaderProgram,
  "projectionMatrix"
);
gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

let modelViewMatrixLocation = gl.getUniformLocation(
  shaderProgram,
  "modelViewMatrix"
);

// Load texture image
let texture = gl.createTexture();
let image = new Image();
image.onload = function () {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  draw();
};
image.src = "avatar.jpeg";

// Clear the canvas and draw the sphere
function draw() {
  // Clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Apply rotation to the model-view matrix
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
  mat4.rotateX(modelViewMatrix, modelViewMatrix, angleX);
  mat4.rotateY(modelViewMatrix, modelViewMatrix, angleY);

  // Set up the projection and model-view matrices as uniforms
  gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

  // Bind the texture
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_texture"), 0);

  // Draw the sphere
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);

  angleX += 0.003;
  angleY += 0.008;

  // Request next frame
  requestAnimationFrame(draw);
}

// Rotate the model-view matrix based on mouse movement
// Rotate the model-view matrix based on mouse movement
let angleX = 0;
let angleY = 0;
let lastX, lastY;
let dragging = false;

canvas.addEventListener("mousedown", function (event) {
  dragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
});

canvas.addEventListener("mouseup", function () {
  dragging = false;
});

canvas.addEventListener("mousemove", function (event) {
  if (!dragging) return;

  let deltaX = event.clientX - lastX;
  let deltaY = event.clientY - lastY;

  angleX += deltaY * 0.01;
  angleY += deltaX * 0.01;

  lastX = event.clientX;
  lastY = event.clientY;
});

// Start drawing
draw();
