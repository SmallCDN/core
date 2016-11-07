const mime = require('mime');
const semver = require('semver');
const fs = require('fs');
const resError = require('./resError');

module.exports = function getModifiedTime(res, libraries, library, file, version) {
  if (!library.info) return '';
  let date;
  try {
    date = fs.statSync(`libraries/libs/${library.name}/${version}/${file}`).mtime;
  } catch (err) {
    return resError(res, 500, { code: 6, message: 'there was an error reading from cache' });
  }
  if (!library.info.dependencies) return date;
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
      let newDate = getModifiedTime(res, libraries, depLibrary, depFile, depVersion);
      if (Date.parse(newDate) > Date.parse(date)) date = newDate;
      newDate = fs.statSync(`libraries/libs/${depLibrary.name}/${depVersion}/${depFile}`).mtime;
      if (Date.parse(newDate) > Date.parse(date)) date = newDate;
    } catch (err) {
      return resError(res, 500, { code: 6, message: 'there was an error reading from cache' });
    }
  }
  return date;
};
