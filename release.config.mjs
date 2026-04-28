const releaseAssets = ['CHANGELOG.md', 'package.json', 'package-lock.json'];

/** @type {import('semantic-release').GlobalConfig} */
export default {
  branches: ['main'],
  tagFormat: 'v${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [{ type: 'chore', scope: 'deps', release: 'patch' }],
      },
    ],
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: releaseAssets,
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/github',
    [
      '@semantic-release/exec',
      {
        successCmd: "printf '%s' '${nextRelease.version}' > .semantic-release-version",
      },
    ],
  ],
};
