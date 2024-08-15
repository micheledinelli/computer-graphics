var dr = (5.0 * Math.PI) / 180.0;
var touchStartX, touchStartY;
var move = false;

function onKeyDown(event) {
  // Define key bindings and their actions
  switch (event.key) {
    case "ArrowUp":
      controls.phi = Math.max(controls.phi - dr, 0.1);
      break;
    case "ArrowDown":
      controls.phi = Math.min(controls.phi + dr, 3);
      break;
    case "ArrowRight":
      controls.theta = Math.min(controls.theta + dr, 6.28);
      break;
    case "ArrowLeft":
      controls.theta = Math.max(controls.theta - dr, 0);
      break;
    default:
      break;
  }
  render();
}

// Listen for keydown events
window.addEventListener("keydown", onKeyDown);

// Listen for mouse events (and also scroll with two fingers on the mousepad)
window.addEventListener("wheel", (event) => {
  var delta = Math.sign(event.deltaY);

  if (
    Math.max(controls.D + delta, 0) <= 10 &&
    Math.max(controls.D + delta, 0) >= 1
  ) {
    controls.D = Math.max(controls.D + delta, 0);
    render();
  }
});

window.addEventListener("touchstart", (event) => {
  // Capture the initial touch position
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;

  move = true;
});

window.addEventListener("touchmove", (event) => {
  if (!move) return;

  // Calculate the distance moved
  var touchMoveX = event.touches[0].clientX;
  var touchMoveY = event.touches[0].clientY;

  var deltaX = touchMoveX - touchStartX;
  var deltaY = touchMoveY - touchStartY;

  // Adjust the rotation based on touch movement
  controls.theta += deltaX * dr * 0.05; // Scale down the rotation speed if needed
  controls.phi -= deltaY * dr * 0.05; // Inverted for natural rotation

  // Clamp the values to avoid unwanted rotations
  controls.theta = Math.max(Math.min(controls.theta, 6.28), 0);
  controls.phi = Math.max(Math.min(controls.phi, 3), 0.1);

  // Update the start position for the next move
  touchStartX = touchMoveX;
  touchStartY = touchMoveY;

  render(); // Re-render the scene with updated rotation
});

window.addEventListener("touchend", (event) => {
  move = false;
});

window.addEventListener("mousedown", (event) => {
  touchStartX = event.clientX;
  touchStartY = event.clientY;

  move = true;
});

window.addEventListener("mousemove", (event) => {
  if (!move) return;

  // Calculate the distance moved
  var touchMoveX = event.clientX;
  var touchMoveY = event.clientY;

  var deltaX = touchMoveX - touchStartX;
  var deltaY = touchMoveY - touchStartY;

  // Adjust the rotation based on touch movement
  controls.theta += deltaX * dr * 0.05; // Scale down the rotation speed if needed
  controls.phi -= deltaY * dr * 0.05; // Inverted for natural rotation

  // Clamp the values to avoid unwanted rotations
  controls.theta = Math.max(Math.min(controls.theta, 6.28), 0);
  controls.phi = Math.max(Math.min(controls.phi, 3), 0.1);

  // Update the start position for the next move
  touchStartX = touchMoveX;
  touchStartY = touchMoveY;

  render(); // Re-render the scene with updated rotation
});

window.addEventListener("mouseup", (event) => {
  move = false;
});
