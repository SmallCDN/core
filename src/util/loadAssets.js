const fs = require('fs');
const semver = require('semver');
const mime = require('mime');

module.exports = () => {
  const libraries = {};
  const caches = {};
  const updaters = {};

  for (const folder of fs.readdirSync('libraries/libs')) {
    const versions = fs.readdirSync(`libraries/libs/${folder}`).filter(v => !v.endsWith('.json'));

    versions.sort(semver.compare);
    versions.reverse();

    const final = {};
    for (const version of versions) {
      final[version] = {};
      final[version].version = version;
      final[version].files = fs.readdirSync(`libraries/libs/${folder}/${version}`);
      if (final[version].files.indexOf('library.json') < 0) {
        delete final[version];
        continue;
      }
      final[version].info = JSON.parse(fs.readFileSync(`libraries/libs/${folder}/${version}/library.json`));
    }

    const cache = {};
    for (const version of versions) {
      cache[version] = {};
      const path = `libraries/libs/${folder}/${version}/${final[version].info.index}`;
      cache[version].file = fs.readFileSync(path, 'utf8');
      cache[version].mime = mime.lookup(path);
    }

    let updater = {};

    try {
      updater = JSON.parse(fs.readFileSync(`libraries/libs/${folder}/updater.json`));
    } catch (err) {
      updater = {};
    }

    libraries[folder] = {
      versions: final,
      name: folder,
      latestVersion: final[versions[0]],
    };
    caches[folder] = cache;
    updaters[folder] = updater;
  }

  return { libraries, caches, updaters };
};
