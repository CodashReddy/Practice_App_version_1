export default class Details {
  constructor(obj, type) {
    this._type = type;
    this._adult = obj.adult;
    this._backdrop_path = obj.backdrop_path;
    this._budget = obj.budget;
    this._homepage = obj.homepage;
    this._id = obj.id;
    this._imdb_id = obj.imdb_id;
    this._original_language = obj.original_language;
    this._original_title = obj.original_title;
    this._overview = obj.overview;
    this._popularity = obj.popularity;
    this._poster_path = obj.poster_path;
    this._release_date = obj.release_date;
    this._status = obj.status;
    this._tagline = obj.tagline;
    this._title = obj.title;
    this._video = obj.video;
    this._vote_count = obj.vote_count;
    this._vote_average = obj.vote_average;
    this._genres = obj.genres.map(genre => {
      return genre.name;
    });
    this._name = obj.name;
    this._original_name = obj.original_name;
    this._num_of_episode = obj.number_of_episodes;
    this._num_of_seasons = obj.number_of_seasons;
    this._first_air_date = obj.first_air_date;
  }

  get type() {
    return this._type;
  }

  get num_of_episode() {
    return this._num_of_episode;
  }

  get first_air_date() {
    return this._first_air_date;
  }

  get original_name() {
    return this._original_name;
  }

  get name() {
    return this._name;
  }

  get num_of_seasons() {
    return this._num_of_seasons;
  }

  get genres() {
    return this._genres;
  }

  get vote_average() {
    return this._vote_average;
  }

  get vote_count() {
    return this._vote_count;
  }
  get video() {
    return this._video;
  }
  get title() {
    return this._title;
  }
  get tagline() {
    return this._tagline;
  }
  get status() {
    return this._status;
  }

  get release_date() {
    return this._release_date;
  }
  get poster_path() {
    return this._poster_path;
  }
  get backdrop_path() {
    return this._backdrop_path;
  }
  get id() {
    return this._id;
  }
  get imdb_id() {
    return this._imdb_id;
  }

  get popularity() {
    return this._popularity;
  }

  get overview() {
    return this._overview;
  }
  get original_title() {
    return this._original_title;
  }
  get original_language() {
    return this._original_language;
  }
  get homepage() {
    return this._homepage;
  }
  get budget() {
    return this._budget;
  }
  get adult() {
    return this._adult;
  }
}
