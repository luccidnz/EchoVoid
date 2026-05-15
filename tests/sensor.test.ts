import { test } from 'node:test';

// Expo sensor modules rely on native bindings that are unavailable in this
// environment. The check is skipped to prevent test failures when run in Node.
test('sensor listeners are exposed', { skip: true }, () => {});

