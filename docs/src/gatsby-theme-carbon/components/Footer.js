import React from 'react';
import Footer from 'gatsby-theme-carbon/src/components/Footer';

const Content = () => (
  <>
    <p>Questions? Comments? Concerns?</p>
    <p>
      Open an issue on{' '}
      <a href="https://github.com/gramps-graphql/gramps/issues">GitHub</a>.
    </p>
  </>
);

const links = {
  firstCol: [
    {
      href: 'https://github.com/gramps-graphql',
      linkText: 'GitHub',
    },
  ],
  secondCol: [{ href: 'https://apollographql.com', linkText: 'Apollo' }],
};

const CustomFooter = () => <Footer links={links} Content={Content} />;

export default CustomFooter;
