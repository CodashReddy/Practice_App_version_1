import { Lightning, Utils } from "@lightningjs/sdk";
import { Router } from "@lightningjs/sdk";

export default class Splash extends Lightning.Component {
  static getFonts() {
    return [
      { family: "Regular", url: Utils.asset("fonts/Roboto-Regular.ttf") }
    ];
  }

  static _template() {
    return {
      Background: {
        w: 1920,
        h: 1080,
        color: 0xfffbb03b,
        scale: 1.2,
        src: Utils.asset("images/background-new.png"),
        transitions: {
          scale: { duration: 3, timingFunction: "ease-in" }
        }
      },
      Logo: {
        mountX: 0.5,
        mountY: 1,
        x: 800,
        y: 600,
        alpha: 0.01,
        src: Utils.asset("images/logo-large.png"),
        transitions: {
          alpha: { timingFunction: "ease-in", duration: 3, delay: 1.2 },
          y: { timingFunction: "ease-in", duration: 3 }
        }
      },
      Spinner: {
        x: 800,
        y: 720,
        src: Utils.asset("images/spinner.png"),
        mount: 0.5,
        alpha: 0.01,
        transitions: {
          alpha: { duration: 3, delay: 1, timingFunction: "ease-in" }
        }
      }
    };
  }

  _init() {
    this.application.on("booted", () => {
      Router.navigate("main", false);
    });

    this.tag("Logo").on("txLoaded", () => {
      this.patch({
        Background: { smooth: { scale: 1 } },
        Logo: { smooth: { y: 540, alpha: 1 } }
      });
    });

    this.tag("Spinner").on("txLoaded", () => {
      this.tag("Spinner").setSmooth("alpha", 1);
    });

    this.tag("Spinner")
      .animation({
        duration: 1,
        repeat: -1,
        actions: [
          {
            p: "rotation",
            v: {
              0: { v: 0, sm: 0 },
              0.5: { v: 3.14, sm: 0 },
              1: { v: 9, sm: 0 }
            }
          }
        ]
      })
      .start();

    setTimeout(() => {
      Router.navigate("main", false);
    }, 3000);
  }
}
