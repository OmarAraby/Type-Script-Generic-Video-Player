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

  // handle controls Logic
}
