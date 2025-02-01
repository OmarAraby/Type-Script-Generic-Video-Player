"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoPlayer = void 0;
var VideoPlayer = /** @class */ (function () {
    function VideoPlayer(playerElement, config) {
        if (config === void 0) { config = {}; }
        this.elements = {};
        this.eventListeners = new Map();
        if (!(playerElement instanceof HTMLElement)) {
            throw new Error("Invalid player element provided");
        }
        this.player = playerElement;
        this.config = __assign(__assign({}, VideoPlayer.defaultConfig), config);
        this.validateConfig();
        this.injectStyles();
        this.injectControls();
        this.initializeElements();
        this.initializeEvents();
        this.initializeVideoState();
    }
    VideoPlayer.prototype.validateConfig = function () {
        var _this = this;
        var _a, _b;
        // Validate volume
        this.config.volume = Math.min(Math.max((_a = this.config.volume) !== null && _a !== void 0 ? _a : 1, 0), 1);
        // Validate skipSeconds
        this.config.skipSeconds = Math.max((_b = this.config.skipSeconds) !== null && _b !== void 0 ? _b : 10, 1);
        // Ensure boolean values
        var booleanProps = [
            "showControls",
            "autoPlay",
            "loop",
            "muted",
        ];
        booleanProps.forEach(function (prop) {
            _this.config[prop] = Boolean(_this.config[prop]);
        });
        // Validate colors
        var colorProps = [
            "progressColor",
            "controlsBackground",
            "volumeSliderColor",
            "textColor",
        ];
        colorProps.forEach(function (color) {
            var value = _this.config[color];
            if (value && typeof value === "string" && !CSS.supports("color", value)) {
                console.warn("Invalid color value for ".concat(color, ", using default"));
                _this.config[color] = VideoPlayer.defaultConfig[color];
            }
        });
        colorProps.forEach(function (color) {
            var value = _this.config[color];
            if (value && typeof value === "string" && !CSS.supports("color", value)) {
                console.warn("Invalid color value for ".concat(color, ", using default"));
                _this.config[color] = VideoPlayer.defaultConfig[color];
            }
        });
    };
    VideoPlayer.init = function (selector, config) {
        var players = document.querySelectorAll(selector);
        return Array.from(players).map(function (player) { return new VideoPlayer(player, config); });
    };
    VideoPlayer.prototype.injectStyles = function () {
        var styleId = "video-player-styles";
        if (!document.getElementById(styleId)) {
            var style = document.createElement("style");
            style.id = styleId;
            style.textContent = this.generateStyles();
            document.head.appendChild(style);
        }
    };
    VideoPlayer.prototype.generateStyles = function () {
        return "\n        .video-player-container {\n          --progress-color: ".concat(this.config.progressColor, ";\n          --controls-bg: ").concat(this.config.controlsBackground, ";\n          --volume-slider: ").concat(this.config.volumeSliderColor, ";\n          --text-color: ").concat(this.config.textColor, ";\n          position: relative;\n          width: 100%;\n          height: 100%;\n          background: #000;\n          overflow: hidden;\n        }\n  \n        ").concat(/* Rest of the CSS styles from original implementation */ "", "\n      ");
    };
    VideoPlayer.prototype.injectControls = function () {
        if (!this.config.showControls)
            return;
        this.player.classList.add("video-player-container");
        var controlsContainer = document.createElement("div");
        controlsContainer.className = "controls";
        controlsContainer.innerHTML = this.generateControlMarkup();
        this.player.appendChild(controlsContainer);
    };
    VideoPlayer.prototype.generateControlMarkup = function () {
        var _a;
        var _b = this.config, _c = _b.controls, controls = _c === void 0 ? {} : _c, _d = _b.icons, icons = _d === void 0 ? {} : _d;
        return "\n        ".concat(controls.showProgress
            ? "\n          <div class=\"progress-area\">\n            <div class=\"progress-bar\"></div>\n          </div>\n        "
            : "", "\n        \n        <div class=\"controls-list\">\n          <div class=\"controls-left\">\n            ").concat(controls.showRewind
            ? "\n              <span class=\"icon\">\n                <i class=\"material-icons rewind\">".concat(icons.rewind, "</i>\n              </span>\n            ")
            : "", "\n            \n            <span class=\"icon\">\n              <i class=\"material-icons play-pause\">").concat(icons.play, "</i>\n            </span>\n            \n            ").concat(controls.showForward
            ? "\n              <span class=\"icon\">\n                <i class=\"material-icons forward\">".concat(icons.forward, "</i>\n              </span>\n            ")
            : "", "\n            \n            ").concat(controls.showVolume
            ? "\n              <div class=\"volume-container\">\n                <span class=\"icon\">\n                  <i class=\"material-icons volume\">".concat(icons.volumeUp, "</i>\n                </span>\n                <input type=\"range\" class=\"volume-range\" min=\"0\" max=\"100\" \n                  value=\"").concat(((_a = this.config.volume) !== null && _a !== void 0 ? _a : 1) * 100, "\">\n              </div>\n            ")
            : "", "\n            \n            ").concat(controls.showDuration
            ? "\n              <div class=\"timer\">\n                <span class=\"current\">0:00</span> / \n                <span class=\"duration\">0:00</span>\n              </div>\n            "
            : "", "\n          </div>\n          \n          <div class=\"controls-right\">\n            ").concat(controls.showFullscreen
            ? "\n              <span class=\"icon\">\n                <i class=\"material-icons fullscreen\">".concat(icons.fullscreen, "</i>\n              </span>\n            ")
            : "", "\n          </div>\n        </div>\n      ");
    };
    VideoPlayer.prototype.initializeElements = function () {
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
    };
    VideoPlayer.prototype.initializeVideoState = function () {
        var _a, _b, _c, _d;
        if (!this.elements.video)
            return;
        var video = this.elements.video;
        video.autoplay = (_a = this.config.autoPlay) !== null && _a !== void 0 ? _a : false;
        video.loop = (_b = this.config.loop) !== null && _b !== void 0 ? _b : false;
        video.muted = (_c = this.config.muted) !== null && _c !== void 0 ? _c : false;
        video.volume = (_d = this.config.volume) !== null && _d !== void 0 ? _d : 1;
    };
    VideoPlayer.prototype.addEventListenerWithCleanup = function (element, event, handler) {
        var wrappedHandler = function (e) { return handler(e); };
        element.addEventListener(event, wrappedHandler);
        this.eventListeners.set("".concat(event, "-").concat(element), wrappedHandler);
    };
    VideoPlayer.prototype.initializeEvents = function () {
        var _this = this;
        if (!this.elements.video)
            return;
        // Play/Pause
        if (this.elements.playPauseButton) {
            this.addEventListenerWithCleanup(this.elements.playPauseButton, "click", this.togglePlay.bind(this));
        }
        // Video click
        this.addEventListenerWithCleanup(this.elements.video, "click", this.togglePlay.bind(this));
        // Volume
        if (this.elements.volumeSlider) {
            this.addEventListenerWithCleanup(this.elements.volumeSlider, "input", function (e) {
                var target = e.target;
                _this.setVolume(Number(target.value));
            });
        }
        if (this.elements.volumeIcon) {
            this.addEventListenerWithCleanup(this.elements.volumeIcon, "click", this.toggleMute.bind(this));
        }
        // Progress
        if (this.elements.progressBar) {
            this.addEventListenerWithCleanup(this.elements.progressBar.parentElement, "click", function (e) { return _this.handleProgressClick(e); });
        }
        // Skip controls
        if (this.elements.rewindButton) {
            this.addEventListenerWithCleanup(this.elements.rewindButton, "click", function () { var _a; return _this.skip(-((_a = _this.config.skipSeconds) !== null && _a !== void 0 ? _a : 10)); });
        }
        if (this.elements.forwardButton) {
            this.addEventListenerWithCleanup(this.elements.forwardButton, "click", function () { var _a; return _this.skip((_a = _this.config.skipSeconds) !== null && _a !== void 0 ? _a : 10); });
        }
        // Fullscreen
        if (this.elements.fullscreenButton) {
            this.addEventListenerWithCleanup(this.elements.fullscreenButton, "click", this.toggleFullscreen.bind(this));
        }
        // Video events
        this.addEventListenerWithCleanup(this.elements.video, "timeupdate", this.updateProgress.bind(this));
        this.addEventListenerWithCleanup(this.elements.video, "loadedmetadata", function () {
            if (_this.elements.duration && _this.elements.video) {
                _this.elements.duration.textContent = _this.formatTime(_this.elements.video.duration);
            }
        });
    };
    VideoPlayer.prototype.togglePlay = function () {
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
    };
    VideoPlayer.prototype.setVolume = function (value) {
        if (!this.elements.video || !this.elements.volumeSlider)
            return;
        var volume = Math.min(Math.max(value / 100, 0), 1);
        this.elements.video.volume = volume;
        this.elements.volumeSlider.value = String(value);
        if (this.elements.volumeIcon) {
            this.elements.volumeIcon.innerHTML = this.getVolumeIcon(volume);
        }
    };
    VideoPlayer.prototype.getVolumeIcon = function (volume) {
        var _a, _b, _c;
        var _d = this.config.icons, icons = _d === void 0 ? {} : _d;
        if (volume === 0)
            return (_a = icons.volumeOff) !== null && _a !== void 0 ? _a : "volume_off";
        if (volume < 0.4)
            return (_b = icons.volumeDown) !== null && _b !== void 0 ? _b : "volume_down";
        return (_c = icons.volumeUp) !== null && _c !== void 0 ? _c : "volume_up";
    };
    VideoPlayer.prototype.toggleMute = function () {
        if (!this.elements.video)
            return;
        this.elements.video.muted = !this.elements.video.muted;
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.value = this.elements.video.muted
                ? "0"
                : String(Math.floor(this.elements.video.volume * 100));
        }
    };
    VideoPlayer.prototype.handleProgressClick = function (e) {
        if (!this.elements.progressBar || !this.elements.video)
            return;
        var rect = this.elements.progressBar.getBoundingClientRect();
        var pos = (e.clientX - rect.left) / rect.width;
        this.elements.video.currentTime = pos * this.elements.video.duration;
    };
    VideoPlayer.prototype.updateProgress = function () {
        if (!this.elements.video ||
            !this.elements.progressBar ||
            !this.elements.currentTime)
            return;
        var progress = (this.elements.video.currentTime / this.elements.video.duration) * 100;
        this.elements.progressBar.style.width = "".concat(progress, "%");
        this.elements.currentTime.textContent = this.formatTime(this.elements.video.currentTime);
    };
    VideoPlayer.prototype.skip = function (seconds) {
        if (!this.elements.video)
            return;
        this.elements.video.currentTime = Math.min(Math.max(this.elements.video.currentTime + seconds, 0), this.elements.video.duration);
    };
    VideoPlayer.prototype.toggleFullscreen = function () {
        if (!document.fullscreenElement) {
            this.player.requestFullscreen().catch(function (err) {
                console.error("Fullscreen error: ".concat(err.message));
            });
        }
        else {
            document.exitFullscreen();
        }
    };
    VideoPlayer.prototype.formatTime = function (seconds) {
        var minutes = Math.floor(seconds / 60);
        var remaining = Math.floor(seconds % 60);
        return "".concat(minutes, ":").concat(remaining.toString().padStart(2, "0"));
    };
    VideoPlayer.prototype.destroy = function () {
        // Remove event listeners
        this.eventListeners.forEach(function (handler, key) {
            var _a = key.split("-"), event = _a[0], element = _a[1];
            var el = element;
            el.removeEventListener(event, handler);
        });
        this.eventListeners.clear();
        // Remove controls
        if (this.elements.controlsContainer) {
            this.elements.controlsContainer.remove();
        }
        // Remove player class
        this.player.classList.remove("video-player-container");
    };
    VideoPlayer.prototype.on = function (event, callback) {
        if (this.elements.video) {
            this.addEventListenerWithCleanup(this.elements.video, event, callback);
        }
    };
    VideoPlayer.prototype.setConfig = function (newConfig) {
        this.config = __assign(__assign({}, this.config), newConfig);
        this.validateConfig();
        this.destroy();
        this.injectStyles();
        this.injectControls();
        this.initializeElements();
        this.initializeEvents();
        this.initializeVideoState();
    };
    VideoPlayer.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
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
    return VideoPlayer;
}());
exports.VideoPlayer = VideoPlayer;
exports.default = VideoPlayer;
