import { MockList } from 'graphql-tools';
import casual from 'casual';

export default {
  Query: () => ({
    searchMoviesByTitle: () => new MockList([0, 10]),
  }),

  OMDB_Movie: () => ({
    Title: casual.title,
    Year: casual.year,
    imdbID: casual.uuid,
    Poster: 'https://picsum.photos/200/300',
  }),
};
