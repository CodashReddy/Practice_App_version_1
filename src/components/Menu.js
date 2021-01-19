import { Router, Lightning } from "@lightningjs/sdk";

export default class Menu extends Lightning.Component {
  static _template() {
    return {
      MainMenu: {
        Movies: {
          type: MenuItem,
          title: "Movies"
        },
        Series: {
          type: MenuItem,
          title: "Series",
          x: 200
        },
        Exit: {
          type: MenuItem,
          title: "Exit",
          x: 400
        }
      }
    };
  }

  _init() {
    this.index = 0;
  }

  _handleLeft() {
    if (this.index > 0) {
      this.index--;
    }
  }

  _handleRight() {
    if (this.index < this.tag("MainMenu").children.length - 1) {
      this.index++;
    }
  }

  _handleDown() {
    Router.focusPage();
  }

  get activeItem() {
    return this.tag("MainMenu").children[this.index];
  }

  _getFocused() {
    return this.activeItem;
  }

  _handleEnter() {
    Router.focusPage();
    if (this.activeItem.title === "Series") {
      Router.navigate("tv");
    } else if (this.activeItem.title === "Movies") {
      Router.navigate("main");
    } else if (this.activeItem.title === "Exit") {
      const popup = true;
      this.application.emit("Exit", popup);
    } 
  }
}

class MenuItem extends Lightning.Component {
  static _template() {
    return {
      Label: { text: { text: "Movies", fontSize: 48 } },
      Focus: {
        rect: true,
        color: 0xff8ecea2,
        h: 6,
        y: 75,
        w: 155,
        alpha: 0,
        colorLeft: 0xff8ecea2,
        colorRight: 0xff03b3e4
      }
    };
  }

  _init() {
    this.tag("Label").patch({ text: { text: this.title } });
  }

  _active() {
    this.application.on("setBackground", val => {
      if (val) {
        this.tag("Label").patch({
          colorTop: 0xff717171,
          colorBottom: 0xff000000
        });
      } else {
        this.tag("Label").patch({
          colorTop: 0xffffffff,
          colorBottom: 0xffffffff
        });
      }
    });
  }

  _focus() {
    this.tag("Focus").patch({ alpha: 1 });
  }

  _unfocus() {
    this.tag("Focus").patch({ alpha: 0 });
  }
}
