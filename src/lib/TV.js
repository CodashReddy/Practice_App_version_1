export default class TV {
  constructor(obj, genres) {
    this._backdrop_path = obj.backdrop_path;
    this._id = obj.id;
    this._name = obj.name;
    this._origin_country = obj.origin_country;
    this._original_language = obj.original_language;
    this._original_name = obj.original_name;
    this._overview = obj.overview;
    this._popularity = obj.popularity;
    this._poster_path = obj.poster_path;
    this._vote_average = obj.vote_average;
    this._vote_count = obj.vote_count;
    this._genres = obj.genre_ids.map(id => {
      const filtered = genres.genres.find(genre => {
        return genre.id === id;
      });
      let output = filtered === undefined ? "fake" : filtered.name;
      return output;
    });
  }

  get type() {
    return "tv";
  }

  get genres() {
    return this._genres;
  }

  get overview() {
    return this._overview;
  }

  get original_name() {
    return this._original_name;
  }

  get original_language() {
    return this._original_language;
  }

  get origin_country() {
    return this._origin_country;
  }

  get backdrop_path() {
    return this._backdrop_path;
  }

  get genre_ids() {
    return this._genre_ids;
  }

  get name() {
    return this._name;
  }

  get vote_average() {
    return this._vote_average;
  }

  get vote_count() {
    return this._vote_count;
  }

  get popularity() {
    return this._popularity;
  }

  get poster_path() {
    return this._poster_path;
  }

  get id() {
    return this._id;
  }
}
