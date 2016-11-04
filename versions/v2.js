const fs = require('fs');
const semver = require('semver');

module.exports = (app) => {
  const libraries = {};
  const librariesArr = fs.readdirSync('./assets-v2');
  const root = `${__dirname}/../`;


  for (const folder of librariesArr) {
    const versions = fs.readdirSync(`./assets-v2/${folder}`);
    const index = versions.indexOf('library.json');

    if (index < 0) continue;
    versions.splice(index, 1).sort(semver.compare).reverse();

    const files = {};
    for (const version of versions) {
      if (version.toLowerCase() === 'library.json') continue;
      files[version] = fs.readdirSync(`./assets-v2/${folder}/${version}`);
    }

    libraries[folder] = {
      versions,
      files,
      mainfiles: JSON.parse(fs.readFileSync(`./assets-v2/${folder}/library.json`)).mainfiles,
    };
  }

  app.get('/v2/ping', (req, res) => {
    res.status(204).end();
  });

  app.get('/v2/ping-no-cache', (req, res) => {
    res.status(204).end();
  });

  app.get('/v2/:library', (req, res) => {
    if (!libraries[req.params.library]) return res.status(404).json({ code: 1, message: `library '${req.params.library}' not found` });
    if (req.query.v && !semver.validRange(req.query.v)) return res.status(400).json({ code: 3, message: `'${req.query.v}' is not a valid version.` });

    const library = libraries[req.params.library];
    const version = req.query.v
      ? library.versions.find(e => semver.satisfies(e, req.query.v))
      : library.versions[0];
    const file = library.mainfiles.find(e => library.files[version].indexOf(e) > -1);

    if (!file) return res.status(404).json({ code: 4, message: `the library '${req.params.library}' has a configuration issue, please report this to the library owner` });

    res.set('X-Version', version);
    return res.sendFile(`assets-v2/${req.params.library}/${version}/${file}`, { root });
  });

  app.get('/v2/:library/:file', (req, res) => {
    if (!libraries[req.params.library]) return res.status(404).json({ code: 1, message: `library '${req.params.library}' not found` });
    if (req.query.v && !semver.validRange(req.query.v)) return res.status(400).json({ code: 3, message: `'${req.query.v}' is not a valid version.` });
    const library = libraries[req.params.library];
    const version = req.query.v
      ? library.versions.find(e => semver.satisfies(e, req.query.v))
      : library.versions[0];

    if (!library.files[version].includes(req.params.file)) return res.status(404).json({ code: 5, message: `the file '${res.params.file}' does not exist` });

    res.set('X-Version', version);
    return res.sendFile(`assets-v2/${req.params.library}/${version}/${req.params.file}`, { root: `${__dirname}/../` });
  });
};
