"use strict";

/** @type{HTMLCanvasElement}  */
var canvas;

/** @type{WebGLRenderingContext}  */
var gl;

var program;
var render;

var eye;
const at = [0, 0, 0];
const up = [0, 1, 0];
var lightPosition = [1.3, 2.4, -1.6];

var objects;

(async function main() {
  canvas = document.getElementById("canvas");
  gl = getWebGLContext(canvas);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (!gl) {
    return;
  }

  let vertexShaderSource = await loadTextResource("shaders/vertex.glsl");
  let fragmentShaderSource = await loadTextResource("shaders/fragment.glsl");
  let fragmentShaderSourceNoTex = await loadTextResource(
    "shaders/fragment-notex.glsl"
  );

  objects = [
    {
      href: "data/sphere.obj",
      modelMatrix: m4.scale(
        m4.translate(m4.identity(), 1.3, 2.4, -1.65),
        0.05,
        0.05,
        0.05
      ),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSourceNoTex,
      ]),
    },
    {
      href: "data/iso-room/iso.obj",
      modelMatrix: m4.identity(),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSourceNoTex,
      ]),
    },
    {
      href: "data/rack/rack.obj",
      modelMatrix: m4.scale(
        m4.translate(m4.identity(), 1.32, 0.05, 1.2),
        0.0046,
        0.0046,
        0.0046
      ),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSourceNoTex,
      ]),
    },
    {
      href: "data/carpet/carpet.obj",
      modelMatrix: m4.scale(
        m4.translate(m4.identity(), 1.32, 0.038, 1.2),
        0.73,
        0.73,
        0.73
      ),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/carpet/carpet.obj",
      modelMatrix: m4.scale(
        m4.translate(m4.identity(), 1.3, 0.039, -1.5),
        0.73,
        0.73,
        0.73
      ),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/plant/plant.obj",
      modelMatrix: m4.scale(
        m4.translate(m4.identity(), 1.3, 0.7, 1.2),
        0.85,
        0.85,
        0.85
      ),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/frame-camogli/frame.obj",
      modelMatrix: m4.translate(m4.identity(), 1.2, 2.1, 1.4),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/frame-berlin/frame.obj",
      modelMatrix: m4.translate(m4.identity(), -1.45, 2, 0.75),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/avatar/avatar.obj",
      modelMatrix: m4.translate(
        m4.scale(m4.identity(), 0.35, 0.35, 0.35),
        -4.15,
        5.8,
        -2
      ),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/lamp/lamp.obj",
      modelMatrix: m4.translate(
        m4.scale(m4.identity(), 1.3, 1.3, 1.3),
        1,
        0.05,
        -1.8
      ),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/big-sofa/sofa.obj",
      modelMatrix: m4.translate(m4.identity(), -0.4, -0.05, -1.35),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/notebook/notebook.obj",
      modelMatrix: m4.yRotate(
        m4.translate(m4.scale(m4.identity(), 0.18, 0.18, 0.18), 1.7, 2.2, -8.5),
        degToRad(30)
      ),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/birken/birken.obj",
      modelMatrix: m4.yRotate(
        m4.translate(m4.identity(), 2.4, -0.55, 2.2),
        degToRad(-90)
      ),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/desk-set/desk.obj",
      modelMatrix: m4.translate(m4.identity(), -0.49, 0.05, 1),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/chair/chair.obj",
      modelMatrix: m4.yRotate(
        m4.translate(m4.identity(), -0.6, 0.02, 0.1),
        degToRad(40)
      ),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/webgl/webgl.obj",
      modelMatrix: m4.translate(m4.identity(), -0.6, 2.5, 1.7),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/outlet/outlet.obj",
      modelMatrix: m4.translate(m4.identity(), 0, 0.3, 1.4),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSourceNoTex,
      ]),
    },
  ];

  console.log("Shaders loaded");

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  for (let objToLoad of objects) {
    let obj = await load(gl, objToLoad.href);
    objToLoad.parts = obj.parts;
    objToLoad.objOffset = obj.objOffset;
  }

  console.log("Objects loaded");

  render = () => {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    eye = [
      controls.D * Math.cos(controls.phi) * Math.sin(controls.theta) +
        controls.cameraDx,
      controls.D * Math.sin(controls.phi) + controls.cameraDy,
      controls.D * Math.cos(controls.phi) * Math.cos(controls.theta),
    ];

    const cameraMatrix = m4.lookAt(eye, at, up);
    const viewMatrix = m4.inverse(cameraMatrix);
    const projectionMatrix = m4.perspective(
      degToRad(controls.fovy),
      gl.canvas.clientWidth / gl.canvas.clientHeight,
      controls.near,
      controls.far
    );

    let modelMatrix = m4.identity();
    let modelViewMatrix = m4.multiply(viewMatrix, modelMatrix);

    lightPosition = [
      lightControls.lightPositionX,
      lightControls.lightPositionY,
      lightControls.lightPositionZ,
    ];
    let lightPositionEyeSpace = m4.transformPoint(viewMatrix, lightPosition);
    // m4.normalize(lightPosition);

    const sharedUniforms = {
      u_lightPosition: lightPositionEyeSpace,
      u_model: modelMatrix,
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_modelViewTranspose: m4.transpose(m4.inverse(modelViewMatrix)),
      Ka: lightControls.Ka,
      Kd: lightControls.Kd,
      Ks: lightControls.Ks,
      shininess: lightControls.shininess,
      ambientColor: normalizeRGBVector(lightControls.ambientColor),
      diffuseColor: normalizeRGBVector(lightControls.diffuseColor),
      specularColor: normalizeRGBVector(lightControls.specularColor),
    };

    // Iterate over the objects to render
    for (let obj of objects) {
      for (const { bufferInfo, material } of obj.parts) {
        gl.useProgram(obj.meshProgramInfo.program);
        webglUtils.setUniforms(obj.meshProgramInfo, sharedUniforms);

        // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
        webglUtils.setBuffersAndAttributes(gl, obj.meshProgramInfo, bufferInfo);
        // calls gl.uniform
        webglUtils.setUniforms(
          obj.meshProgramInfo,
          {
            u_model: obj.modelMatrix,
          },
          material
        );
        // calls gl.drawArrays or gl.drawElements
        webglUtils.drawBufferInfo(gl, bufferInfo);
      }
    }
  };

  console.log("Rendering");

  render();

  console.log("Rendering done");
})();
