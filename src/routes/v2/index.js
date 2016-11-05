const semver = require('semver');
const Router = require('../../Router');

let libraries = require('../../loadAssets')('v2');

const router = new Router();

router.get('/ping', (req, res) => {
  res.status(204);
  res.end();
});

router.get('/ping-no-cache', (req, res) => {
  res.status(204);
  res.end();
});

router.get('/:library', (req, res) => {
  if (req.query.apiv === '1') res.header('Warning', 'API v1 is depriciated');
  if (!libraries[req.params.library]) return res.send(404, { code: 1, message: `library '${req.params.library}' not found` });
  if (req.query.v && !semver.validRange(req.query.v)) return res.send(404, { code: 3, message: `'${req.query.v}' is not a valid version.` });

  const library = libraries[req.params.library];
  const version = req.query.v
    ? library.versions.find(e => semver.satisfies(e, req.query.v))
    : library.versions[0];
  const file = library.mainfiles.find(e => library.files[version].indexOf(e) > -1);

  if (!file) return res.send(500, { code: 4, message: `the library '${req.params.library}' has a configuration issue, please report this to the library owner` });

  res.header('X-Version', version);
  return res.sendFile(2, req.params.library, version, file);
});

router.get('/:library/:file', (req, res) => {
  if (req.query.apiv === '1') res.header('Warning', 'API v1 is depriciated');
  if (!libraries[req.params.library]) return res.send(404, { code: 1, message: `library '${req.params.library}' not found` });

  if (req.query.v && !semver.validRange(req.query.v)) return res.send(400, { code: 3, message: `'${req.query.v}' is not a valid version.` });

  const library = libraries[req.params.library];
  const version = req.query.v
    ? library.versions.find(e => semver.satisfies(e, req.query.v))
    : library.versions[0];

  if (!library.files[version].includes(req.params.file)) return res.send(404, { code: 5, message: `the file '${res.params.file}' does not exist` });

  res.header('X-Version', version);
  return res.sendFile(2, req.params.library, version, req.params.file);
});

module.exports = {
  router,
  init: () => {
    libraries = require('../../loadAssets')('v2');
  },
};
