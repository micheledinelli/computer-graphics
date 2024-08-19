function onKeyDown(event) {
  var dr = (5.0 * Math.PI) / 180.0;
  switch (event.key) {
    case "ArrowUp":
      controls.phi = Math.max(controls.phi - dr, 0.1);
      break;
    case "ArrowDown":
      controls.phi = Math.min(controls.phi + dr, Math.PI - 0.1);
      break;
    case "ArrowRight":
      controls.theta += dr;
      break;
    case "ArrowLeft":
      controls.theta -= dr;
      break;
    default:
      break;
  }
  render();
}

function wheel(event) {
  const zoomSpeed = 0.03;
  const deltaZoom = -Math.sign(event.deltaY) * zoomSpeed;
  controls.D = Math.max(1.5, Math.min(controls.D + deltaZoom, 10.0));
  render();
}

var moveCamera = false;
var mouseMove = function (event) {
  if (!moveCamera) return false;

  // Calculate the deltas directly from the event
  let dX = -(event.movementX * 2 * Math.PI) / canvas.width;
  let dY = -(event.movementY * 2 * Math.PI) / canvas.height;

  // Scale down the rotation speed
  dX *= 0.05;
  dY *= 0.05;

  controls.theta += dX;
  if (controls.phi + dY >= 0 && controls.phi + dY <= Math.PI) {
    controls.phi += dY;
  }

  event.preventDefault();
  render();
};

window.addEventListener("keydown", onKeyDown);
window.addEventListener("wheel", wheel);

window.addEventListener("mousedown", () => {
  moveCamera = true;
});

window.addEventListener("mousemove", mouseMove);

window.addEventListener("mouseup", () => {
  moveCamera = false;
});
