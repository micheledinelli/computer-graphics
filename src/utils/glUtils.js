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
 * @param {string} url - The URL of the OBJ file to load.
 * @returns {Promise<Obj>} A promise that resolves to the parsed result of the OBJ file.
 */
async function loadOBJ(url) {
  let response = await fetch(url);
  let text = await response.text();
  return parseOBJ(text);
}

/**
 * Parses an OBJ file and returns an Obj object.
 *
 * @param {string} text - The text content of the OBJ file.
 * @returns {Obj} The parsed Obj object containing positions and indices.
 */
function parseOBJ(text) {
  let positions = [];
  let normals = [];
  let indices = [];
  let faceNormals = [];

  let lines = text.split("\n");
  for (let line of lines) {
    let parts = line.trim().split(/\s+/);
    if (parts.length > 0) {
      switch (parts[0]) {
        case "v": // Vertex position
          positions.push(
            parseFloat(parts[1]), // x
            parseFloat(parts[2]), // y
            parseFloat(parts[3]) // z
          );
          break;
        case "vn": // Vertex normal
          normals.push(
            parseFloat(parts[1]), // x
            parseFloat(parts[2]), // y
            parseFloat(parts[3]) // z
          );
          break;
        case "f": // Face
          let faceIndices = parts.slice(1).map((i) => {
            // Split the face element into vertex/texture/normal indices
            let indices = i.split("/").map((x) => parseInt(x) - 1);
            return indices;
          });

          // Triangulate the face
          for (let i = 1; i < faceIndices.length - 1; i++) {
            // Push the indices
            indices.push(
              faceIndices[0][0],
              faceIndices[i][0],
              faceIndices[i + 1][0]
            );
            // Push the normals
            faceNormals.push(
              faceIndices[0][2],
              faceIndices[i][2],
              faceIndices[i + 1][2]
            );
          }
          break;
      }
    }
  }

  // Convert faceNormals to normal vectors
  let normalData = [];
  for (let i = 0; i < indices.length; i++) {
    let normalIndex = faceNormals[i];
    normalData.push(
      normals[normalIndex * 3],
      normals[normalIndex * 3 + 1],
      normals[normalIndex * 3 + 2]
    );
  }

  return new Obj({
    positions: positions,
    indices: indices,
    normals: normalData,
  });
}

/**
 * Converts degrees to radians.
 * @param {number} d - The angle in degrees.
 * @returns {number} The angle in radians.
 */
function degToRad(d) {
  return (d * Math.PI) / 180;
}

class Obj {
  constructor(data) {
    this.positions = data.positions;
    this.indices = data.indices;
    this.normals = data.normals;
  }
}
