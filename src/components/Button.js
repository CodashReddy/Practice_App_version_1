import { Lightning } from "@lightningjs/sdk";

export default class Button extends Lightning.Component {
  static _template() {
    return {
      ButtonBorder: {
        rect: true,
        w: 335,
        h: 73,
        color: 0xffaeb2b3,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 }
      },
      Label: { text: { fontSize: 32 }, x: 75, y: 12, textAlign: "center" }
    };
  }

  _init() {
    this.tag("Label").patch({ text: { text: this.buttonText } });
  }

  _focus() {
    this.tag("ButtonBorder").patch({ color: 0xff33d1ff });
  }

  _unfocus() {
    this.tag("ButtonBorder").patch({ color: 0xffaeb2b3 });
  }
}
