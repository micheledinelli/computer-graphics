function onKeyDown(event) {
  var dr = (5.0 * Math.PI) / 180.0;
  // Define key bindings and their actions
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
  // Adjust the zoom speed and rotation speed
  const zoomSpeed = 0.1;
  const rotateSpeed = 0.005;

  // Get the scroll direction for zoom (deltaY) and rotation (deltaX)
  const deltaZoom = -Math.sign(event.deltaY) * zoomSpeed;
  // const deltaRotateX = -event.deltaX * rotateSpeed; // Horizontal scroll
  // const deltaRotateY = -event.deltaY * rotateSpeed; // Vertical scroll

  // Update the distance D based on the scroll direction (zoom in/out)
  controls.D = Math.max(1.5, Math.min(controls.D + deltaZoom, 10.0));

  // Update the rotation angles based on the scroll direction
  // controls.theta += deltaRotateX;
  // controls.phi += deltaRotateY;

  // Clamp the phi angle to avoid flipping at the poles
  // controls.phi = Math.max(0.1, Math.min(Math.PI - 0.1, controls.phi));

  // Update the camera's eye position based on the new distance and angles
  // eye = [
  //   controls.D * Math.sin(controls.phi) * Math.cos(controls.theta), // x
  //   controls.D * Math.sin(controls.phi) * Math.sin(controls.theta), // y
  //   controls.D * Math.cos(controls.phi), // z
  // ];

  // Re-render the scene with the updated camera position
  render();
}

window.addEventListener("keydown", onKeyDown);
window.addEventListener("wheel", wheel);
