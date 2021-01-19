import { Lightning, Router, Utils } from "@lightningjs/sdk";

export default class MoviesListItem extends Lightning.Component {
  static _template() {
    return {
      w: MoviesListItem.width,
      h: MoviesListItem.height,
      OuterBorder: {
        x: -35,
        y: -42,
        aplha: 0,
        colorLeft: 0xff8ecea2,
        colorRight: 0xff03b3e4,
        texture: lng.Tools.getRoundRect(
          240,
          350,
          8,
          6,
          0xff8ecea2,
          false,
          0xff00ffff
        )
      },
      Item: {
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 },
        rect: true,
        w: w => w,
        h: h => h,
        alpha: 0.8
      },
      Rating: {
        CirleProgress1: {
          shader: { type: Lightning.shaders.RoundedRectangle, radius: 50 },
          rect: true,
          h: 100,
          w: 100,
          x: 30,
          y: 85,
          color: 0xff504d63,
          alpha: 0,
          CirleProgress2: {
            shader: {
              type: Lightning.shaders.RoundedRectangle,
              radius: 40,
              stroke: 5,
              strokeColor: 0xff7eb24e,
              fillColor: 0xff504d63
            },
            rect: true,
            h: 80,
            w: 80,
            alpha: 0,
            x: 10,
            y: 10,
            InnerCircle: {
              shader: {
                shader: {
                  type: Lightning.shaders.RoundedRectangle,
                  radius: 40
                },
                rect: true,
                h: 80,
                w: 80,
                color: 0xffffb6c1
              }
            }
          },
          Number: {
            text: { text: "0", fontSize: 18 },
            alpha: 0,
            x: 35,
            y: 35
          },
          Percentage: {
            text: { text: "%", fontSize: 12 },
            alpha: 0,
            x: 55,
            y: 40
          }
        }
      }
    };
  }

  _init() {
    this.tag("Item").patch({ src: this.item.src });
    const itemAverage = this.item.average * 10;
    this.tag("OuterBorder").patch({ alpha: 0 });
    this.tag("CirleProgress1").patch({ alpha: 0 });
    this.tag("CirleProgress2").patch({ alpha: 0 });
    this.tag("Number").patch({ alpha: 0 });
    this.tag("Percentage").patch({ alpha: 0 });
    this._rating = this.tag("Rating").animation({
      duration: 1,
      stopMethod: "immediate",
      actions: [
        {
          p: "y",
          v: {
            0: 140,
            0.1: 135,
            0.2: 130,
            0.3: 125,
            0.4: 120,
            0.5: 115,
            0.6: 110,
            0.7: 105,
            0.8: 100,
            0.9: 95,
            1: 90
          }
        },
        {
          t: "Number",
          p: "text.text",
          v: () => {
            if (this.ratingNum < itemAverage) {
              this.ratingNum++;
            }
            return this.ratingNum;
          }
        }
      ]
    });
    this._rating.start();

    this._aniCirleProgress2 = this.tag("CirleProgress2").animation({
      duration: 1,
      stopMethod: "immediate",
      actions: [
        {
          p: "shader.strokeColor",
          v: () => {
            //TO DO..implement a progress shader!
          }
        }
      ]
    });

    this.ratingNum = 0;
    this._aniNumber = this.tag("Number").animation({
      duration: 1.2,
      stopMethod: "immediate",
      actions: [
        {
          p: "y",
          v: {
            0: 215,
            0.1: 200,
            0.2: 190,
            0.3: 180,
            0.4: 170,
            0.5: 160,
            0.6: 150,
            0.7: 155,
            0.8: 150,
            0.9: 140,
            1: 135
          }
        },
        {
          p: "text.text",
          v: () => {
            if (this.ratingNum < itemAverage) {
              this.ratingNum++;
            }
            return this.ratingNum;
          }
        }
      ]
    });
  }

  _active() {
    this.application.on("setBackground", val => {
      if (val) {
        this.tag("Item").patch({
          colorTop: 0xff717171,
          colorBottom: 0xff000000
        });
      } else {
        this.tag("Item").patch({
          colorTop: 0xffffffff,
          colorBottom: 0xffffffff
        });
      }
    });
  }

  _focus() {
    this.ratingNum = 0;
    this.tag("Item").patch({ smooth: { scale: 1.2, alpha: 1 } });
    this.tag("OuterBorder").patch({ alpha: 1 });
    this.tag("CirleProgress1").patch({ alpha: 1 });
    this.tag("CirleProgress2").patch({ alpha: 1 });
    this.tag("Number").patch({ alpha: 1 });
    this.tag("Percentage").patch({ alpha: 1 });
    this._rating.replay();
  }

  _unfocus() {
    this.tag("Item").patch({ smooth: { scale: 1, alpha: 0.8 } });
    this.tag("OuterBorder").patch({ alpha: 0 });
    this.tag("CirleProgress1").patch({ alpha: 0 });
    this.tag("CirleProgress2").patch({ alpha: 0 });
    this.tag("Number").patch({ alpha: 0 });
    this.tag("Percentage").patch({ alpha: 0 });
  }

  _handleEnter() {
    const itemId = this.item.itemId;
    const itemType = this.item.itemType;
    Router.navigate(`detail/${itemType}/${itemId}`, true);
  }

  static get width() {
    return 180;
  }

  static get height() {
    return 270;
  }
}
