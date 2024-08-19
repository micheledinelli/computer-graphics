"use strict";

/** @type{HTMLCanvasElement}  */
var canvas;

/** @type{WebGLRenderingContext}  */
var gl;

var mesh = new Array();
var res;
var mesh2 = new Array();
var res2;

var program;

var eye;
var at = [0, 0, 0];
var up = [0, 0, 1];

var lightPosition = lightControls.lightPosition
  ? lightControls.lightPosition
  : [1, 1, -1];

(async function main() {
  canvas = document.getElementById("canvas");
  gl = getWebGLContext(canvas);

  // gl.clearColor(0, 0.39, 0.7, 1.0);
  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (!gl) {
    return;
  }

  let vertexShaderSource = await loadTextResource("shaders/vertex.glsl");
  let fragmentShaderSource = await loadTextResource("shaders/fragment.glsl");

  // mesh.sourceMesh = "./data/cube/cube.obj";
  // mesh.sourceMesh = "./data/windmill/WindMill_Textured.obj";
  // mesh.sourceMesh = "./data/box-room/box-room.obj";
  // Use utils/load_mesh.js to load mesh
  mesh.sourceMesh = "./data/iso-room/iso-room.obj";
  res = loadMesh(gl, mesh);

  mesh2.sourceMesh = "./data/cube/cube.obj";
  res2 = loadMesh(gl, mesh2);

  // Setup GLSL program
  program = webglUtils.createProgramFromSources(gl, [
    vertexShaderSource,
    fragmentShaderSource,
  ]);
  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  var samplerUniformLocation = gl.getUniformLocation(program, "u_sampler");
  gl.uniform1i(samplerUniformLocation, 0);

  // Tell OpenGL state machine which program should be active.
  gl.useProgram(program);

  var renderLoop = () => {
    render();
    requestAnimationFrame(renderLoop);
  };

  renderLoop();
})();

/** Function that renders the scene */
function render() {
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  createBuffersAndPointAttrib(gl, res);

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
    canvas.clientWidth / canvas.clientHeight,
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

  gl.drawArrays(gl.TRIANGLES, 0, res.numVertices);

  createBuffersAndPointAttrib(gl, res2);

  // The second object is a cube and is in the center of the room and is smaller
  modelMatrix = m4.identity();
  modelMatrix = m4.translate(modelMatrix, 0, 0, 0);
  modelMatrix = m4.scale(modelMatrix, 0.1, 0.1, 0.1);
  gl.uniformMatrix4fv(mModelUniformLocation, false, modelMatrix);

  gl.drawArrays(gl.TRIANGLES, 0, res2.numVertices);
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
