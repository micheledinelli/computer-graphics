var loadingProgress = 0;

const loadingDiv = document.getElementById("loading");
const loadingBar = document.getElementById("loading-bar");

function updateLoadingBar(loadingDelta) {
  loadingProgress += loadingDelta;

  if (loadingProgress >= 1) {
    // Remove loading div from DOM
    loadingDiv.remove();
  }

  // Update loading bar width
  loadingBar.style.width = `${loadingProgress * 100}%`;
}
