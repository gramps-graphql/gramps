module.exports = {
  siteMetadata: {
    title: 'GrAMPS',
    description: 'Composable, Shareable Data Sources for GraphQL',
    keywords:
      'gramps,graphql-server,apollographql,apollo-server-express,graphql,graphql-schema,microservices-architecture,microservices',
  },
  plugins: [
    'gatsby-theme-carbon',
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'UA-149279329-1',
      },
    },
  ],
};
