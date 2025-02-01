export class VideoPlayer {
    constructor(playerElement, config = {}) {
        this.elements = {};
        this.eventListeners = new Map();
        if (!(playerElement instanceof HTMLElement)) {
            throw new Error("Invalid player element provided");
        }
        this.player = playerElement;
        this.config = Object.assign(Object.assign({}, VideoPlayer.defaultConfig), config);
        this.validateConfig();
        this.injectStyles();
        this.injectControls();
        this.initializeElements();
        this.initializeEvents();
        this.initializeVideoState();
    }
    validateConfig() {
        var _a, _b;
        // Validate volume
        this.config.volume = Math.min(Math.max((_a = this.config.volume) !== null && _a !== void 0 ? _a : 1, 0), 1);
        // Validate skipSeconds
        this.config.skipSeconds = Math.max((_b = this.config.skipSeconds) !== null && _b !== void 0 ? _b : 10, 1);
        // Ensure boolean values
        const booleanProps = [
            "showControls",
            "autoPlay",
            "loop",
            "muted",
        ];
        booleanProps.forEach((prop) => {
            this.config[prop] = Boolean(this.config[prop]);
        });
        // Validate colors
        const colorProps = [
            "progressColor",
            "controlsBackground",
            "volumeSliderColor",
            "textColor",
        ];
        colorProps.forEach((color) => {
            const value = this.config[color];
            if (value && typeof value === "string" && !CSS.supports("color", value)) {
                console.warn(`Invalid color value for ${color}, using default`);
                this.config[color] = VideoPlayer.defaultConfig[color];
            }
        });
        colorProps.forEach((color) => {
            const value = this.config[color];
            if (value && typeof value === "string" && !CSS.supports("color", value)) {
                console.warn(`Invalid color value for ${color}, using default`);
                this.config[color] = VideoPlayer.defaultConfig[color];
            }
        });
    }
    static init(selector, config) {
        const players = document.querySelectorAll(selector);
        return Array.from(players).map((player) => new VideoPlayer(player, config));
    }
    injectStyles() {
        const styleId = "video-player-styles";
        if (!document.getElementById(styleId)) {
            const style = document.createElement("style");
            style.id = styleId;
            style.textContent = this.generateStyles();
            document.head.appendChild(style);
        }
    }
    generateStyles() {
        return `
        .video-player-container {
          --progress-color: ${this.config.progressColor};
          --controls-bg: ${this.config.controlsBackground};
          --volume-slider: ${this.config.volumeSliderColor};
          --text-color: ${this.config.textColor};
          position: relative;
          width: 100%;
          height: 100%;
          background: #000;
          overflow: hidden;
        }
  
        .progress-bar {
          background-color: var(--progress-color);
        }
      `;
    }
    injectControls() {
        if (!this.config.showControls)
            return;
        this.player.classList.add("video-player-container");
        const controlsContainer = document.createElement("div");
        controlsContainer.className = "controls";
        controlsContainer.innerHTML = this.generateControlMarkup();
        this.player.appendChild(controlsContainer);
        // Log to verify controls are injected
        console.log("Controls injected:", controlsContainer);
    }
    generateControlMarkup() {
        var _a;
        const { controls = {}, icons = {} } = this.config;
        return `
        ${controls.showProgress
            ? `
          <div class="progress-area">
            <div class="progress-bar"></div>
          </div>
        `
            : ""}
        
        <div class="controls-list">
          <div class="controls-left">
            ${controls.showRewind
            ? `
              <span class="icon">
                <i class="material-icons rewind">${icons.rewind}</i>
              </span>
            `
            : ""}
            
            <span class="icon">
              <i class="material-icons play-pause">${icons.play}</i>
            </span>
            
            ${controls.showForward
            ? `
              <span class="icon">
                <i class="material-icons forward">${icons.forward}</i>
              </span>
            `
            : ""}
            
            ${controls.showVolume
            ? `
              <div class="volume-container">
                <span class="icon">
                  <i class="material-icons volume">${icons.volumeUp}</i>
                </span>
                <input type="range" class="volume-range" min="0" max="100" 
                  value="${((_a = this.config.volume) !== null && _a !== void 0 ? _a : 1) * 100}">
              </div>
            `
            : ""}
            
            ${controls.showDuration
            ? `
              <div class="timer">
                <span class="current">0:00</span> / 
                <span class="duration">0:00</span>
              </div>
            `
            : ""}
          </div>
          
          <div class="controls-right">
            ${controls.showFullscreen
            ? `
              <span class="icon">
                <i class="material-icons fullscreen">${icons.fullscreen}</i>
              </span>
            `
            : ""}
          </div>
        </div>
      `;
    }
    initializeElements() {
        this.elements = {
            video: this.player.querySelector("video") || undefined,
            controlsContainer: this.player.querySelector(".controls") || undefined,
            progressBar: this.player.querySelector(".progress-bar") || undefined,
            playPauseButton: this.player.querySelector(".play-pause") || undefined,
            volumeSlider: this.player.querySelector(".volume-range") ||
                undefined,
            volumeIcon: this.player.querySelector(".volume") || undefined,
            currentTime: this.player.querySelector(".current") || undefined,
            duration: this.player.querySelector(".duration") || undefined,
            rewindButton: this.player.querySelector(".rewind") || undefined,
            forwardButton: this.player.querySelector(".forward") || undefined,
            fullscreenButton: this.player.querySelector(".fullscreen") || undefined,
        };
    }
    initializeVideoState() {
        var _a, _b, _c, _d;
        if (!this.elements.video)
            return;
        const { video } = this.elements;
        video.autoplay = (_a = this.config.autoPlay) !== null && _a !== void 0 ? _a : false;
        video.loop = (_b = this.config.loop) !== null && _b !== void 0 ? _b : false;
        video.muted = (_c = this.config.muted) !== null && _c !== void 0 ? _c : false;
        video.volume = (_d = this.config.volume) !== null && _d !== void 0 ? _d : 1;
    }
    addEventListenerWithCleanup(element, event, handler) {
        const wrappedHandler = (e) => handler(e);
        element.addEventListener(event, wrappedHandler);
        this.eventListeners.set(`${event}-${element}`, wrappedHandler);
    }
    initializeEvents() {
        if (!this.elements.video)
            return;
        const progressArea = this.player.querySelector(".progress-area");
        if (progressArea) {
            this.addEventListenerWithCleanup(progressArea, "click", (e) => this.handleProgressClick(e));
        }
        // Play/Pause
        if (this.elements.playPauseButton) {
            this.addEventListenerWithCleanup(this.elements.playPauseButton, "click", this.togglePlay.bind(this));
        }
        // Video click
        this.addEventListenerWithCleanup(this.elements.video, "click", this.togglePlay.bind(this));
        // Volume
        if (this.elements.volumeSlider) {
            this.addEventListenerWithCleanup(this.elements.volumeSlider, "input", (e) => {
                const target = e.target;
                this.setVolume(Number(target.value));
            });
        }
        if (this.elements.volumeIcon) {
            this.addEventListenerWithCleanup(this.elements.volumeIcon, "click", this.toggleMute.bind(this));
        }
        // Progress
        if (this.elements.progressBar) {
            this.addEventListenerWithCleanup(this.elements.progressBar.parentElement, "click", (e) => this.handleProgressClick(e));
        }
        // Skip controls
        if (this.elements.rewindButton) {
            this.addEventListenerWithCleanup(this.elements.rewindButton, "click", () => { var _a; return this.skip(-((_a = this.config.skipSeconds) !== null && _a !== void 0 ? _a : 10)); });
        }
        if (this.elements.forwardButton) {
            this.addEventListenerWithCleanup(this.elements.forwardButton, "click", () => { var _a; return this.skip((_a = this.config.skipSeconds) !== null && _a !== void 0 ? _a : 10); });
        }
        // Fullscreen
        if (this.elements.fullscreenButton) {
            this.addEventListenerWithCleanup(this.elements.fullscreenButton, "click", this.toggleFullscreen.bind(this));
        }
        // Video events
        this.addEventListenerWithCleanup(this.elements.video, "timeupdate", this.updateProgress.bind(this));
        this.addEventListenerWithCleanup(this.elements.video, "loadedmetadata", () => {
            if (this.elements.duration && this.elements.video) {
                this.elements.duration.textContent = this.formatTime(this.elements.video.duration);
            }
        });
    }
    togglePlay() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!this.elements.video || !this.elements.playPauseButton)
            return;
        if (this.elements.video.paused) {
            this.elements.video.play();
            this.elements.playPauseButton.innerHTML =
                (_d = (_b = (_a = this.config.icons) === null || _a === void 0 ? void 0 : _a.pause) !== null && _b !== void 0 ? _b : (_c = VideoPlayer.defaultConfig.icons) === null || _c === void 0 ? void 0 : _c.pause) !== null && _d !== void 0 ? _d : "pause";
        }
        else {
            this.elements.video.pause();
            this.elements.playPauseButton.innerHTML =
                (_h = (_f = (_e = this.config.icons) === null || _e === void 0 ? void 0 : _e.play) !== null && _f !== void 0 ? _f : (_g = VideoPlayer.defaultConfig.icons) === null || _g === void 0 ? void 0 : _g.play) !== null && _h !== void 0 ? _h : "play_arrow";
        }
    }
    setVolume(value) {
        if (!this.elements.video || !this.elements.volumeSlider)
            return;
        const volume = Math.min(Math.max(value / 100, 0), 1);
        this.elements.video.volume = volume;
        this.elements.volumeSlider.value = String(value);
        if (this.elements.volumeIcon) {
            this.elements.volumeIcon.innerHTML = this.getVolumeIcon(volume);
        }
    }
    getVolumeIcon(volume) {
        var _a, _b, _c;
        const { icons = {} } = this.config;
        if (volume === 0)
            return (_a = icons.volumeOff) !== null && _a !== void 0 ? _a : "volume_off";
        if (volume < 0.4)
            return (_b = icons.volumeDown) !== null && _b !== void 0 ? _b : "volume_down";
        return (_c = icons.volumeUp) !== null && _c !== void 0 ? _c : "volume_up";
    }
    toggleMute() {
        if (!this.elements.video)
            return;
        this.elements.video.muted = !this.elements.video.muted;
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.value = this.elements.video.muted
                ? "0"
                : String(Math.floor(this.elements.video.volume * 100));
        }
    }
    handleProgressClick(e) {
        if (!this.elements.progressBar || !this.elements.video)
            return;
        const rect = this.elements.progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.elements.video.currentTime = pos * this.elements.video.duration;
    }
    updateProgress() {
        if (!this.elements.video ||
            !this.elements.progressBar ||
            !this.elements.currentTime)
            return;
        const progress = (this.elements.video.currentTime / this.elements.video.duration) * 100;
        this.elements.progressBar.style.width = `${progress}%`;
        this.elements.currentTime.textContent = this.formatTime(this.elements.video.currentTime);
    }
    skip(seconds) {
        if (!this.elements.video)
            return;
        this.elements.video.currentTime = Math.min(Math.max(this.elements.video.currentTime + seconds, 0), this.elements.video.duration);
    }
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.player.requestFullscreen().catch((err) => {
                console.error(`Fullscreen error: ${err.message}`);
            });
        }
        else {
            document.exitFullscreen();
        }
    }
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remaining = Math.floor(seconds % 60);
        return `${minutes}:${remaining.toString().padStart(2, "0")}`;
    }
    destroy() {
        // Remove event listeners
        this.eventListeners.forEach((handler, key) => {
            const [event, element] = key.split("-");
            const el = element;
            el.removeEventListener(event, handler);
        });
        this.eventListeners.clear();
        // Remove controls
        if (this.elements.controlsContainer) {
            this.elements.controlsContainer.remove();
        }
        // Remove player class
        this.player.classList.remove("video-player-container");
    }
    on(event, callback) {
        if (this.elements.video) {
            this.addEventListenerWithCleanup(this.elements.video, event, callback);
        }
    }
    setConfig(newConfig) {
        this.config = Object.assign(Object.assign({}, this.config), newConfig);
        this.validateConfig();
        this.destroy();
        this.injectStyles();
        this.injectControls();
        this.initializeElements();
        this.initializeEvents();
        this.initializeVideoState();
    }
    getConfig() {
        return Object.assign({}, this.config);
    }
}
VideoPlayer.defaultConfig = {
    progressColor: "#ffa600",
    controlsBackground: "rgba(0, 0, 0, 0.7)",
    volumeSliderColor: "#ffffff",
    textColor: "#ffffff",
    showControls: true,
    skipSeconds: 10,
    autoPlay: false,
    loop: false,
    muted: false,
    volume: 1,
    icons: {
        play: "play_arrow",
        pause: "pause",
        volumeUp: "volume_up",
        volumeDown: "volume_down",
        volumeOff: "volume_off",
        fullscreen: "fullscreen",
        rewind: "replay_10",
        forward: "forward_10",
    },
    controls: {
        showRewind: true,
        showForward: true,
        showVolume: true,
        showFullscreen: true,
        showProgress: true,
        showDuration: true,
    },
};
//
// export default VideoPlayer;
// Initialize after DOM loads
document.addEventListener("DOMContentLoaded", () => {
    VideoPlayer.init(".video_player", {
        // Appearance
        progressColor: "red",
        controlsBackground: "rgba(0, 0, 0, 0.8)",
        textColor: "#ffffff",
        volumeSliderColor: "green",
        // Behavior
        skipSeconds: 10,
        autoPlay: false,
        loop: false,
        muted: false,
        volume: 0.8,
        showControls: true, // Ensure controls are enabled
        // Control Visibility
        controls: {
            showRewind: true,
            showForward: true,
            showVolume: true,
            showFullscreen: true,
            showProgress: true,
            showDuration: true,
        },
        // Custom Icons
        icons: {
            play: "play_arrow",
            pause: "pause",
            volumeUp: "volume_up",
            volumeDown: "volume_down",
            volumeOff: "volume_off",
            fullscreen: "fullscreen",
            rewind: "replay_10",
            forward: "forward_10",
        },
    });
});
