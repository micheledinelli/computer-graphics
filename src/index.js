"use strict";

/** @type{HTMLCanvasElement}  */
var canvas;

/** @type{WebGLRenderingContext}  */
var gl;

var cube;

(async function main() {
    canvas = document.getElementById("canvas");
    gl = getWebGLContext(canvas);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (!gl) {
        return;
    }

    let vertexShaderSource = await loadTextResource("shaders/vertex.glsl");
    let fragmentShaderSource = await loadTextResource("shaders/fragment.glsl");

    // Loading .obj file
    cube = await loadOBJ("cube.obj");

    // Setup GLSL program
    var program = webglUtils.createProgramFromSources(gl, [
        vertexShaderSource,
        fragmentShaderSource,
    ]);
    gl.useProgram(program);

    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL);
    // gl.enable(gl.CULL_FACE);
    // gl.frontFace(gl.CCW);
    // gl.cullFace(gl.BACK);

    var vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(cube.positions),
        gl.STATIC_DRAW
    );

    var indexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(cube.indices),
        gl.STATIC_DRAW
    );

    var colorData = new Float32Array(cube.positions.length);
    for (let i = 0; i < colorData.length; i += 3) {
        colorData[i] = 1.0; // Red
        colorData[i + 1] = 0.0; // Green
        colorData[i + 2] = 0.0; // Blue
    }

    var colorData2 = new Float32Array(cube.positions.length);
    for (let i = 0; i < colorData2.length; i += 3) {
        colorData2[i] = 0.0; // Red
        colorData2[i + 1] = 1.0; // Green
        colorData2[i + 2] = 0.0; // Blue
    }

    var colorData3 = new Float32Array(cube.positions.length);
    for (let i = 0; i < colorData3.length; i += 3) {
        colorData3[i] = 0.0; // Red
        colorData3[i + 1] = 0.0; // Green
        colorData3[i + 2] = 1.0; // Blue
    }

    // Color buffers
    var colorBufferObject1 = gl.createBuffer();
    var colorBufferObject2 = gl.createBuffer();
    var colorBufferObject3 = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferObject1);
    gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferObject2);
    gl.bufferData(gl.ARRAY_BUFFER, colorData2, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferObject3);
    gl.bufferData(gl.ARRAY_BUFFER, colorData3, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
    gl.vertexAttribPointer(
        positionAttribLocation, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferObject1);
    var colorAttribLocation = gl.getAttribLocation(program, "vertColor");
    gl.vertexAttribPointer(
        colorAttribLocation, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        0, // Size of an individual color
        0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(colorAttribLocation);

    // Tell OpenGL state machine which program should be active.
    gl.useProgram(program);

    var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
    var matViewUniformLocation = gl.getUniformLocation(program, "mView");
    var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    m4.identity(worldMatrix);
    m4.lookAt([0, 0, -20], [0, 0, 0], [0, 1, 0], viewMatrix);
    m4.perspective(
        degToRad(45),
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000.0,
        projMatrix
    );

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);
    var identity = m4.identity(new Float32Array(16));
    var worldMatrix2 = m4.identity(new Float32Array(16));
    var worldMatrix3 = m4.identity(new Float32Array(16));

    var angle = 0;
    var loop = function () {
        angle = (performance.now() / 1000 / 6) * 2 * Math.PI;

        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // First Cube
        m4.identity(worldMatrix);
        m4.yRotate(worldMatrix, angle, worldMatrix);
        m4.xRotate(worldMatrix, angle / 2, worldMatrix);

        drawCube(
            vertexBufferObject,
            colorBufferObject1,
            indexBufferObject,
            worldMatrix,
            positionAttribLocation,
            colorAttribLocation,
            matWorldUniformLocation
        );

        // Second Cube
        m4.identity(worldMatrix2);
        m4.yRotate(identity, angle / 2, yRotationMatrix);
        m4.xRotate(identity, angle * 1.5, xRotationMatrix);
        m4.multiply(yRotationMatrix, xRotationMatrix, worldMatrix2);
        m4.translate(worldMatrix2, 3, 2, 1, worldMatrix2);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix2);

        drawCube(
            vertexBufferObject,
            colorBufferObject2,
            indexBufferObject,
            worldMatrix2,
            positionAttribLocation,
            colorAttribLocation,
            matWorldUniformLocation
        );

        // Third Cube
        m4.identity(worldMatrix3);
        m4.yRotate(identity, angle / 4, yRotationMatrix);
        m4.xRotate(identity, angle / 2, xRotationMatrix);
        m4.multiply(yRotationMatrix, xRotationMatrix, worldMatrix3);
        m4.translate(worldMatrix3, -3, -2, -1, worldMatrix3);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix3);

        drawCube(
            vertexBufferObject,
            colorBufferObject3,
            indexBufferObject,
            worldMatrix3,
            positionAttribLocation,
            colorAttribLocation,
            matWorldUniformLocation
        );

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
})();

function drawCube(
    vertexBufferObject,
    colorBufferObject,
    indexBufferObject,
    worldMatrix,
    positionAttribLocation,
    colorAttribLocation,
    matWorldUniformLocation
) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferObject);
    gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorAttribLocation);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);

    gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);

    gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);
}
