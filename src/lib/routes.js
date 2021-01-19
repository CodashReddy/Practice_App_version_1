import Splash from "../pages/Splash.js";
import Main from "../pages/Main.js";
import PageDetails from "../pages/PageDetails.js";
import Player from "../pages/Player.js";
import { _fetchDetails, _fetchMoviesData, _fetchTVData } from "./Api.js";

export default {
  root: "splash",
  routes: [
    {
      path: "splash",
      component: Splash,
      widgets: []
    },
    {
      path: "main",
      before: async page => {
        const main = await _fetchMoviesData();
        page.main = main;
      },
      component: Main,
      widgets: ["Menu"]
    },

    {
      path: "tv",
      before: async page => {
        const main = await _fetchTVData();
        page.main = main;
      },
      component: Main,
      widgets: ["Menu"]
    },
    {
      path: "detail/:ItemType/:ItemId",
      before: async (page, { ItemType, ItemId }) => {
        const detail = await _fetchDetails(ItemType, ItemId);
        page.detail = detail;
      },
      component: PageDetails,
      widgets: ["Menu"]
    },
    {
      path: "Player",
      component: Player,
      widgets: []
    }
  ]
};
