import { module, test } from 'qunit';

import percySnapshot from '@percy/ember';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupSession } from 'waypoint/tests/helpers/login';
import { visit } from '@ember/test-helpers';

declare module '@percy/core' {
  interface SnapshotOptions {
    // At the time of writing, this option was missing from the published types.
    domTransformation(dom: HTMLElement): void;
  }
}

// Please use this preconfigured wrapper for percySnapshot.
async function snapshot(name: string): Promise<void> {
  await percySnapshot(name, { domTransformation });
}

// Before we send snapshots to Percy, we must move the Flight spritesheet into
// #ember-testing so that it gets serialized along with everything else. Without
// this step, icons are not rendered in Percy.
function domTransformation(dom: HTMLElement): void {
  let sandbox = dom.querySelector('#ember-testing');
  let spritesheet = dom.querySelector('svg.flight-sprite-container');

  if (sandbox && spritesheet) {
    sandbox.appendChild(spritesheet);
  }
}

module('Acceptance | Percy', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSession(hooks);

  test('empty projects list', async function (assert) {
    await visit('/default');
    await snapshot('Empty projects list');
    assert.ok(true);
  });

  test('populated projects list', async function (assert) {
    this.server.create('project', { name: 'acme-project' });
    this.server.create('project', { name: 'acme-marketing' });
    this.server.create('project', { name: 'acme-anvils' });

    await visit('/default');
    await snapshot('Populated projects list');
    assert.ok(true);
  });

  test('application list', async function (assert) {
    let project = this.server.create('project', { name: 'acme-project' });
    this.server.create('application', { name: 'acme-application', project });

    await visit('/default/acme-project/apps');
    await snapshot('Application list');
    assert.ok(true);
  });
});
