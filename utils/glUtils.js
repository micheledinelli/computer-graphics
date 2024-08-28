"use strict";

/**
 * Retrieves the WebGL context for the specified canvas element.
 * @param {HTMLCanvasElement} canvas - The canvas element to retrieve the WebGL context from.
 * @returns {WebGLRenderingContext} The WebGL rendering context, or null if WebGL context creation failed.
 */
function getWebGLContext(canvas) {
  let contexts = ["webgl", "experimental-webgl"];
  let gl = null;

  for (let i = 0; i < contexts.length; i++) {
    try {
      gl = canvas.getContext(contexts[i]);
    } catch (e) {
      console.log(e);
    }

    if (gl) {
      break;
    }
  }

  if (!gl) {
    throw new Error("WebGL context creation failed.");
  }

  return gl;
}

/**
 * Loads a text resource from the specified URL and returns the text content.
 * @param {string} url - The URL of the text resource to load.
 * @returns {Promise<string>} A promise that resolves to the text content of the resource.
 */
async function loadTextResource(url) {
  try {
    const response = await fetch(url + "?please-dont-cache=" + Math.random());
    if (!response.ok) {
      throw new Error(
        `Error: HTTP Status ${response.status} on resource ${url}`
      );
    }
    return await response.text();
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Loads an OBJ file from the specified URL and returns the parsed result.
 * @param {string} objHref - The URL of the OBJ file to load.
 * @returns {Promise<Obj>} A promise that resolves to the parsed result of the OBJ file.
 */
async function loadOBJ(objHref) {
  // Fetch and parse the OBJ model
  const response = await fetch(objHref);
  const text = await response.text();
  const obj = parseOBJ(text);

  // Fetch and parse the material libraries (MTL)
  const baseHref = new URL(objHref, window.location.href);
  const matTexts = await Promise.all(
    obj.materialLibs.map(async (filename) => {
      const matHref = new URL(filename, baseHref).href;
      const response = await fetch(matHref);
      return await response.text();
    })
  );
  const materials = parseMTL(matTexts.join("\n"));

  // Prepare default textures
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

  // Hack the materials to visualize the specular map
  Object.values(materials).forEach((m) => {
    m.shininess = 25;
    m.specular = [3, 2, 1];
  });

  // Define a default material
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

    // Generate tangents if data is available
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
}

/**
 * Calculates the minimum and maximum values for the given positions.
 * @param {Array<number>} positions - The positions array.
 * @returns {Object} An object containing the minimum and maximum values.
 */
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

/**
 * Calculates the minimum and maximum values for the given geometries.
 * @param {Array<Object>} geometries - The geometries array.
 * @returns {Object} An object containing the minimum and maximum values.
 */
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

/**
 * Converts degrees to radians.
 * @param {number} d - The angle in degrees.
 * @returns {number} The angle in radians.
 */
function degToRad(d) {
  return (d * Math.PI) / 180;
}

/**
 * Class representing an OBJ model.
 */
class Obj {
  constructor(data) {
    this.positions = data.positions;
    this.indices = data.indices;
    this.normals = data.normals;
    this.texCoords = data.texCoords;
  }
}
