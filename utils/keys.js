/**
 * Handles keyboard events.
 * @param {KeyboardEvent} event - The keyboard event.
 */
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
    case "w":
      controls.D = Math.max(1.5, Math.min(controls.D - 0.3, 40.0));
      break;
    case "s":
      controls.D = Math.max(1.5, Math.min(controls.D + 0.3, 40.0));
      break;
    case "a":
      controls.theta += dr;
      break;
    case "d":
      controls.theta -= dr;
      break;
    default:
      break;
  }

  render();
}

/**
 * Handles wheel events.
 * @param {WheelEvent} event - The wheel event.
 */
function wheel(event) {
  const zoomSpeed = 0.1;
  const deltaZoom = -Math.sign(event.deltaY) * zoomSpeed;
  controls.D = Math.max(1.5, Math.min(controls.D + deltaZoom, 40.0));
  render();
}

var moveCamera = false;
/**
 * Handles mouse move events.
 * @param {MouseEvent} event - The mouse move event.
 */
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

/**
 * Handles touch move events.
 * @param {TouchEvent} event - The touch move event.
 */
function touchMove(event) {
  if (event.touches.length === 1 && moveCamera) {
    const touch = event.touches[0];

    // Calculate the deltas based on the current touch positions
    let dX = (-(touch.screenX - lastTouchX) * 2 * Math.PI) / canvas.width;
    let dY = (-(touch.screenY - lastTouchY) * 2 * Math.PI) / canvas.height;

    // Scale down the rotation speed
    dX *= 0.5;
    dY *= 0.5;

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
    const delta = currentDistance - initialDistance;
    const zoomSpeed = 0.1;
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
  canvas.style.cursor = "grabbing";
});
canvas.addEventListener("mousemove", mouseMove);
canvas.addEventListener("mouseup", () => {
  moveCamera = false;
  canvas.style.cursor = "grab";
});

canvas.addEventListener("touchstart", (event) => {
  if (event.touches.length === 1) {
    lastTouchX = event.touches[0].screenX;
    lastTouchY = event.touches[0].screenY;
    moveCamera = true;
  } else if (event.touches.length === 2) {
    isPinching = true;
    initialDistance = getDistance(event.touches[0], event.touches[1]);
    console.log("Pinch start, initial distance:", initialDistance);
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

/**
 * Calculates the Euclidean distance in 2D space between two touch points.
 * @param {Touch} touch1 - The first touch point.
 * @param {Touch} touch2 - The second touch point.
 * @returns {number} The distance between the two touch points.
 */
function getDistance(touch1, touch2) {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
