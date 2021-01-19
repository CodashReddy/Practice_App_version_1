import { Lightning } from "@lightningjs/sdk";
import MovieListItem from "./MoviesListItem.js";
// import { FocusManager } from '@lightningjs/ui-components';

export default class MovieList extends Lightning.Component {
  static _template() {
    return {
      // Row:{
      //   type: FocusManager,
      //   direction: 'row',
      //   wrapSelected: true,
      Items: { x: 20, y: 500 },
      // },

      Label: {
        x: 20,
        y: 300,
        text: { fontSize: 64 },
        transitions: {
          y: { timingFunction: "ease-in", duration: 2, delay: 0.2 }
        }
      },
      Genres: {
        x: 20,
        y: 380,
        colorLeft: 0xff8ecea2,
        colorRight: 0xff03b3e4,
        text: { fontSize: 32 },
        transitions: {
          y: { timingFunction: "ease-in", duration: 2, delay: 0.2 }
        }
      }
    };
  }

  set items(items) {
    this.tag("Items").children = items.map((item, index) => {
      return {
        type: MovieListItem,
        item: item,
        x: index * 250
      };
    });
  }

  startTransitions() {
    this.tag("Label").patch({ y: 300 });
    this.tag("Genres").patch({ y: 380 });
    this.tag("Label").setSmooth("y", 320);
    this.tag("Genres").setSmooth("y", 400);
  }

  _construct(){
    this._changeX = 0;
  }
  _init() {
    this.index = 0;
    this.application.on("whenFocused", arrList => {
      this.tag("Label").patch({ text: { text: `${arrList[0]}` } });
      this.tag("Genres").patch({ text: { text: `${arrList[1]}` } });
    });
  }

  _active() {
    this.application.on("setBackground", val => {
      if (val) {
        this.tag("Label").patch({
          colorTop: 0xff717171,
          colorBottom: 0xff000000
        });
        this.tag("Genres").patch({
          colorTop: 0xff717171,
          colorBottom: 0xff000000
        });
      } else {
        this.tag("Label").patch({
          colorTop: 0xffffffff,
          colorBottom: 0xffffffff
        });
        this.tag("Genres").patch({
          colorTop: 0xffffffff,
          colorBottom: 0xffffffff,
          colorLeft: 0xff8ecea2,
          colorRight: 0xff03b3e4
        });
      }
    });
  }

  _handleLeft() {
    if (this.index > 0) {
      this.index--;
      this._changeLeftDirection();
    }
  }

  _handleRight() {
    if (this.index < this.tag("Items").children.length - 1) {
      this.index++;
      this._changeRightDirection();
    }
  }

  _getActiveItem() {
    return this.tag("Items").children[this.index];
  }


  _changeLeftDirection(){
    this._changeX +=  220;
    this.tag('Items').patch({x: this._changeX});
  }

  _changeRightDirection(){
    this._changeX -=  220;
    this.tag('Items').patch({x: this._changeX});
  }

  _getFocused() {
    this._focusedLabel = this.tag("Items").childList.getAt(
      this.index
    ).item.label;
    this._focusedGenres = this.tag("Items")
      .childList.getAt(this.index)
      .item.genres.join(" | ");
    let backdrop = this.tag("Items").childList.getAt(this.index).item.backdrop;
    let arrList = [this._focusedLabel, this._focusedGenres, backdrop];
    this.application.emit("whenFocused", arrList);
    this.fireAncestors("$changeBackground");
    this.startTransitions();
    return this.tag("Items").children[this.index];
  }
}
