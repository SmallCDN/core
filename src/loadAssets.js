const fs = require('fs');
const semver = require('semver');

module.exports = () => {
  const libraries = {};

  for (const folder of fs.readdirSync('./libraries/libs')) {
    const versions = fs.readdirSync(`./libraries/libs/${folder}`);
    const index = versions.indexOf('library.json');

    if (index < 0) continue;
    versions.splice(index, 1).sort(semver.compare);
    versions.reverse();

    const files = {};
    for (const version of versions) {
      if (version.toLowerCase() === 'library.json') continue;
      files[version] = fs.readdirSync(`./libraries/libs/${folder}/${version}`);
    }

    libraries[folder] = {
      versions,
      files,
      mainfiles: JSON.parse(fs.readFileSync(`./libraries/libs/${folder}/library.json`)).mainfiles,
    };
  }

  return libraries;
};
