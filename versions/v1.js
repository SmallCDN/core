const fs = require('fs');
const mime = require('mime');
const semver = require('semver');
const Router = require('../Router');

const router = new Router();

const libraryMapping = require('../libraryMapping.json');

const folders = {};
const foldersArr = fs.readdirSync('./assets-v1');

for (const folder of foldersArr) {
  folders[folder] = {
    contentType: mime.lookup(folder),
    files: fs.readdirSync(`assets-v1/${folder}`).sort(semver.compare).reverse(),
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

router.get('/:folder', (req, res, next) => {
  let folder = req.params.folder;
  if (folder in libraryMapping) folder = libraryMapping[folder];
  return res.redirect(302, `/v2/${folder}`, next);
});

router.get('/:folder/:version', (req, res, next) => {
  let folder = req.params.folder;
  if (folder in libraryMapping) folder = libraryMapping[folder];
  return res.redirect(302, `/v2/${folder}?v=${req.params.version}`, next);
});

module.exports = router;
