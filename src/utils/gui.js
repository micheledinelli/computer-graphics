// Available controls for the GUI
var controls = {
  near: 1,
  far: 100,
  D: 5.0,
  theta: Math.PI / 2,
  phi: Math.PI / 8,
  fovy: 45.0,
};

/**
 * Initializes the GUI for controlling various parameters.
 */
function initGUI() {
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
    .max(10)
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
    .max(3)
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

  gui.closed = true;
}
