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
  : [-3, 6, -8];

var cubeUniforms = {
  u_model: m4.identity(),
};

var meshProgramInfo;

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

  meshProgramInfo = webglUtils.createProgramInfo(gl, [
    vertexShaderSource,
    fragmentShaderSource,
  ]);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  let objects = [
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
      href: "data/monitor/monitor.obj",
      modelMatrix: m4.yRotate(
        m4.scale(m4.translate(m4.identity(), -0.4, 1.6, 1.6), 0.05, 0.05, 0.05),
        degToRad(90)
      ),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
      ]),
    },
    // {
    //   href: "data/avatar/cube.obj",
    //   modelMatrix: m4.scale(
    //     m4.translate(m4.identity(), 0.0, 3.0, 0),
    //     0.3,
    //     0.3,
    //     0.3
    //   ),
    //   meshProgramInfo: webglUtils.createProgramInfo(gl, [
    //     vertexShaderSource,
    //     fragmentShaderSource,
    //   ]),
    // },
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
        m4.translate(m4.yRotate(m4.identity(), degToRad(-30)), -0.5, 0.02, 0.3),
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
        m4.translate(m4.identity(), 1.32, 0.05, 1.4),
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
      href: "data/monstera/monstera.obj",
      modelMatrix: m4.zRotate(
        m4.xRotate(
          m4.scale(m4.translate(m4.identity(), -1, 1, -0.7), 0.25, 0.25, 0.25),
          degToRad(-90)
        ),
        degToRad(180)
      ),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSourceNoTex,
      ]),
    },
  ];

  for (let objToLoad of objects) {
    let obj = await load(gl, objToLoad.href);
    objToLoad.parts = obj.parts;
    objToLoad.objOffset = obj.objOffset;
  }

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

    gl.useProgram(meshProgramInfo.program);

    webglUtils.setUniforms(meshProgramInfo, sharedUniforms);

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
  render();
})();
