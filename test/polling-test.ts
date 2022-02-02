let qunit = require('qunit');
let nock = require('nock');

qunit.module('add');

qunit.test('get streaming status', assert => {
  const scope = nock('https://api.github.com')
    .get('/repos/atom/atom/license')
    .reply(200, {
      license: {
        key: 'mit',
        name: 'MIT License',
        spdx_id: 'MIT',
        url: 'https://api.github.com/licenses/mit',
        node_id: 'MDc6TGljZW5zZTEz',
      },
    })
});