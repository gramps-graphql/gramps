import configureApp from '../../src/gateway/configure-app';

describe('gateway/configure-app', () => {
  it('configures Express with a GraphQL endpoint and a Playground', () => {
    const mockApp = {
      use: jest.fn(),
    };

    configureApp(mockApp, {});

    expect(mockApp.use).toHaveBeenCalledTimes(3);
  });
});
