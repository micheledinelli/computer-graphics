var controls = {
  near: 1,
  far: 100,
  D: 10,
  theta: 2.4,
  phi: 0.47,
  fovy: 40.0,
};

var lightControls = {
  lightPositionX: 1.0,
  lightPositionY: 1.0,
  lightPositionZ: -1.0,
  Ka: 0.7,
  Kd: 0.7,
  Ks: 1.0,
  shininess: 80.0,
  ambientColor: [52, 25, 0],
  diffuseColor: [204, 102, 0],
  specularColor: [123, 123, 123],
};

/**
 * Initializes the GUI for controlling various parameters.
 */
(async function initGUI() {
  var gui = new dat.GUI();

  var dr = (5.0 * Math.PI) / 180.0;

  gui
    .add(controls, "near")
    .min(1)
    .max(10)
    .step(1)
    .onChange(function () {
      render();
    });
  gui
    .add(controls, "far")
    .min(1)
    .max(100)
    .step(1)
    .onChange(function () {
      render();
    });
  gui
    .add(controls, "D")
    .min(0)
    .max(40)
    .step(1)
    .onChange(function () {
      render();
    });
  gui
    .add(controls, "theta")
    .min(0)
    .max(2 * Math.PI)
    .step(dr)
    .onChange(function () {
      render();
    });
  gui
    .add(controls, "phi")
    .min(0.1)
    .max(Math.PI / 2 - 0.1)
    .step(dr)
    .onChange(function () {
      render();
    });
  gui
    .add(controls, "fovy")
    .min(10)
    .max(180.0)
    .step(5)
    .onChange(function () {
      render();
    });

  var lightFolder = gui.addFolder("Light controls");

  lightFolder
    .add(lightControls, "Ka")
    .min(0)
    .max(1)
    .step(0.1)
    .onChange(function () {
      render();
    });

  lightFolder
    .add(lightControls, "Kd")
    .min(0)
    .max(1)
    .step(0.1)
    .onChange(function () {
      render();
    });

  lightFolder
    .add(lightControls, "Ks")
    .min(0)
    .max(1)
    .step(0.1)
    .onChange(function () {
      render();
    });

  lightFolder
    .add(lightControls, "shininess")
    .min(0)
    .max(100)
    .step(1)
    .onChange(function () {
      render();
    });

  lightFolder
    .addColor(lightControls, "ambientColor")
    .onChange(function (color) {
      render();
    });

  lightFolder
    .addColor(lightControls, "diffuseColor")
    .onChange(function (color) {
      render();
    });

  lightFolder
    .addColor(lightControls, "specularColor")
    .onChange(function (color) {
      render();
    });

  lightFolder
    .add(lightControls, "lightPositionX")
    .min(-10)
    .max(10)
    .step(1)
    .onChange(function () {
      render();
    });

  lightFolder
    .add(lightControls, "lightPositionY")
    .min(-10)
    .max(10)
    .step(1)
    .onChange(function () {
      render();
    });

  lightFolder
    .add(lightControls, "lightPositionZ")
    .min(-10)
    .max(10)
    .step(1)
    .onChange(function () {
      render();
    });

  lightFolder.closed = true;
  gui.closed = true;
})();

function normalizeRGBVector(rgb) {
  if (rgb.length !== 3) {
    return [0, 0, 0];
  }
  return rgb.map((component) => component / 255);
}
