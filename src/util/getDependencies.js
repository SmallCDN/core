const mime = require('mime');
const semver = require('semver');
const fs = require('fs');
const resError = require('./resError');

module.exports = function getDependencies(res, libraries, library, file) {
  if (!library.info) return '';
  if (!library.info.dependencies) return '';
  let data = '';
  for (const dependency of Object.keys(library.info.dependencies)) {
    if (!libraries[dependency.split('/')[0]]) return resError(res, 500, { code: 4, message: `the library '${library}' has a configuration issue, please report this to the library owner` });
    const depLibrary = libraries[dependency.split('/')[0]];

    const depVersion = library.info.dependencies[dependency]
      ? Object
        .keys(depLibrary.files)
        .find(e => semver.satisfies(e, library.info.dependencies[dependency]))
      : depLibrary.latestVersion;

    const depFile = dependency.split('/')[1]
      ? dependency.split('/')[1]
      : depLibrary.info.mainfiles.find(e => depLibrary.files[depVersion].indexOf(e) > -1);

    if (!depLibrary.files[depVersion].includes(depFile)) return resError(res, 500, { code: 4, message: `the library '${library}' has a configuration issue, please report this to the library owner` });
    if (mime.lookup(depFile) !== mime.lookup(file)) continue;
    try {
      data = data.concat(getDependencies(res, libraries, depLibrary, depFile));
      data = data.concat(`\n\n${fs.readFileSync(`libraries/libs/${dependency.split('/')[0]}/${depVersion}/${depFile}`, 'utf-8')}`);
    } catch (err) {
      return resError(res, 500, { code: 6, message: 'there was an error reading from cache' });
    }
  }
  return data.trim();
};
