export default {
  Query: {
    searchMoviesByTitle: (rootValue, { title, apiKey }, context) =>
      context.model.searchMoviesByTitle({ title, apiKey }),
  },
};
