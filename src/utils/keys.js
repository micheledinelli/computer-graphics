function onKeyDown(event) {
  var dr = (5.0 * Math.PI) / 180.0;

  switch (event.key) {
    case "ArrowUp":
      controls.phi = Math.max(controls.phi - dr, 0.1);
      break;
    case "ArrowDown":
      controls.phi = Math.min(controls.phi + dr, Math.PI / 2 - 0.1);
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
  const zoomSpeed = 0.05;
  const deltaZoom = -Math.sign(event.deltaY) * zoomSpeed;
  controls.D = Math.max(1.5, Math.min(controls.D + deltaZoom, 40.0));
  render();
}

var moveCamera = false;
function mouseMove(event) {
  if (!moveCamera) return false;

  // Calculate the deltas directly from the event
  let dX = -(event.movementX * 2 * Math.PI) / canvas.width;
  let dY = -(event.movementY * 2 * Math.PI) / canvas.height;

  // Scale down the rotation speed
  dX *= 0.5;
  dY *= 0.5;

  controls.theta -= dX;
  if (controls.phi + dY >= 0.1 && controls.phi + dY <= Math.PI / 2 - 0.1) {
    controls.phi += dY;
  }

  event.preventDefault();
  render();
}

var lastTouchX = 0;
var lastTouchY = 0;
var isPinching = false;
var initialDistance = 0;
function touchMove(event) {
  if (event.touches.length === 1 && moveCamera) {
    const touch = event.touches[0];

    // Calculate the deltas based on the current touch positions
    let dX = (-(touch.screenX - lastTouchX) * 2 * Math.PI) / canvas.width;
    let dY = (-(touch.screenY - lastTouchY) * 2 * Math.PI) / canvas.height;

    // Scale down the rotation speed
    dX *= 0.05;
    dY *= 0.05;

    controls.theta += dX;
    if (controls.phi + dY >= 0 && controls.phi + dY <= Math.PI) {
      controls.phi += dY;
    }

    lastTouchX = touch.screenX;
    lastTouchY = touch.screenY;
    event.preventDefault();
    render();
  } else if (event.touches.length === 2 && isPinching) {
    const currentDistance = getDistance(event.touches[0], event.touches[1]);
    const delta = distance - initialDistance;
    const zoomSpeed = 0.05;
    const deltaZoom = -Math.sign(delta) * zoomSpeed;
    controls.D = Math.max(1.5, Math.min(controls.D + deltaZoom, 40.0));
    initialDistance = currentDistance;
    render();
  }
}

// Bind events to the canvas
window.addEventListener("keydown", onKeyDown);
canvas.addEventListener("wheel", wheel);
canvas.addEventListener("mousedown", () => {
  moveCamera = true;
});
canvas.addEventListener("mousemove", mouseMove);
canvas.addEventListener("mouseup", () => {
  moveCamera = false;
});

canvas.addEventListener("touchstart", (event) => {
  lastTouchX = event.touches[0].screenX;
  lastTouchY = event.touches[0].screenY;
  moveCamera = true;

  if (event.touches.length === 2) {
    isPinching = true;
    initialDistance = getDistance(event.touches[0], event.touches[1]);
  }
});
canvas.addEventListener("touchmove", touchMove);
canvas.addEventListener("touchend", (event) => {
  moveCamera = false;

  if (isPinching && event.touches.length < 2) {
    isPinching = false;
    initialDistance = null;
  }
});

function getDistance(touch1, touch2) {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
