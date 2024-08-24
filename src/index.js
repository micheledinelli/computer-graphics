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
var lightPosition = lightControls.lightPosition
  ? lightControls.lightPosition
  : [1.3, 2.4, -1.6];

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
        m4.translate(m4.identity(), 1.3, 2.4, -1.6),
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
      href: "data/desk/desk.obj",
      modelMatrix: m4.translate(
        m4.yRotate(m4.identity(), degToRad(-90)),
        1.5,
        0.2,
        0.2
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
      href: "data/chair/chair.obj",
      modelMatrix: m4.scale(
        m4.translate(
          m4.yRotate(m4.identity(), degToRad(-30)),
          -0.5,
          0.02,
          0.63
        ),
        0.24,
        0.24,
        0.24
      ),
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
      href: "data/wallpaper/wallpaper.obj",
      modelMatrix: m4.translate(
        m4.scale(m4.identity(), 0.3, 0.3, 0.3),
        4,
        7,
        5.46
      ),

      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/wallpaper-2/wallpaper.obj",
      modelMatrix: m4.translate(
        m4.yRotate(m4.scale(m4.identity(), 0.18, 0.18, 0.18), degToRad(-90)),
        3,
        11.4,
        8.1
      ),

      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/avatar/avatar.obj",
      modelMatrix: m4.translate(
        m4.yRotate(m4.scale(m4.identity(), 0.18, 0.18, 0.18), degToRad(-90)),
        -4,
        11.4,
        8.1
      ),

      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    {
      href: "data/monitor/monitor.obj",
      modelMatrix: m4.yRotate(
        m4.translate(
          m4.scale(m4.identity(), 0.045, 0.045, 0.045),
          -15,
          26,
          33.5
        ),
        degToRad(90)
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
      modelMatrix: m4.translate(
        m4.yRotate(m4.identity(), degToRad(180)),
        0.8,
        0,
        1.2
      ),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
  ];

  console.log("Shaders loaded");

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  for (let objToLoad of objects) {
    console.log("Loading object", objToLoad.href);
    let obj = await load(gl, objToLoad.href);
    objToLoad.parts = obj.parts;
    objToLoad.objOffset = obj.objOffset;
  }

  console.log("Objects loaded");

  render = () => {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    eye = [
      controls.D * Math.cos(controls.phi) * Math.sin(controls.theta),
      controls.D * Math.sin(controls.phi),
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
    const modelViewMatrix = m4.multiply(viewMatrix, modelMatrix);

    lightPosition = [
      lightControls.lightPositionX,
      lightControls.lightPositionY,
      lightControls.lightPositionZ,
    ];
    m4.normalize(lightPosition);

    const sharedUniforms = {
      u_lightDirection: lightPosition,
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
