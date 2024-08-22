const audio = document.querySelector("audio");
const audioControlBtn = document.getElementById("audio-btn");
const waveAnimation = document.querySelector(".wave-animation");
const playIcon = document.querySelector(".play-icon");
let isPlaying = false;

function toggleAudio() {
  if (isPlaying) {
    audio.pause();
    waveAnimation.style.display = "none";
    playIcon.style.display = "block";
    audioControlBtn.style.backgroundColor = "#1f1f1f";
  } else {
    audio.play();
    waveAnimation.style.display = "block";
    playIcon.style.display = "none";
    audioControlBtn.style.backgroundColor = "#1f1f1f";
  }
  isPlaying = !isPlaying;
}

audio.onpause = function () {
  waveAnimation.style.display = "none";
  playIcon.style.display = "block";
  audioControlBtn.style.backgroundColor = "#1f1f1f";
  isPlaying = false;
};

audio.onplay = function () {
  waveAnimation.style.display = "block";
  playIcon.style.display = "none";
  audioControlBtn.style.backgroundColor = "#1f1f1f";
  isPlaying = true;
};
