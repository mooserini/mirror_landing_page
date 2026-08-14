const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  parseProjectManifest,
  projectLines
} = require('../assets/projects-core.v1.js');

const fallback = [
  'CURRENT THREADS',
  '  - static fallback'
];

function validManifest(overrides = {}) {
  return {
    schemaVersion: 1,
    owner: 'Tom Kenny',
    updated: '2026-08-13',
    work: [
      {
        name: 'The Resonant Mirror',
        blurb: 'CRT landing page.',
        status: 'live',
        url: 'https://www.getadongle.com'
      },
      {
        name: 'Vesper',
        blurb: 'Living weather experiment.',
        status: 'in-beta',
        url: ''
      }
    ],
    links: [
      {
        label: 'Linktree',
        url: 'https://linktr.ee/mooserini'
      }
    ],
    ...overrides
  };
}

test('parseProjectManifest accepts schema version 1 and preserves public fields', () => {
  const parsed = parseProjectManifest(validManifest());

  assert.equal(parsed.schemaVersion, 1);
  assert.equal(parsed.work.length, 2);
  assert.equal(parsed.work[0].name, 'The Resonant Mirror');
  assert.equal(parsed.links[0].label, 'Linktree');
});

test('parseProjectManifest rejects unsupported schemas and malformed work arrays', () => {
  assert.equal(parseProjectManifest(validManifest({ schemaVersion: 2 })), null);
  assert.equal(parseProjectManifest(validManifest({ work: 'not-an-array' })), null);
  assert.equal(parseProjectManifest(null), null);
});

test('parseProjectManifest drops unsafe URLs without dropping otherwise valid items', () => {
  const parsed = parseProjectManifest(validManifest({
    work: [{ name: 'Safe name', blurb: 'Safe copy', status: 'live', url: 'javascript:alert(1)' }],
    links: [{ label: 'Bad link', url: 'file:///etc/passwd' }]
  }));

  assert.equal(parsed.work[0].url, '');
  assert.deepEqual(parsed.links, []);
});

test('parseProjectManifest rejects actionable private or credential-bearing URLs', () => {
  const rejected = [
    'https://user:pass@example.com/path',
    'http://127.0.0.1/admin',
    'https://100.100.100.100/model',
    'https://uncle-russet.local/status',
    'https://node.example.com:8443/admin',
    'https://example.com/path?token=secret',
    'https://example.com/line\nnext'
  ];

  for(const url of rejected){
    const parsed = parseProjectManifest(validManifest({
      work: [{ name:'Safe name', blurb:'Safe copy', status:'live', url }],
      links: [{ label:'Unsafe link', url }]
    }));
    assert.equal(parsed.work[0].url, '', url);
    assert.deepEqual(parsed.links, [], url);
  }
});

test('projectLines renders work and includes Links only when populated', () => {
  const parsed = parseProjectManifest(validManifest());
  const lines = projectLines(parsed, fallback);

  assert.deepEqual(lines, [
    'CURRENT THREADS',
    '  [live] The Resonant Mirror',
    '    CRT landing page.',
    '    https://www.getadongle.com',
    '  [in-beta] Vesper',
    '    Living weather experiment.',
    '',
    'LINKS',
    '  Linktree',
    '    https://linktr.ee/mooserini'
  ]);

  const withoutLinks = projectLines(
    parseProjectManifest(validManifest({ links: [] })),
    fallback
  );
  assert.equal(withoutLinks.includes('LINKS'), false);
});

test('projectLines returns an independent static fallback for absent or empty manifests', () => {
  const absent = projectLines(null, fallback);
  const empty = projectLines(parseProjectManifest(validManifest({ work: [] })), fallback);

  assert.deepEqual(absent, fallback);
  assert.deepEqual(empty, fallback);
  assert.notEqual(absent, fallback);
});

test('index loads and consumes the validated manifest with a static fallback', () => {
  const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const coreScript = '<script src="/assets/projects-core.v1.js"></script>';
  const inlineScript = '<script>\n(function(){';

  assert.ok(index.includes(coreScript));
  assert.ok(index.indexOf(coreScript) < index.indexOf(inlineScript));
  assert.match(index, /fetch\('\/assets\/projects\.json',\s*\{cache:'no-cache'\}\)/);
  assert.match(index, /ResonantProjects\.parseProjectManifest/);
  assert.match(index, /ResonantProjects\.projectLines\(projectManifest, STATIC_WORK_LINES\)/);
  assert.match(index, /typeof projectsApi\.projectLines!=='function'/);
  assert.match(index, /catch\(_error\)\{ return STATIC_WORK_LINES\.slice\(\); \}/);
});

test('canonical projects.json keeps the deliberate public project boundary', () => {
  const raw = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'assets', 'projects.json'), 'utf8')
  );
  const parsed = parseProjectManifest(raw);
  const names = parsed.work.map(item => item.name);

  assert.equal(parsed.schemaVersion, 1);
  assert.ok(names.includes('The Resonant Mirror'));
  assert.ok(names.includes('Vesper'));
  assert.ok(names.includes('Dual-build agent research'));
  assert.ok(names.includes('Tailnet-routed local inference'));
  assert.equal(
    parsed.work.find(item => item.name === 'Vesper').url,
    'https://vesper-real-weather-lab.pages.dev/'
  );
  assert.equal(parsed.links[0].url, 'https://linktr.ee/Resonantmirror');
});
