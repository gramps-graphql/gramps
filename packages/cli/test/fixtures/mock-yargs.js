export default function mockYargsImplementation() {
  const coerce = jest.fn();
  const group = jest.fn();
  const option = jest.fn();
  const options = jest.fn();
  const mockYargs = { coerce, group, option, options, callbacks: {} };

  coerce.mockImplementation((key, cb) => {
    mockYargs.callbacks[key] = cb;
    return mockYargs;
  });

  group.mockImplementation(() => mockYargs);
  option.mockImplementation(() => mockYargs);
  options.mockImplementation(() => mockYargs);

  return mockYargs;
}
