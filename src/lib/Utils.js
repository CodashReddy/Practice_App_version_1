export const getImageURL = (path, width = 200) => {
  return `//image.tmdb.org/t/p/w${width}${path}`;
};
