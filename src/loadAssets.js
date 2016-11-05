const fs = require('fs');
const semver = require('semver');

module.exports = (v) => {
  const libraries = {};

  for (const folder of fs.readdirSync(`./libraries/${v}`)) {
    const versions = fs.readdirSync(`./libraries/${v}/${folder}`);
    const index = versions.indexOf('library.json');

    if (index < 0) continue;
    versions.splice(index, 1).sort(semver.compare);
    versions.reverse();

    const files = {};
    for (const version of versions) {
      if (version.toLowerCase() === 'library.json') continue;
      files[version] = fs.readdirSync(`./libraries/${v}/${folder}/${version}`);
    }

    libraries[folder] = {
      versions,
      files,
      mainfiles: JSON.parse(fs.readFileSync(`./libraries/${v}/${folder}/library.json`)).mainfiles,
    };
  }

  return libraries;
};
