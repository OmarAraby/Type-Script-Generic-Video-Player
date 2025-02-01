// video-player.ts
interface VideoPlayerConfig {
  progressColor?: string;
  controlsBackground?: string;
  volumeSliderColor?: string;
  textColor?: string;
  showControls?: boolean;
  skipSeconds?: number;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
  icons?: {
    play?: string;
    pause?: string;
    volumeUp?: string;
    volumeDown?: string;
    volumeOff?: string;
    fullscreen?: string;
    rewind?: string;
    forward?: string;
  };
  controls?: {
    showRewind?: boolean;
    showForward?: boolean;
    showVolume?: boolean;
    showFullscreen?: boolean;
    showProgress?: boolean;
    showDuration?: boolean;
  };
}

type VideoPlayerEvent = keyof HTMLVideoElementEventMap;

interface VideoPlayerElements {
  video?: HTMLVideoElement;
  controlsContainer?: HTMLDivElement;
  progressBar?: HTMLDivElement;
  playPauseButton?: HTMLElement;
  volumeSlider?: HTMLInputElement;
  volumeIcon?: HTMLElement;
  currentTime?: HTMLElement;
  duration?: HTMLElement;
  rewindButton?: HTMLElement;
  forwardButton?: HTMLElement;
  fullscreenButton?: HTMLElement;
}

export class VideoPlayer {
  static defaultConfig: VideoPlayerConfig = {
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

  private config: VideoPlayerConfig;
  private player: HTMLElement;
  private elements: VideoPlayerElements = {};
  private eventListeners: Map<string, EventListener> = new Map();

  constructor(playerElement: HTMLElement, config: VideoPlayerConfig = {}) {
    if (!(playerElement instanceof HTMLElement)) {
      throw new Error("Invalid player element provided");
    }

    this.player = playerElement;
    this.config = { ...VideoPlayer.defaultConfig, ...config };
    this.validateConfig();
    this.injectStyles();
    this.injectControls();
    this.initializeElements();
    this.initializeEvents();
    this.initializeVideoState();
  }

  private validateConfig(): void {
    // Validate volume
    this.config.volume = Math.min(Math.max(this.config.volume ?? 1, 0), 1);

    // Validate skipSeconds
    this.config.skipSeconds = Math.max(this.config.skipSeconds ?? 10, 1);

    // Ensure boolean values
    const booleanProps: (keyof VideoPlayerConfig)[] = [
      "showControls",
      "autoPlay",
      "loop",
      "muted",
    ];
    booleanProps.forEach((prop) => {
      (this.config as any)[prop] = Boolean(this.config[prop]);
    });

    // Validate colors
    const colorProps: (keyof VideoPlayerConfig)[] = [
      "progressColor",
      "controlsBackground",
      "volumeSliderColor",
      "textColor",
    ];
    colorProps.forEach((color) => {
      const value = this.config[color];
      if (value && typeof value === "string" && !CSS.supports("color", value)) {
        console.warn(`Invalid color value for ${color}, using default`);
        (this.config as any)[color] = VideoPlayer.defaultConfig[color];
      }
    });

    colorProps.forEach((color) => {
      const value = this.config[color];
      if (value && typeof value === "string" && !CSS.supports("color", value)) {
        console.warn(`Invalid color value for ${color}, using default`);
        (this.config as any)[color] = VideoPlayer.defaultConfig[color];
      }
    });
  }

  static init(selector: string, config?: VideoPlayerConfig): VideoPlayer[] {
    const players = document.querySelectorAll<HTMLElement>(selector);
    return Array.from(players).map((player) => new VideoPlayer(player, config));
  }

  private injectStyles(): void {
    const styleId = "video-player-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = this.generateStyles();
      document.head.appendChild(style);
    }
  }

  private generateStyles(): string {
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
  
        ${/* Rest of the CSS styles from original implementation */ ""}
      `;
  }

  private injectControls(): void {
    if (!this.config.showControls) return;

    this.player.classList.add("video-player-container");
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "controls";

    controlsContainer.innerHTML = this.generateControlMarkup();
    this.player.appendChild(controlsContainer);
  }

  private generateControlMarkup(): string {
    const { controls = {}, icons = {} } = this.config;

    return `
        ${
          controls.showProgress
            ? `
          <div class="progress-area">
            <div class="progress-bar"></div>
          </div>
        `
            : ""
        }
        
        <div class="controls-list">
          <div class="controls-left">
            ${
              controls.showRewind
                ? `
              <span class="icon">
                <i class="material-icons rewind">${icons.rewind}</i>
              </span>
            `
                : ""
            }
            
            <span class="icon">
              <i class="material-icons play-pause">${icons.play}</i>
            </span>
            
            ${
              controls.showForward
                ? `
              <span class="icon">
                <i class="material-icons forward">${icons.forward}</i>
              </span>
            `
                : ""
            }
            
            ${
              controls.showVolume
                ? `
              <div class="volume-container">
                <span class="icon">
                  <i class="material-icons volume">${icons.volumeUp}</i>
                </span>
                <input type="range" class="volume-range" min="0" max="100" 
                  value="${(this.config.volume ?? 1) * 100}">
              </div>
            `
                : ""
            }
            
            ${
              controls.showDuration
                ? `
              <div class="timer">
                <span class="current">0:00</span> / 
                <span class="duration">0:00</span>
              </div>
            `
                : ""
            }
          </div>
          
          <div class="controls-right">
            ${
              controls.showFullscreen
                ? `
              <span class="icon">
                <i class="material-icons fullscreen">${icons.fullscreen}</i>
              </span>
            `
                : ""
            }
          </div>
        </div>
      `;
  }

  private initializeElements(): void {
    this.elements = {
      video: this.player.querySelector<HTMLVideoElement>("video") || undefined,
      controlsContainer:
        this.player.querySelector<HTMLDivElement>(".controls") || undefined,
      progressBar:
        this.player.querySelector<HTMLDivElement>(".progress-bar") || undefined,
      playPauseButton:
        this.player.querySelector<HTMLElement>(".play-pause") || undefined,
      volumeSlider:
        this.player.querySelector<HTMLInputElement>(".volume-range") ||
        undefined,
      volumeIcon:
        this.player.querySelector<HTMLElement>(".volume") || undefined,
      currentTime:
        this.player.querySelector<HTMLElement>(".current") || undefined,
      duration:
        this.player.querySelector<HTMLElement>(".duration") || undefined,
      rewindButton:
        this.player.querySelector<HTMLElement>(".rewind") || undefined,
      forwardButton:
        this.player.querySelector<HTMLElement>(".forward") || undefined,
      fullscreenButton:
        this.player.querySelector<HTMLElement>(".fullscreen") || undefined,
    };
  }
  private initializeVideoState(): void {
    if (!this.elements.video) return;

    const { video } = this.elements;
    video.autoplay = this.config.autoPlay ?? false;
    video.loop = this.config.loop ?? false;
    video.muted = this.config.muted ?? false;
    video.volume = this.config.volume ?? 1;
  }

  private addEventListenerWithCleanup<T extends Event>(
    element: HTMLElement | HTMLVideoElement | HTMLInputElement | Window,
    event: string,
    handler: (event: T) => void
  ): void {
    const wrappedHandler = (e: Event) => handler(e as T);
    element.addEventListener(event, wrappedHandler);
    this.eventListeners.set(`${event}-${element}`, wrappedHandler);
  }

  private initializeEvents(): void {
    if (!this.elements.video) return;

    // Play/Pause
    if (this.elements.playPauseButton) {
      this.addEventListenerWithCleanup(
        this.elements.playPauseButton,
        "click",
        this.togglePlay.bind(this)
      );
    }

    // Video click
    this.addEventListenerWithCleanup(
      this.elements.video,
      "click",
      this.togglePlay.bind(this)
    );

    // Volume
    if (this.elements.volumeSlider) {
      this.addEventListenerWithCleanup(
        this.elements.volumeSlider,
        "input",
        (e: Event) => {
          const target = e.target as HTMLInputElement;
          this.setVolume(Number(target.value));
        }
      );
    }

    if (this.elements.volumeIcon) {
      this.addEventListenerWithCleanup(
        this.elements.volumeIcon,
        "click",
        this.toggleMute.bind(this)
      );
    }

    // Progress
    if (this.elements.progressBar) {
      this.addEventListenerWithCleanup(
        this.elements.progressBar.parentElement!,
        "click",
        (e: MouseEvent) => this.handleProgressClick(e)
      );
    }

    // Skip controls
    if (this.elements.rewindButton) {
      this.addEventListenerWithCleanup(
        this.elements.rewindButton,
        "click",
        () => this.skip(-(this.config.skipSeconds ?? 10))
      );
    }

    if (this.elements.forwardButton) {
      this.addEventListenerWithCleanup(
        this.elements.forwardButton,
        "click",
        () => this.skip(this.config.skipSeconds ?? 10)
      );
    }

    // Fullscreen
    if (this.elements.fullscreenButton) {
      this.addEventListenerWithCleanup(
        this.elements.fullscreenButton,
        "click",
        this.toggleFullscreen.bind(this)
      );
    }

    // Video events
    this.addEventListenerWithCleanup(
      this.elements.video,
      "timeupdate",
      this.updateProgress.bind(this)
    );

    this.addEventListenerWithCleanup(
      this.elements.video,
      "loadedmetadata",
      () => {
        if (this.elements.duration && this.elements.video) {
          this.elements.duration.textContent = this.formatTime(
            this.elements.video.duration
          );
        }
      }
    );
  }

  public togglePlay(): void {
    if (!this.elements.video || !this.elements.playPauseButton) return;

    if (this.elements.video.paused) {
      this.elements.video.play();
      this.elements.playPauseButton.innerHTML =
        this.config.icons?.pause ??
        VideoPlayer.defaultConfig.icons?.pause ??
        "pause";
    } else {
      this.elements.video.pause();
      this.elements.playPauseButton.innerHTML =
        this.config.icons?.play ??
        VideoPlayer.defaultConfig.icons?.play ??
        "play_arrow";
    }
  }

  public setVolume(value: number): void {
    if (!this.elements.video || !this.elements.volumeSlider) return;

    const volume = Math.min(Math.max(value / 100, 0), 1);
    this.elements.video.volume = volume;
    this.elements.volumeSlider.value = String(value);

    if (this.elements.volumeIcon) {
      this.elements.volumeIcon.innerHTML = this.getVolumeIcon(volume);
    }
  }

  private getVolumeIcon(volume: number): string {
    const { icons = {} } = this.config;
    if (volume === 0) return icons.volumeOff ?? "volume_off";
    if (volume < 0.4) return icons.volumeDown ?? "volume_down";
    return icons.volumeUp ?? "volume_up";
  }

  public toggleMute(): void {
    if (!this.elements.video) return;

    this.elements.video.muted = !this.elements.video.muted;
    if (this.elements.volumeSlider) {
      this.elements.volumeSlider.value = this.elements.video.muted
        ? "0"
        : String(Math.floor(this.elements.video.volume * 100));
    }
  }

  private handleProgressClick(e: MouseEvent): void {
    if (!this.elements.progressBar || !this.elements.video) return;

    const rect = this.elements.progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    this.elements.video.currentTime = pos * this.elements.video.duration;
  }

  public updateProgress(): void {
    if (
      !this.elements.video ||
      !this.elements.progressBar ||
      !this.elements.currentTime
    )
      return;

    const progress =
      (this.elements.video.currentTime / this.elements.video.duration) * 100;
    this.elements.progressBar.style.width = `${progress}%`;
    this.elements.currentTime.textContent = this.formatTime(
      this.elements.video.currentTime
    );
  }

  public skip(seconds: number): void {
    if (!this.elements.video) return;

    this.elements.video.currentTime = Math.min(
      Math.max(this.elements.video.currentTime + seconds, 0),
      this.elements.video.duration
    );
  }

  public toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.player.requestFullscreen().catch((err) => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);
    return `${minutes}:${remaining.toString().padStart(2, "0")}`;
  }

  public destroy(): void {
    // Remove event listeners
    this.eventListeners.forEach((handler, key) => {
      const [event, element] = key.split("-");
      const el = element as unknown as HTMLElement;
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

  public on<T extends Event>(
    event: VideoPlayerEvent,
    callback: (event: T) => void
  ): void {
    if (this.elements.video) {
      this.addEventListenerWithCleanup(this.elements.video, event, callback);
    }
  }

  public setConfig(newConfig: Partial<VideoPlayerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.validateConfig();
    this.destroy();
    this.injectStyles();
    this.injectControls();
    this.initializeElements();
    this.initializeEvents();
    this.initializeVideoState();
  }

  public getConfig(): VideoPlayerConfig {
    return { ...this.config };
  }
}

export default VideoPlayer;
