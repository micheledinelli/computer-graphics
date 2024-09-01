var controls = {
  near: 1,
  far: 100,
  D: 10,
  theta: 2.4,
  phi: 0.47,
  fovy: 40.0,
};

var advancedRenderingControls = {
  bumpMap: false,
  shadows: false,
  shadowBias: -0.01,
  shadowProjectionWidth: 27,
  shadowProjectionHeight: 21,
  fovy: 85.0,
};

var lightControls = {
  Ka: 0.7,
  Kd: 0.7,
  Ks: 0.3,
  shininess: 3.0,
  lightIntensity: 1,
  attenuationFactor: 0.01,
  ambientColor: [42.49, 26.49, 11.66],
  diffuseColor: [255, 255, 255],
  specularColor: [123, 123, 123],
};

var neonControls = {
  neonIntensity: 0.0,
  neonColor: [255, 0, 0],
};

// Initialize the GUI for controlling various parameters
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
    .max(10)
    .step(0.5)
    .onChange(function () {
      render();
    });

  lightFolder
    .add(lightControls, "lightIntensity")
    .min(0)
    .max(10)
    .step(0.1)
    .onChange(function () {
      render();
    });

  lightFolder
    .add(lightControls, "attenuationFactor")
    .min(0)
    .max(1)
    .step(0.1)
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

  var neonFolder = gui.addFolder("Neon controls");

  neonFolder
    .add(neonControls, "neonIntensity")
    .min(0)
    .max(1)
    .step(0.1)
    .onChange(function () {
      render();
    });

  neonFolder.addColor(neonControls, "neonColor").onChange(function (color) {
    render();
  });

  var advancedRenderingFolder = gui.addFolder("Advanced rendering");

  advancedRenderingFolder
    .add(advancedRenderingControls, "bumpMap")
    .onChange(function () {
      render();
    });

  advancedRenderingFolder
    .add(advancedRenderingControls, "shadows")
    .onChange(function () {
      render();
    });

  advancedRenderingFolder
    .add(advancedRenderingControls, "shadowBias")
    .min(-0.5)
    .max(0.5)
    .step(0.05)
    .onChange(function () {
      if (advancedRenderingControls.shadows) {
        render();
      }
    });

  advancedRenderingFolder
    .add(advancedRenderingControls, "shadowProjectionWidth")
    .min(1)
    .max(100)
    .step(1)
    .onChange(function () {
      if (advancedRenderingControls.shadows) {
        render();
      }
    });

  advancedRenderingFolder
    .add(advancedRenderingControls, "shadowProjectionHeight")
    .min(1)
    .max(100)
    .step(1)
    .onChange(function () {
      if (advancedRenderingControls.shadows) {
        render();
      }
    });

  advancedRenderingFolder
    .add(advancedRenderingControls, "fovy")
    .min(10)
    .max(180.0)
    .step(5)
    .onChange(function () {
      if (advancedRenderingControls.shadows) {
        render();
      }
    });

  lightFolder.closed = true;
  advancedRenderingFolder.closed = true;
  gui.closed = true;
})();

function normalizeRGBVector(rgb) {
  if (rgb.length !== 3) {
    return [0, 0, 0];
  }
  return rgb.map((component) => component / 255);
}
