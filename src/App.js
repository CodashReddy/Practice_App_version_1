import { Lightning, Utils } from "@lightningjs/sdk";
import { Router } from "@lightningjs/sdk";
import routes from "./lib/routes.js";
import Menu from "./components/Menu.js";
import Popup from "./components/Popup.js";

export default class App extends Router.App {
  static getFonts() {
    [
      {
        family: "SourceSansPro-Black",
        url: Utils.asset("fonts/SourceSansPro-Black.ttf"),
        descriptor: {}
      },
      {
        family: "SourceSansPro-Bold",
        url: Utils.asset("fonts/SourceSansPro-Bold.ttf"),
        descriptor: {}
      },
      {
        family: "SourceSansPro-ExtraLight",
        url: Utils.asset("fonts/SourceSansPro-ExtraLight.ttf"),
        descriptor: {}
      },
      {
        family: "SourceSansPro-Light",
        url: Utils.asset("fonts/SourceSansPro-Light.ttf"),
        descriptor: {}
      },
      {
        family: "SourceSansPro-Regular",
        url: Utils.asset("fonts/SourceSansPro-Regular.ttf"),
        descriptor: {}
      },
      {
        family: "SourceSansPro-SemiBold",
        url: Utils.asset("fonts/SourceSansPro-SemiBold.ttf"),
        descriptor: {}
      },
      {
        family: "Regular",
        url: Utils.asset("fonts/Roboto-Regular.ttf"),
        descriptor: {}
      }
    ];
  }
  static _template() {
    return {
      ...super._template(),
      Widgets: {
        Menu: { y: 100, type: Menu, x: 30 },
        Popup: { type: Popup }
      }
    };
  }
  _setup() {
    Router.startRouter(routes, this);
  }
}
