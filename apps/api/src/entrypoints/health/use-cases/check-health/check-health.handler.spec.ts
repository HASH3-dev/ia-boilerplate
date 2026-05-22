import { CheckHealthHandler } from './check-health.handler';

describe('[smoke] CheckHealthHandler', () => {
  it('handle() returns { status: "ok" }', () => {
    const handler = new CheckHealthHandler();
    expect(handler.handle()).toEqual({ status: 'ok' });
  });
});
