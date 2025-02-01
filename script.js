class VideoPlayer {
  constructor(playerElement) {
    this.player = playerElement;
    // this.injectStyle();
    this.injectControls();
  }

  //   inject control
  injectControls() {
    const contrlsContainer = document.createElement("div");
    contrlsContainer.className = "controls acrive"; // add controls attr and set it active
    contrlsContainer.innerHTML = `
    <div class="progress-area">
          <canvas class="bufferedBar"></canvas>
          <div class="progress-bar"><span></span></div>
        </div>
        <div class="controls-list">
          <div class="controls-left">
            <span class="icon"><i class="material-icons fast-rewind">replay_10</i></span>
            <span class="icon"><i class="material-icons play_pause">play_arrow</i></span>
            <span class="icon"><i class="material-icons fast-forward">forward_10</i></span>
            <span class="icon volume-control">
              <i class="material-icons volume">volume_up</i>
              <input type="range" class="volume_range" min="0" max="100">
            </span>
            <div class="timer">
              <span class="current">0:00</span> / 
              <span class="duration">0:00</span>
            </div>
          </div>
          <div class="controls-right">
            <span class="icon"><i class="material-icons fullscreen">fullscreen</i></span>
          </div>
        </div>
    `;

    // don't forget to append it to player element
    this.player.appendChild(contrlsContainer);
  }
  // after that i need to initialize element so i can manipulating and make my logic on  it

  initializeElements() {
    this.video = this.player.querySelector(".main-video");
    this.controls = this.player.querySelector(".controls");
    this.progressBar = this.player.querySelector(".progress-bar");
    this.volumeSlider = this.player.querySelector(".volume_range");
    this.volumeIcon = this.player.querySelector(".volume");
    this.playPauseBtn = this.player.querySelector(".play_pause");
    this.currentTime = this.player.querySelector(".current");
    this.duration = this.player.querySelector(".duration");
    this.fastForwardBtn = this.player.querySelector(".fast-forward");
    this.fastRewindBtn = this.player.querySelector(".fast-rewind");
    this.fullscreenBtn = this.player.querySelector(".fullscreen");
  }

  // handle controls Logic
  togflePlay() {
    this.player.video.paused ? this.video.play() : this.video.pause();
    this.playPauseBtn.innerHTML = this.video.paused ? "play-arrow" : "pause";
  }

  setVolume(value) {
    const volume = value / 100;
    this.video.volume = volume;
    this.volumeSlider.value = value;
    this.volumeIcon.textContent =
      volume === 0 ? "volume_off" : volume < 0.4 ? "volume_down" : "volume_up";
  }

  toggleMute() {
    this.video.muted = !this.video.muted;

    if (this.video.muted) {
      this.volumeSlider.value = 0;
      this.volumeIcon.textContent = "volume_off";
    } else {
      this.volumeSlider.value = this.video.volume * 100;
      this.volumeIcon.textContent =
        this.video.volume < 0.4 ? "volume_down" : "volume_up";
    }
  }

  updateProgress() {
    const progress = (this.video.currentTime / this.video.duration) * 100;
    this.progressBar.style.width = `${progress}%`;
    this.currentTime.textContent = this.formatTime(this.video.currentTime);
    console.log("time updated");
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);
    return `${minutes}:${remaining.toString().padStart(2, "0")}`;
  }
}
