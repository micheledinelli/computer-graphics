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
  : [1, 1, -1];

var cubeUniforms = {
  u_model: m4.identity(),
};

var meshProgramInfo;

(async function main() {
  canvas = document.getElementById("canvas");
  gl = getWebGLContext(canvas);

  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (!gl) {
    return;
  }

  let vertexShaderSource = await loadTextResource("shaders/vertex.glsl");
  let fragmentShaderSource = await loadTextResource("shaders/fragment.glsl");

  meshProgramInfo = webglUtils.createProgramInfo(gl, [
    vertexShaderSource,
    fragmentShaderSource,
  ]);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  // const objHref = "data/avatar/sphere.obj";
  // const objHref = "data/desk-s/desk.obj";
  // const objHref = "data/windmill/windmill.obj";
  // const objHref = "data/iso-room/iso.obj";
  // const objHref = "data/windmill/windmill.obj";
  const objHref = "data/chair/chair.obj";
  // const objHref =
  //   "https://webglfundamentals.org/webgl/resources/models/chair/chair.obj";
  const response = await fetch(objHref);
  const text = await response.text();
  const obj = parseOBJ(text);
  const baseHref = new URL(objHref, window.location.href);
  const matTexts = await Promise.all(
    obj.materialLibs.map(async (filename) => {
      const matHref = new URL(filename, baseHref).href;
      const response = await fetch(matHref);
      return await response.text();
    })
  );
  const materials = parseMTL(matTexts.join("\n"));

  const textures = {
    defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]),
    defaultNormal: create1PixelTexture(gl, [127, 127, 255, 0]),
  };

  // Load texture for materials
  for (const material of Object.values(materials)) {
    Object.entries(material)
      .filter(([key]) => key.endsWith("Map"))
      .forEach(([key, filename]) => {
        let texture = textures[filename];
        if (!texture) {
          const textureHref = new URL(filename, baseHref).href;
          texture = createTexture(gl, textureHref);
          textures[filename] = texture;
        }
        material[key] = texture;
      });
  }

  Object.values(materials).forEach((m) => {
    m.shininess = 25;
    m.specular = [3, 2, 1];
  });

  const defaultMaterial = {
    diffuse: [1, 1, 1],
    diffuseMap: textures.defaultWhite,
    normalMap: textures.defaultNormal,
    ambient: [0, 0, 0],
    specular: [1, 1, 1],
    specularMap: textures.defaultWhite,
    shininess: 400,
    opacity: 1,
  };

  const parts = obj.geometries.map(({ material, data }) => {
    if (data.color) {
      if (data.position.length === data.color.length) {
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      data.color = { value: [1, 1, 1, 1] };
    }

    if (data.texcoord && data.normal) {
      data.tangent = generateTangents(data.position, data.texcoord);
    } else {
      data.tangent = { value: [1, 0, 0] };
    }

    if (!data.texcoord) {
      data.texcoord = { value: [0, 0] };
    }

    if (!data.normal) {
      data.normal = { value: [0, 0, 1] };
    }

    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
    return {
      material: {
        ...defaultMaterial,
        ...materials[material],
      },
      bufferInfo,
    };
  });

  function getExtents(positions) {
    const min = positions.slice(0, 3);
    const max = positions.slice(0, 3);
    for (let i = 3; i < positions.length; i += 3) {
      for (let j = 0; j < 3; ++j) {
        const v = positions[i + j];
        min[j] = Math.min(v, min[j]);
        max[j] = Math.max(v, max[j]);
      }
    }
    return { min, max };
  }

  function getGeometriesExtents(geometries) {
    return geometries.reduce(
      ({ min, max }, { data }) => {
        const minMax = getExtents(data.position);
        return {
          min: min.map((min, ndx) => Math.min(minMax.min[ndx], min)),
          max: max.map((max, ndx) => Math.max(minMax.max[ndx], max)),
        };
      },
      {
        min: Array(3).fill(Number.POSITIVE_INFINITY),
        max: Array(3).fill(Number.NEGATIVE_INFINITY),
      }
    );
  }

  const extents = getGeometriesExtents(obj.geometries);
  const range = m4.subtractVectors(extents.max, extents.min);
  // amount to move the object so its center is at the origin
  const objOffset = m4.scaleVector(
    m4.addVectors(extents.min, m4.scaleVector(range, 0.5)),
    -1
  );

  render = () => {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    eye = [
      controls.D * Math.cos(controls.phi) * Math.sin(controls.theta), // x-position
      controls.D * Math.sin(controls.phi), // y-position (up)
      controls.D * Math.cos(controls.phi) * Math.cos(controls.theta), // z-position
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
    modelMatrix = m4.translate(modelMatrix, ...objOffset);
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

    for (const { bufferInfo, material } of parts) {
      // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
      webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
      // calls gl.uniform
      webglUtils.setUniforms(
        meshProgramInfo,
        {
          u_model: modelMatrix,
        },
        material
      );
      console.log(material);
      // calls gl.drawArrays or gl.drawElements
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }

    // requestAnimationFrame(render);
  };
  // requestAnimationFrame(render);

  render();
})();
