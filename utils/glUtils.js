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
