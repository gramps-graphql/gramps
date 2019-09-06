/**
 * Creates a resource bundle for use with i18next, separating out
 * each data source's supported locales by locale and namespace.
 * @see https://www.i18next.com/
 *  en: {
      MyDataSource1: {
        hello: 'Hello',
      },
      MyDataSource2: {
        world: 'world',
      },
    },
    es: {
      MyDataSource1: {
        hello: 'Hola',
      },
      MyDataSource2: {
        world: 'mundo',
      }
    },
 * @param {Object[]} dataSource a GrAMPS data source
 * @returns {Object} an i18next compatible resource bundle
 */
const preparei18nextResources = dataSources => {
  const dataSourcesWithLocales = dataSources.filter(
    dataSource => dataSource.locales,
  );

  // Retrieve a list of language codes from each data source
  const languages = dataSourcesWithLocales.reduce((languages, dataSource) => {
    const uniqueLanguages = [];

    Object.keys(dataSource.locales).forEach(locale => {
      if (!languages.includes(locale)) {
        uniqueLanguages.push(locale);
      }
    });

    return [...languages, ...uniqueLanguages];
  }, []);

  const resources = languages.reduce((allLanguages, language) => {
    const locales = dataSourcesWithLocales.reduce(
      (allDataSourceLocales, dataSource) => ({
        ...allDataSourceLocales,
        [dataSource.namespace]: {
          ...dataSource.locales[language],
        },
      }),
      {},
    );

    return {
      ...allLanguages,
      [language]: locales,
    };
  }, {});

  return resources;
};

export default preparei18nextResources;
