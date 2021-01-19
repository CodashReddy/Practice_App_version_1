import Details from "./Details.js";
import Container from "./Container.js";

const apiKey = "66683917a94e703e14ca150023f4ea7c";

const _getData = url => {
  const paramStr = `api_key=${apiKey}`;
  return fetch(`https://api.themoviedb.org/3/${url}?${paramStr}`, {
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw "Response not okay!";
      }
      return response.json();
    })
    .catch(error => {
      console.log("Error", error);
      throw error;
    });
};

export async function _fetchDetails(type, id) {
  const details = await _getData(`${type}/${id}`);
  console.log("details", details);
  const detailObj = new Details(details, type);
  return detailObj;
}

export async function _fetchMoviesData() {
  const genres = await _genres("movie");
  const movies = await _getData("movie/popular");
  const movieContainer = new Container(movies, genres, "movie");
  return movieContainer;
}

export async function _fetchTVData() {
  const tv = await _getData("tv/popular");
  console.log("series", tv);
  const genres = await _genres("tv");
  console.log("genres", genres);
  const tvContainer = new Container(tv, genres, "tv");
  return tvContainer;
}

export async function _genres(type) {
  let genres;
  if (type === "tv") {
    genres = await _getData("genre/tv/list");
  } else {
    genres = await _getData("genre/movie/list");
  }
  return genres;
}
