import { Lightning, Utils, VideoPlayer } from "@lightningjs/sdk";

export default class Player extends Lightning.Component {
  static _template() {
    return {
      TitleText: {
        text: {
          text:
            "This is not a movie trailer-just a demo player for learning purposes only!.[Press M for (Mute/unmute), Press Enter for (Pause/Play),Press - for show/hide ]",
          fontSize: 22,
          textColor: 0xffff0000,
          fontStyle:'bold',
          textAlign:'center',
          x: 1,
          y: 1
        }
      },
      ProgressBarBorder: {
        zIndex: 2,
        ProgressBar: {
          shader: { type: Lightning.shaders.RoundedRectangle, radius: 4 },
          rect: true,
          w: 1,
          h: 8,
          color: 0xff000000
        },
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 4 },
        rect: true,
        w: 940,
        h: 8,
        x: 360,
        y: 650,
        color: 0xff808080
      },
      PlayerDuration: {
        zIndex: 2,
        x: 390,
        y: 620,
        text: {
          text: "",
          fontSize: 12,
          textColor: 0xff000000
        }
      },
      CurrentPosition: {
        zIndex: 2,
        x: 420,
        y: 620,
        text: { text: "", fontSize: 12, textColor: 0xff000000 }
      },
      PauseIcon: {
        zIndex: 2,
        x: 360,
        y: 620,
        src: Utils.asset("images/pause.png"),
        w: 20,
        h: 20,
        alpha: 0
      },
      PlayIcon: {
        zIndex: 2,
        x: 360,
        y: 620,
        src: Utils.asset("images/play.png"),
        w: 20,
        h: 20
      }
    };
  }

  _init() {
    VideoPlayer.consumer(this);
    VideoPlayer.size(960, 540);
    VideoPlayer.position(150, 350);
  }

  _active() {
    VideoPlayer.open(
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    );
    this._setState("Play");
    setTimeout(() => {
      this._checkDuration();
    }, 2000);
  }

  _inactive() {
    VideoPlayer.close();
  }

  _handleEnter() {
    VideoPlayer.playPause();
    setTimeout(() => {
      if (VideoPlayer.playing) {
        console.log("Playing....");
        this.progressAnimation.play();
        this.tag("PauseIcon").patch({ alpha: 0 });
        this.tag("PlayIcon").patch({ alpha: 1 });
      } else {
        this.progressAnimation.pause();
        console.log("Paused....");
        this.tag("PauseIcon").patch({ alpha: 1 });
        this.tag("PlayIcon").patch({ alpha: 0 });
      }
    }, 500);
  }

  _handleShow() {
    VideoPlayer.show();
    this.tag("ProgressBar").patch({ alpha: 1 });
    VideoPlayer.mute(false);
  }

  _handleHide() {
    VideoPlayer.hide();
    this.tag("ProgressBar").patch({ alpha: 0 });
    VideoPlayer.mute();
  }

  _handleMute() {
    if (VideoPlayer.muted) {
      VideoPlayer.mute(false);
    } else {
      VideoPlayer.mute();
    }
  }

  _checkDuration() {
    const width = this.tag("ProgressBarBorder").w;
    this._increment = (width / (this._duration * 60)).toFixed(2);
    this._currentPosition = VideoPlayer.currentTime;
    this.tag("CurrentPosition").patch({
      text: { text: `current position= ${this._currentPosition}` }
    });
    this._progress = 0;

    this.progressAnimation = this.tag("ProgressBar").animation({
      stopMethod: "immediate",
      delay: 0.2,
      duration: this._duration * 60,
      repeat: 0,
      actions: [
        {
          p: "w",
          v: () => {
            let currentPosition = VideoPlayer.currentTime;
            this.tag("CurrentPosition").patch({
              text: { text: `${currentPosition.toFixed(2)}` }
            });
            let duration = this._duration * 60;
            if (this._progress < width) {
              this._progress = currentPosition;
              this._progress = Math.floor(this._progress);
            }
            return this._progress;
          }
        }
      ]
    });
    this.progressAnimation.play();
  }

  static _states() {
    return [
      class Play extends this {
        $videoPlayerCanPlay() {
          this._duration = VideoPlayer.duration;
          this._duration = (this._duration / 60).toFixed(2);
          console.log("duration...", this._duration);
          this.tag("PlayerDuration").patch({
            text: { text: `${this._duration} /` }
          });
        }
      }
    ];
  }
}
