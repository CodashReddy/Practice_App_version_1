import { Lightning, Router, Utils } from "@lightningjs/sdk";
import { getImageURL } from "../lib/Utils.js";
import Button from "../components/Button.js";

export default class PageDetails extends Lightning.Component {
  static _template() {
    return {
      Background: {
        w: 1920,
        h: 1080,
        colorTop: 0xff717171,
        colorBottom: 0xff000000,
        alpha: 0.8,
        scale: 1.2,
        transitions: {
          alpha: { timingFunction: "ease-in", duration: 2, delay: 0.2 },
          scale: { timingFunction: "ease-in", duration: 2, delay: 0.2 }
        }
      },
      Logo: {
        src: Utils.asset("images/logosmall.png"),
        w: 300,
        h: 50,
        x: 30,
        y: 10
      },
      Title: {
        x: 500,
        y: 300,
        text: { fontSize: 64 },
        transitions: {
          x: { timingFunction: "ease-in", duration: 2, delay: 0.2 }
        }
      },
      Date: {
        x: 500,
        y: 250,
        text: { fontSize: 32 },
        transitions: {
          x: { timingFunction: "ease-in", duration: 2, delay: 0.2 }
        }
      },
      Overview: {
        x: 500,
        y: 400,
        color: 0xffb9bec0,
        text: {
          fontSize: 24,
          wordWrap: true,
          wordWrapWidth: 960,
          lineHeight: 40,
          maxLines:3,
        },
        transitions: {
          x: { timingFunction: "ease-in", duration: 2, delay: 0.2 }
        }
      },
      Poster: {
        rect: true,
        w: 300,
        h: 450,
        x: 30,
        y: 250,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 15 }
      },
      Button: {
        type: Button,
        buttonText: "Watch Trailer",
        x: 500,
        y: 550,

        transitions: {
          x: { timingFunction: "ease-in", duration: 2, delay: 0.2 }
        }
      }
    };
  }

  startTransitions() {
    this.tag("Overview").patch({ x: 500 });
    this.tag("Date").patch({ x: 500 });
    this.tag("Title").patch({ x: 500 });
    this.tag("Button").patch({ x: 500 });

    this.tag("Overview").setSmooth("x", 450);
    this.tag("Date").setSmooth("x", 450);
    this.tag("Title").setSmooth("x", 450);
    this.tag("Button").setSmooth("x", 450);

    this.tag("Background").patch({ alpha: 0.8 });
    this.tag("Background").patch({ scale: 1.2 });
    this.tag("Background").setSmooth("alpha", 1);
    this.tag("Background").setSmooth("scale", 1);
  }

  _active() {
    const backdrop = getImageURL(this.details.backdrop_path, 500);
    this.tag("Background").patch({
      src: backdrop
    });
    this.startTransitions();
    const posterpath = getImageURL(this.details.poster_path, 200);
    this.tag("Poster").patch({
      src: posterpath
    });
    const title =
      this.details.type === "movie" ? this.details.title : this.details.name;
    this.tag("Title").patch({
      text: { text: `${title}` }
    });

    const year =
      this.details.type === "movie"
        ? this.details.release_date.split("-")
        : this.details.first_air_date.split("-");
    this.tag("Date").patch({
      text: { text: `${year[0]}` }
    });
    this.tag("Overview").patch({
      text: { text: `${this.details.overview}` }
    });
  }

  set detail(v) {
    this.details = v;
  }

  _handleUp() {
    Router.focusWidget("Menu");
  }

  _handleEnter() {
    Router.navigate("Player");
  }

  _getFocused() {
    return this.tag("Button");
  }
}
