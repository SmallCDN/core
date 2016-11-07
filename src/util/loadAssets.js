const fs = require('fs');
const semver = require('semver');
const mime = require('mime');

module.exports = () => {
  const libraries = {};

  for (const folder of fs.readdirSync('libraries/libs')) {
    const versions = fs.readdirSync(`libraries/libs/${folder}`);

    versions.sort(semver.compare);
    versions.reverse();

    const final = {};
    for (const version of versions) {
      final[version] = {};
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
      cache[version].file = fs.readFileSync(path);
      cache[version].mime = mime.lookup(path);
    }

    libraries[folder] = {
      versions: final,
      name: folder,
      latestVersion: versions[0],
      cache,
    };
  }

  return libraries;
};
