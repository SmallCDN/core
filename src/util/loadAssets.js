const fs = require('fs');
const semver = require('semver');

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

    libraries[folder] = {
      versions: final,
      name: folder,
      latestVersion: versions[0],
    };
  }

  return libraries;
};
