const fs = require('fs');
const semver = require('semver');

module.exports = () => {
  const libraries = {};

  for (const folder of fs.readdirSync('./assets')) {
    const versions = fs.readdirSync(`./assets/${folder}`);
    const index = versions.indexOf('library.json');

    if (index < 0) continue;
    versions.splice(index, 1).sort(semver.compare).reverse();

    const files = {};
    for (const version of versions) {
      if (version.toLowerCase() === 'library.json') continue;
      files[version] = fs.readdirSync(`./assets/${folder}/${version}`);
    }

    libraries[folder] = {
      versions,
      files,
      mainfiles: JSON.parse(fs.readFileSync(`./assets/${folder}/library.json`)).mainfiles,
    };
  }

  return libraries;
};
