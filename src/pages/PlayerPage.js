import { Lightning } from "@lightningjs/sdk";
import Player from "./Player.js";

export default class PlayerPage extends Lightning.Component {
  static _template() {
    return {
      Player: { type: Player }

    };
  }

  _init() {
    this._setState("Playing");
  }

  _active() {
    this._setState("Playing");
  }

  static _states() {
    return [
      class Playing extends this {
        _getFocused() {
          return this.tag("Player");
        }
      }
    ];
  }
}
