import Movie from "./Movie.js";
import TV from "./TV.js";

export default class Container {
  constructor(obj, genres, type) {
    this._page = obj.page;
    this._genres = genres;
    this._total_pages = obj.total_pages;
    this._results = obj.results.map(item => {
      if (type === "movie") {
        return new Movie(item, genres);
      } else if (type === "tv") {
        return new TV(item, genres);
      }
    });
    this._type = type;
    this._total_results = obj.total_results;
  }

  get page() {
    return this._page;
  }

  get items() {
    return this._total_pages;
  }

  get genres() {
    return this._genres;
  }

  get total_results() {
    return this._total_results;
  }

  get results() {
    return this._results;
  }

  get type() {
    return this._type;
  }
}
