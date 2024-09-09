"use strict";

/** @type{HTMLCanvasElement}  */
var canvas;

/** @type{WebGLRenderingContext}  */
var gl;

var shadowMapProgram;
var render;

var eye;
const at = [0, 1, 0];
const up = [0, 1, 0];
var lightPosition = [0.2, 2.3, -1];
var neonPosition = [-0.6, 2.5, 1.7];

var objects;

(async function main() {
  canvas = document.getElementById("canvas");
  gl = getWebGLContext(canvas);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (!gl) {
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  const ext = gl.getExtension("WEBGL_depth_texture");
  if (!ext) {
    return alert("need WEBGL_depth_texture");
  }

  // Load shaders
  let vertexShaderSource = await loadTextResource("shaders/vertex.glsl");
  let fragmentShaderSource = await loadTextResource("shaders/fragment.glsl");
  let fragmentShaderSourceNoTex = await loadTextResource(
    "shaders/fragment-notex.glsl"
  );
  let fragmentShaderSourceNeon = await loadTextResource(
    "shaders/fragment-neon.glsl"
  );
  let fragmentShaderSourceRoom = await loadTextResource(
    "shaders/fragment-room.glsl"
  );

  let vertexShaderShadow = await loadTextResource(
    "shaders/shadows/vertex-shadow.glsl"
  );
  let fragmentShaderShadow = await loadTextResource(
    "shaders/shadows/fragment-shadow.glsl"
  );

  updateLoadingBar(0.2);

  createShadowMap(gl);
  shadowMapProgram = webglUtils.createProgramInfo(gl, [
    vertexShaderShadow,
    fragmentShaderShadow,
  ]);

  // Define objects to render
  objects = [
    {
      href: "data/iso-room/iso.obj",
      modelMatrix: m4.identity(),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSourceRoom,
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
        m4.translate(
          m4.scale(m4.identity(), 0.18, 0.18, 0.18),
          -3.3,
          2.5,
          -8.5
        ),
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
        m4.translate(m4.identity(), -0.6, 0.02, -0.15),
        degToRad(-60)
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
        fragmentShaderSourceNeon,
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
    {
      href: "data/floor-lamp/floor-lamp.obj",
      modelMatrix: m4.translate(m4.identity(), 1.6, 0.1, -1.6),
      meshProgramInfo: webglUtils.createProgramInfo(gl, [
        vertexShaderSource,
        fragmentShaderSource,
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
  ];

  // Load objects
  for (let objToLoad of objects) {
    let obj = await load(gl, objToLoad.href);
    objToLoad.parts = obj.parts;
    objToLoad.objOffset = obj.objOffset;

    // Update loading bar for each object loaded
    updateLoadingBar(0.8 / objects.length);
  }

  updateLoadingBar(0.2);

  render = () => {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Calculate light world matrix and projection matrix in order
    // to draw the shadow map from the light's perspective
    let lightWorldMatrix = m4.lookAt(lightPosition, at, up);
    let lightProjectionMatrix = m4.perspective(
      degToRad(advancedRenderingControls.fovy),
      advancedRenderingControls.shadowProjectionWidth /
        advancedRenderingControls.shadowProjectionHeight,
      controls.near,
      controls.far
    );

    // Draw to shadow map
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.viewport(0, 0, depthTextureSize, depthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawFromLightPov(lightWorldMatrix, lightProjectionMatrix);

    // Draw to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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

    let textureMatrix = m4.identity();
    textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
    textureMatrix = m4.multiply(textureMatrix, m4.inverse(lightWorldMatrix));

    let lightPositionEyeSpace = m4.transformPoint(viewMatrix, lightPosition);
    let neonPositionEyeSpace = m4.transformPoint(viewMatrix, neonPosition);

    // Shared uniforms for all objects (ignored if current program doesn't use them)
    const sharedUniforms = {
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_lightPosition: lightPositionEyeSpace,
      u_lightIntensity: lightControls.lightIntensity,
      u_attenuationFactor: lightControls.attenuationFactor,
      Ka: lightControls.Ka,
      Kd: lightControls.Kd,
      Ks: lightControls.Ks,
      ambientColor: normalizeRGBVector(lightControls.ambientColor),
      diffuseColor: normalizeRGBVector(lightControls.diffuseColor),
      specularColor: normalizeRGBVector(lightControls.specularColor),
      u_shininess: lightControls.shininess,
      u_neonPosition: neonPositionEyeSpace,
      u_neonColor: normalizeRGBVector(neonControls.neonColor),
      u_neonRadius: 2.0,
      u_neonIntensity: neonControls.neonIntensity,
      u_textureMatrix: textureMatrix,
      u_projectedTexture: depthTexture,
      u_bumpEnabled: advancedRenderingControls.bumpMap ? 1 : 0,
      u_shadowMapEnabled: advancedRenderingControls.shadows ? 1 : 0,
      u_bias: advancedRenderingControls.shadowBias,
      u_reverseLightDir: lightWorldMatrix.slice(8, 11),
    };

    for (let obj of objects) {
      let modelViewMatrix = m4.multiply(viewMatrix, obj.modelMatrix);
      let modelViewTranspose = m4.transpose(m4.inverse(modelViewMatrix));

      // Set the program and shared uniforms for the object
      gl.useProgram(obj.meshProgramInfo.program);
      webglUtils.setUniforms(obj.meshProgramInfo, sharedUniforms);
      for (const { bufferInfo, material } of obj.parts) {
        // Calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
        webglUtils.setBuffersAndAttributes(gl, obj.meshProgramInfo, bufferInfo);

        // Calls gl.uniform setting the specific uniforms for the object
        webglUtils.setUniforms(
          obj.meshProgramInfo,
          {
            u_model: obj.modelMatrix,
            u_modelViewTranspose: modelViewTranspose,
          },
          material
        );

        // Calls gl.drawArrays or gl.drawElements
        webglUtils.drawBufferInfo(gl, bufferInfo);
      }
    }
  };
  render();
})();

/**
 * Renders the scene from the light's point of view to create a shadow map.
 *
 * This function is used in shadow mapping to render the depth of objects
 * as seen from the light source. The resulting depth texture is later used
 * to determine which parts of the scene are in shadow.
 *
 * @param {Array<number>} lightWorldMatrix - The 4x4 world matrix of the light source.
 * @param {Array<number>} lightProjectionMatrix - The 4x4 projection matrix for the light's view.
 */
function drawFromLightPov(lightWorldMatrix, lightProjectionMatrix) {
  let viewMatrix = m4.inverse(lightWorldMatrix);

  gl.useProgram(shadowMapProgram.program);

  webglUtils.setUniforms(shadowMapProgram, {
    u_view: viewMatrix,
    u_projection: lightProjectionMatrix,
  });

  for (let obj of objects) {
    for (const { bufferInfo } of obj.parts) {
      webglUtils.setBuffersAndAttributes(gl, shadowMapProgram, bufferInfo);
      webglUtils.setUniforms(shadowMapProgram, {
        u_model: obj.modelMatrix,
      });
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }
  }
}
