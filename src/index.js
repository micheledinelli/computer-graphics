"use strict";

/** @type{HTMLCanvasElement}  */
var canvas;

/** @type{WebGLRenderingContext}  */
var gl;

var cube;

var program;

var eye;
var at = [0, 0, 0];
var up = [0, 0, 1];

(async function main() {
  canvas = document.getElementById("canvas");
  gl = getWebGLContext(canvas);

  initGUI();

  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (!gl) {
    return;
  }

  let vertexShaderSource = await loadTextResource("shaders/vertex.glsl");
  let fragmentShaderSource = await loadTextResource("shaders/fragment.glsl");

  // Loading .obj file
  cube = await loadOBJ("cube-blender.obj");

  // Setup GLSL program
  program = webglUtils.createProgramFromSources(gl, [
    vertexShaderSource,
    fragmentShaderSource,
  ]);
  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  // gl.depthFunc(gl.LEQUAL);
  // gl.enable(gl.CULL_FACE);
  // gl.frontFace(gl.CCW);
  // gl.cullFace(gl.BACK);

  // Lookup vertex attributes
  var positionAttribLocation = gl.getAttribLocation(program, "a_position");

  // Create a buffer for positions
  var vertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(cube.positions),
    gl.STATIC_DRAW
  );

  // Create a buffer for indices
  var indexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(cube.indices),
    gl.STATIC_DRAW
  );

  // Bind the position buffer and assign attribute location
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.enableVertexAttribArray(positionAttribLocation);

  // Tell OpenGL state machine which program should be active.
  gl.useProgram(program);

  var renderLoop = () => {
    requestAnimationFrame(renderLoop);
    render();
  };

  renderLoop();
})();

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Lookup uniforms
  var mModelUniformLocation = gl.getUniformLocation(program, "u_model");
  var mViewUniformLocation = gl.getUniformLocation(program, "u_view");
  var mProjUniformLocation = gl.getUniformLocation(program, "u_projection");

  eye = [
    controls.D * Math.sin(controls.phi) * Math.cos(controls.theta),
    controls.D * Math.sin(controls.phi) * Math.sin(controls.theta),
    controls.D * Math.cos(controls.phi),
  ];

  let cameraMatrix = m4.lookAt(eye, at, up);
  let viewMatrix = m4.inverse(cameraMatrix);
  let projectionMatrix = m4.perspective(
    degToRad(controls.fovy),
    canvas.clientWidth / canvas.clientHeight,
    controls.near,
    controls.far
  );

  let modelMatrix = m4.identity();

  // Set the uniforms
  gl.uniformMatrix4fv(mProjUniformLocation, false, projectionMatrix);
  gl.uniformMatrix4fv(mViewUniformLocation, false, viewMatrix);
  gl.uniformMatrix4fv(mModelUniformLocation, false, modelMatrix);

  gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);
}
