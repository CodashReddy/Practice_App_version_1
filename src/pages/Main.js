import { Lightning, Router, Utils } from "@lightningjs/sdk";
import MoviesList from "../components/MoviesList";
import { getImageURL } from "../lib/Utils.js";

export default class Main extends Lightning.Component {
  static _template() {
    return {
      Background: {
        src: Utils.asset("images/background-new.png"),
        w: 1920,
        h: 1080,
        colorTop: 0xff717171,
        colorBottom: 0xff000000,
        scale: 1.2,
        alpha: 0.8,
        transitions: {
          scale: { duration: 2, delay: 0.2, timingFunction: "ease-in" },
          alpha: { duration: 2, delay: 0.2, timingFunction: "ease-in" }
        }
      },
      Logo: {
        src: Utils.asset("images/logosmall.png"),
        w: 300,
        h: 50,
        x: 30,
        y: 10
      },
      List: { type: MoviesList, x: 30 }
    };
  }

  _init() {
    this.application.on("whenFocused", arrList => {
      const movieBackgrnd = arrList[2];
      this.tag("Background").patch({
        src: getImageURL(movieBackgrnd, 1280)
      });
    });
  }

  _setBackgroundAlpha(val) {
    console.log("set back ground.......", val);
    //setItem
    //setlogo
    //set title
    //set geners
    //set menu
    this.application.emit("setBackground", val);
  }

  _active() {
    this.application.on("Exit", popup => {
      console.log("popup", popup);
      if (popup) {
        this.widgets.popup.visible = true;
        this.tag("Logo").patch({
          colorTop: 0xff717171,
          colorBottom: 0xff000000
        });
        this._setBackgroundAlpha(true);
        Router.focusWidget("Popup");
      }
    });
    this.application.on("closepopup", popupClose => {
      if (popupClose === false) {
        this.widgets.popup.visible = false;
        this.tag("Logo").patch({
          colorTop: 0xffffffff,
          colorBottom: 0xffffffff
        });
        this._setBackgroundAlpha(false);
        Router.focusPage();
      } else {
        this.application.closeApp();
      }
    });
  }

  $changeBackground() {
    this.tag("Background").patch({ scale: 1.2, alpha: 0.8 });
    this.tag("Background").setSmooth("scale", 1);
    this.tag("Background").setSmooth("alpha", 1);
  }

  _handleUp() {
    Router.focusWidget("Menu");
  }

  _getFocused() {
    return this.tag("List");
  }

  set main(v) {
    this.tag("List").items = v.results.map(result => {
      let label = result.type === "tv" ? result.name : result.title;
      return {
        label: label,
        genres: result.genres,
        src: getImageURL(result.poster_path),
        itemType: result.type,
        itemId: result.id,
        backdrop: result.backdrop_path,
        average: result.vote_average
      };
    });
  }
}
