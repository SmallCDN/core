const Router = require('../../Router');

const router = new Router();

const libraryMapping = require('../../libraries/mapping.json');

router.get('/ping', (req, res) => {
  res.status(204);
  res.end();
});

router.get('/ping-no-cache', (req, res) => {
  res.status(204);
  res.end();
});

router.get('/:folder', (req, res, next) => {
  let folder = req.params.folder;
  if (folder in libraryMapping) folder = libraryMapping[folder];
  return res.redirect(301, `/v2/${folder}`, next);
});

router.get('/:folder/:version', (req, res, next) => {
  let folder = req.params.folder;
  if (folder in libraryMapping) folder = libraryMapping[folder];
  return res.redirect(301, `/v2/${folder}?v=${req.params.version}`, next);
});

module.exports = router;
