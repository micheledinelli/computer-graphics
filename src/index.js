"use strict";

/** @type{HTMLCanvasElement}  */
var canvas;

/** @type{WebGLRenderingContext}  */
var gl;

var mesh = new Array();
var res;

var program;

var eye;
var at = [0, 0, 0];
var up = [0, 0, -1];

var lightPosition = lightControls.lightPosition
  ? lightControls.lightPosition
  : [1, 1, -1];

(async function main() {
  canvas = document.getElementById("canvas");
  gl = getWebGLContext(canvas);

  initGUI();

  gl.clearColor(0, 0.39, 0.7, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (!gl) {
    return;
  }

  let vertexShaderSource = await loadTextResource("shaders/vertex.glsl");
  let fragmentShaderSource = await loadTextResource("shaders/fragment.glsl");

  // mesh.sourceMesh = "./data/cube/cube.obj";
  mesh.sourceMesh = "./data/windmill/WindMill_Textured.obj";

  // Use utils/load_mesh.js to load mesh
  res = loadMesh(gl, mesh);

  // Setup GLSL program
  program = webglUtils.createProgramFromSources(gl, [
    vertexShaderSource,
    fragmentShaderSource,
  ]);
  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  // Create a buffer for positions
  var vertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(res.positions),
    gl.STATIC_DRAW
  );

  // Create a buffer for normals
  var normalBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(res.normals), gl.STATIC_DRAW);

  // Create a buffer for textures
  var textureBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBufferObject);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(res.texcoords),
    gl.STATIC_DRAW
  );

  // Bind the position buffer and assign attribute location
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
  var positionAttribLocation = gl.getAttribLocation(program, "a_position");
  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    0, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.enableVertexAttribArray(positionAttribLocation);

  // Bind the normal buffer and assign attribute location
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);
  var normalAttribLocation = gl.getAttribLocation(program, "a_normal");
  gl.vertexAttribPointer(
    normalAttribLocation, // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    0, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.enableVertexAttribArray(normalAttribLocation);

  // Bind the texture buffer and assign attribute location
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBufferObject);
  var textureAttribLocation = gl.getAttribLocation(program, "a_texCoord");
  gl.vertexAttribPointer(
    textureAttribLocation, // Attribute location
    2, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    0, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.enableVertexAttribArray(textureAttribLocation);

  var samplerUniformLocation = gl.getUniformLocation(program, "u_sampler");
  gl.uniform1i(samplerUniformLocation, 0);

  // Tell OpenGL state machine which program should be active.
  gl.useProgram(program);

  var renderLoop = () => {
    requestAnimationFrame(renderLoop);
    render();
  };

  renderLoop();
})();

/** Function that renders the scene */
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Lookup uniforms
  var mModelUniformLocation = gl.getUniformLocation(program, "u_model");
  var mViewUniformLocation = gl.getUniformLocation(program, "u_view");
  var mProjUniformLocation = gl.getUniformLocation(program, "u_projection");
  var mInverseTransposeUniformLocation = gl.getUniformLocation(
    program,
    "u_modelViewTranspose"
  );

  eye = [
    controls.D * Math.sin(controls.phi) * Math.cos(controls.theta),
    controls.D * Math.sin(controls.phi) * Math.sin(controls.theta),
    controls.D * Math.cos(controls.phi),
  ];

  let cameraMatrix = m4.lookAt(eye, at, up);

  let viewMatrix = m4.inverse(cameraMatrix);
  let projectionMatrix = m4.perspective(
    degToRad(controls.fovy),
    gl.canvas.clientWidth / gl.canvas.clientHeight,
    controls.near,
    controls.far
  );
  let modelMatrix = m4.identity();
  // let time = performance.now() / 1000;
  // modelMatrix = m4.yRotate(modelMatrix, degToRad(45 * time));

  // Set the uniforms
  gl.uniformMatrix4fv(mProjUniformLocation, false, projectionMatrix);
  gl.uniformMatrix4fv(mViewUniformLocation, false, viewMatrix);
  gl.uniformMatrix4fv(mModelUniformLocation, false, modelMatrix);

  // Multiply the model matrix by the view matrix
  // and then by the projection matrix
  var modelViewMatrix = m4.multiply(viewMatrix, modelMatrix);
  gl.uniformMatrix4fv(
    mInverseTransposeUniformLocation,
    false,
    m4.transpose(m4.inverse(modelViewMatrix))
  );

  setUpLight(program);

  // gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);
  gl.drawArrays(gl.TRIANGLES, 0, res.numVertices);
}

function setUpLight(program) {
  var kaUniformLocation = gl.getUniformLocation(program, "Ka");
  var kdUniformLocation = gl.getUniformLocation(program, "Kd");
  var ksUniformLocation = gl.getUniformLocation(program, "Ks");
  var shininessUniformLocation = gl.getUniformLocation(program, "shininess");
  var ambientColorUniformLocation = gl.getUniformLocation(
    program,
    "ambientColor"
  );
  var diffuseColorUniformLocation = gl.getUniformLocation(
    program,
    "diffuseColor"
  );
  var specularColorUniformLocation = gl.getUniformLocation(
    program,
    "specularColor"
  );

  var lightPositionUniformLocation = gl.getUniformLocation(
    program,
    "lightPosition"
  );
  lightPosition = [
    lightControls.lightPositionX,
    lightControls.lightPositionY,
    lightControls.lightPositionZ,
  ];
  m4.normalize(lightPosition);

  // Sometimes dat gui decides to pass colors in hex format instead of RGB
  gl.uniform3fv(lightPositionUniformLocation, lightPosition);
  gl.uniform1f(kaUniformLocation, lightControls.Ka);
  gl.uniform1f(kdUniformLocation, lightControls.Kd);
  gl.uniform1f(ksUniformLocation, lightControls.Ks);
  gl.uniform1f(shininessUniformLocation, lightControls.shininess);
  gl.uniform3fv(
    ambientColorUniformLocation,
    normalizeRGBVector(lightControls.ambientColor)
  );
  gl.uniform3fv(
    diffuseColorUniformLocation,
    normalizeRGBVector(lightControls.diffuseColor)
  );
  gl.uniform3fv(
    specularColorUniformLocation,
    normalizeRGBVector(lightControls.specularColor)
  );
}
