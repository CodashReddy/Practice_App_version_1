import { Lightning, Router } from "@lightningjs/sdk";
import Button from "./Button.js";

export default class Popup extends Lightning.Component {
  static _template() {
    return {
      Container: {
        x: 700,
        y: 200,
        ExitWindow: {
          texture: lng.Tools.getRoundRect(
            500,
            500,
            40,
            6,
            0xff03b3e4,
            true,
            0xfff5f7fa
          ),
          Label: {
            text: {
              text: "Do you want to exit the application?",
              fontSize: 32,
              wordWrap: true,
              wordWrapWidth: 400,
              lineHeight: 40,
              textAlign: "center",
              textColor: 0xff191a0c,
              paddingLeft: 40
            },
            y: 65,
            x: 50
          },
          Buttons: {
            ButtonYes: {
              y: 200,
              x: 80,
              type: Button,
              buttonText: "YES, I DO"
            },
            ButtonNo: {
              y: 300,
              x: 80,
              type: Button,
              buttonText: "NO, I DON'T"
            }
          }
        }
      }
    };
  }

  _init() {
    this.index = 0;
    this.tag("ButtonNo").patch({ color: "0xffA2A8B2" });
  }

  _getFocused() {
    console.log(
      "I am in getfocused state",
      this.tag("Buttons").children[this.index]
    );
    this.tag("Buttons").children[this.index].patch({ color: "0xffA2A8B2" });
    return this.tag("Buttons").children[this.index];
  }

  _handleUp() {
    this.index = 0;
  }

  _handleDown() {
    this.index = 1;
  }

  _handleBack() {
    Router.focusPage();
  }

  _handleEnter() {
    let appClose = false;
    if (this.tag("Buttons").children[this.index].buttonText === "NO, I DON'T") {
      this.application.emit("closepopup", appClose);
    } else if (
      this.tag("Buttons").children[this.index].buttonText === "YES, I DO"
    ) {
      appClose = true;

      this.application.emit("closepopup", appClose);
    }
  }
}
