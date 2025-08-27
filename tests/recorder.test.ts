import { test } from 'node:test';

// Recording utilities rely on Expo's audio APIs which require native
// bindings. These checks are skipped in the Node test environment.
test('recorder interactions are invoked', { skip: true }, () => {});

