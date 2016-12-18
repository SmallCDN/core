const fs = require('fs');
const GitHub = require('github');
const semver = require('semver');
const superagent = require('superagent');
const git = require('simple-git')('./libraries');

const github = new GitHub({
  headers: {
    'User-Agent': 'SmallCDN',
  },
});

github.authenticate({
  type: 'token',
  token: process.env.GITHUB_API_KEY,
});

module.exports = async (libraries, updaters) => {
  for (const updater in updaters) {
    if (Object.keys(updaters[updater]).length === 0) continue;
    if (!updaters[updater].source.match(/github:(.+)\/(.+)#(.+)/)) continue;
    const [, owner, repo, branch] = updaters[updater].source.match(/github:(.+)\/(.+)#(.+)/);
    const raw = await github.repos.getTags({ owner, repo });
    const tags = raw.map(t => t.name.replace('v', ''));

    const versions = tags.filter((v) => {
      if (!semver.valid(v)) return false;
      if (semver.prerelease(v)) return false;
      return true;
    });

    versions.sort(semver.compare);
    versions.reverse();

    const version = versions[0];

    if (Object.keys(libraries[updater].versions).includes(version)) continue;

    fs.mkdir(`libraries/libs/${updater}/${version}`, async (error) => {
      if (error) return;

      let libraryjson;
      try {
        const r = await superagent.get(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/library.json`);
        libraryjson = r.text;
      } catch (err) {
        libraryjson = JSON.stringify(libraries[updater].latestVersion.info);
      }

      fs.writeFile(`libraries/libs/${updater}/${version}/library.json`, libraryjson, async (err) => {
        if (err) return;
        for (const file in updaters[updater].files) {
          try {
            const r = await superagent.get(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${updaters[updater].root}/${updaters[updater].files[file]}`);
            await new Promise(resolve => fs.writeFile(`libraries/libs/${updater}/${version}/${file}`, r.text, resolve));
          } catch (e) { continue; }
        }
      });
    });
  }

  git.add('.')
    .commit('Update libraries')
    .push('origin', 'master');
};
