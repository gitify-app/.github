import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const workflow = readFileSync(
  new URL('../.github/workflows/zizmor.yml', import.meta.url),
  'utf8',
);

function expressionFor(key) {
  const match = workflow.match(
    new RegExp(`^\\s+${key}: \\$\\{\\{ (.+) \\}\\}$`, 'm'),
  );
  assert.ok(match, `Missing expression for ${key}`);
  return match[1];
}

// These expressions use only boolean inputs, string comparisons, and &&/||,
// whose behavior matches JavaScript for the concrete values in these tests.
// Evaluate the actual workflow expression, not a separately copied condition.
function reportingMode(advancedSecurity, eventName, headRepository) {
  const context = {
    inputs: { 'advanced-security': advancedSecurity },
    github: {
      event_name: eventName,
      repository: 'gitify-app/website',
      event: eventName === 'pull_request'
        ? { pull_request: { head: { repo: { full_name: headRepository } } } }
        : {},
    },
  };
  const upload = runInNewContext(
    expressionFor('ZIZMOR_ADVANCED_SECURITY').replaceAll(
      'inputs.advanced-security',
      'inputs["advanced-security"]',
    ),
    context,
    { timeout: 1000 },
  );
  context.env = { ZIZMOR_ADVANCED_SECURITY: String(upload) };
  return {
    upload: runInNewContext(expressionFor('advanced-security'), context),
    annotations: runInNewContext(expressionFor('annotations'), context),
  };
}

for (const [name, enabled, event, head, upload] of [
  ['push with uploads enabled', true, 'push', undefined, true],
  ['same-repository PR with uploads enabled', true, 'pull_request', 'gitify-app/website', true],
  ['fork PR with uploads enabled', true, 'pull_request', 'contributor/website', false],
  ['push with uploads disabled', false, 'push', undefined, false],
  ['same-repository PR with uploads disabled', false, 'pull_request', 'gitify-app/website', false],
  ['fork PR with uploads disabled', false, 'pull_request', 'contributor/website', false],
  ['PR with unavailable head repository', true, 'pull_request', '', false],
]) {
  test(name, () => {
    assert.deepEqual(reportingMode(enabled, event, head), {
      upload: String(upload),
      annotations: !upload,
    });
  });
}

test('provider exposes a boolean upload input, enabled by default', () => {
  assert.match(workflow, /workflow_call:/);
  assert.match(workflow, /advanced-security:\n(?:[^\n]*\n)*?\s+type: boolean\n\s+default: true/);
});

test('provider inherits caller-scoped permissions without requesting elevation', () => {
  assert.doesNotMatch(workflow, /^\s*permissions:/m);
  assert.doesNotMatch(workflow, /^\s*secrets:/m);
  assert.doesNotMatch(workflow, /pull_request_target:/);
});

test('provider pins actions and does not persist checkout credentials', () => {
  const actions = [...workflow.matchAll(/^\s+uses: (.+)$/gm)];
  assert.equal(actions.length, 2);
  for (const [, action] of actions) {
    assert.match(action, /^[\w./-]+@[a-f0-9]{40}(?:\s+#.*)?$/);
  }
  assert.match(workflow, /persist-credentials: false/);
});

test('provider only scans: no consumer scripts, custom config, or swallowed errors', () => {
  assert.doesNotMatch(workflow, /^\s+(?:run|config|continue-on-error):/m);
});

test('SARIF caller fixture grants exactly the documented permissions', () => {
  const fixture = readFileSync(new URL('./fixtures/sarif-caller.yml', import.meta.url), 'utf8');
  assert.match(fixture, /^permissions: \{\}$/m);
  assert.match(fixture, /    permissions:\n      contents: read\n      actions: read\n      security-events: write\n/);
  assert.match(fixture, /uses: \.\/\.github\/workflows\/zizmor.yml/);
});

test('annotation caller fixture needs only read access and disables uploads', () => {
  const fixture = readFileSync(new URL('./fixtures/annotations-caller.yml', import.meta.url), 'utf8');
  assert.match(fixture, /^permissions: \{\}$/m);
  assert.match(fixture, /    permissions:\n      contents: read\n(?:    #.*\n)*    uses:/);
  assert.doesNotMatch(fixture, /security-events:|actions: read/);
  assert.match(fixture, /advanced-security: false/);
});
