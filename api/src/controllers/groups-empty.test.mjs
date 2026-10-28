import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

// Exercise the actual route without loading database and payment integrations.
const source = readFileSync(new URL('./users.controller.js', import.meta.url), 'utf8');
const start = source.indexOf("router.get('/user/groups',");
const route = source.slice(start, source.indexOf('\n});', start) + 4);

async function request(groups, tags, organizationId) {
  let handler;
  let body;
  let status;
  const calls = [];
  vm.runInNewContext(route, {
    router: { get: (_path, callback) => { handler = callback; } },
    getGroupsById: async (...args) => { calls.push(args); return groups; },
    getTagsByUserId: async (...args) => { calls.push(args); return tags; },
  });
  await handler({ userId: 'user-1', organizationId }, {
    status(code) { status = code; return this; },
    json(value) { body = JSON.parse(JSON.stringify(value)); },
  }, error => { throw error; });
  assert.equal(status, 200);
  assert.deepEqual(calls, [['user-1', organizationId], ['user-1', organizationId]]);
  return body;
}

const group = { _id: 'group-1', toObject: () => ({ _id: 'group-1', name: 'Work' }) };
const groups = new Map([['group-1', group]]);

test('no groups or tags is a successful empty response', async () => {
  assert.deepEqual(await request(undefined, undefined), [{ tags: [] }]);
});

test('groups without tags remain visible', async () => {
  assert.deepEqual(await request(groups, undefined), [
    { _id: 'group-1', name: 'Work', tags: [] }, { tags: [] },
  ]);
});

test('ungrouped tags remain visible without groups', async () => {
  const tag = { _id: 'tag-1', name: 'General' };
  assert.deepEqual(await request(undefined, new Map([['tag-1', tag]])), [{ tags: [tag] }]);
});

test('organization groups preserve grouped and ungrouped tags', async () => {
  const grouped = { _id: 'tag-1', group: 'group-1' };
  const ungrouped = { _id: 'tag-2' };
  assert.deepEqual(await request(groups, new Map([['tag-1', grouped], ['tag-2', ungrouped]]), 'org-1'), [
    { _id: 'group-1', name: 'Work', tags: [grouped] }, { tags: [ungrouped] },
  ]);
});

test('database errors are forwarded rather than hidden as empty data', async () => {
  let handler;
  const failure = new Error('database unavailable');
  vm.runInNewContext(route, {
    router: { get: (_path, callback) => { handler = callback; } },
    getGroupsById: async () => { throw failure; },
  });
  let forwarded;
  await handler({ userId: 'user-1' }, {}, error => { forwarded = error; });
  assert.equal(forwarded, failure);
});
