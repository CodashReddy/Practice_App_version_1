export default class Movie {
  constructor(item, genres) {
    this._genreIds = genres;
    this._id = item.id;
    this._adult = item.adult;
    this._backdrop_path = item.backdrop_path;
    this._original_language = item.original_language;
    this._original_title = item.original_title;
    this._overview = item.overview;
    this._popularity = item.popularity;
    this._poster_path = item.poster_path;
    this._release_date = item.release_date;
    this._title = item.title;
    this._video = item.video;
    this._vote_average = item.vote_average;
    this._vote_count = item.vote_count;
    this._genres = item.genre_ids.map(id => {
      const filtered = genres.genres.find(genre => {
        return genre.id === id;
      });
      return filtered.name;
    });
  }

  get type() {
    return "movie";
  }

  get genreIds() {
    return this._genreIds;
  }

  get id() {
    return this._id;
  }

  get adult() {
    return this._adult;
  }

  get backdrop_path() {
    return this._backdrop_path;
  }

  get original_language() {
    return this._original_language;
  }

  get popularity() {
    return this._popularity;
  }

  get poster_path() {
    return this._poster_path;
  }

  get release_date() {
    return this._release_date;
  }

  get title() {
    return this._title;
  }

  get video() {
    return this._video;
  }

  get vote_average() {
    return this._vote_average;
  }

  get vote_count() {
    return this._vote_count;
  }

  get genres() {
    return this._genres;
  }
}
