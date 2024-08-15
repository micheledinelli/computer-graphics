function onKeyDown(event) {
  var dr = (5.0 * Math.PI) / 180.0; // Step for theta and phi
  var df = 5; // Step for fovy

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

window.addEventListener("keydown", onKeyDown);
window.addEventListener("wheel", (event) => {
  var delta = Math.sign(event.deltaY);

  if (
    Math.max(controls.D + delta, 0) <= 10 &&
    Math.max(controls.D + delta, 0) >= 1
  ) {
    controls.D = Math.max(controls.D + delta, 0);
    render();
  }

  // Prevent the distance to be too sma
});
