const fs = require('fs');
const semver = require('semver');
const Router = require('restify-routing');

const router = new Router();

const libraries = {};
const librariesArr = fs.readdirSync('./assets-v2');

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

router.get('/ping', (req, res) => {
  res.status(204);
  res.end();
});

router.get('/ping-no-cache', (req, res) => {
  res.status(204);
  res.end();
});

router.get('/:library', (req, res) => {
  if (!libraries[req.params.library]) return res.send(404, { code: 1, message: `library '${req.params.library}' not found` });
  if (req.query.v && !semver.validRange(req.query.v)) return res.send(404, { code: 3, message: `'${req.query.v}' is not a valid version.` });

  const library = libraries[req.params.library];
  const version = req.query.v
    ? library.versions.find(e => semver.satisfies(e, req.query.v))
    : library.versions[0];
  const file = library.mainfiles.find(e => library.files[version].indexOf(e) > -1);

  if (!file) return res.send(404, { code: 4, message: `the library '${req.params.library}' has a configuration issue, please report this to the library owner` });

  res.header('X-Version', version);
  fs.readFile(`assets-v2/${req.params.library}/${version}/${file}`, 'utf8', (err, data) => {
    res.send(data);
  });
  return undefined;
});

router.get('/:library/:file', (req, res) => {
  if (!libraries[req.params.library]) return res.send(404, { code: 1, message: `library '${req.params.library}' not found` });

  if (req.query.v && !semver.validRange(req.query.v)) return res.send(400, { code: 3, message: `'${req.query.v}' is not a valid version.` });

  const library = libraries[req.params.library];
  const version = req.query.v
    ? library.versions.find(e => semver.satisfies(e, req.query.v))
    : library.versions[0];

  if (!library.files[version].includes(req.params.file)) return res.send(404, { code: 5, message: `the file '${res.params.file}' does not exist` });

  res.header('X-Version', version);
  fs.readFile(`assets-v2/${req.params.library}/${version}/${req.params.file}`, 'utf8', (err, data) => {
    res.send(200, data);
  });
  return undefined;
});

module.exports = router;
