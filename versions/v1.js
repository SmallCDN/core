const fs = require('fs');
const mime = require('mime');
const semver = require('semver');
const Router = require('restify-routing');

const router = new Router();

const folders = {};
const foldersArr = fs.readdirSync('./assets');

for (const folder of foldersArr) {
  folders[folder] = {
    contentType: mime.lookup(folder),
    files: fs.readdirSync(`./assets/${folder}`).sort(semver.compare).reverse(),
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

router.get('/:folder', (req, res) => {
  if (!folders[req.params.folder]) {
    res.status(404);
    return res.send({ code: 1, message: `library '${req.params.folder}' not found` });
  }
  const folder = folders[req.params.folder];

  res.header('X-Version', folder.files[0]);
  res.header('Content-Type', folder.contentType);
  fs.readFile(`${__dirname}/../assets/${req.params.folder}/${folder.files[0]}`, 'utf8', (err, file) => {
    res.send(file);
  });
  return undefined;
});

router.get('/:folder/:version', (req, res) => {
  if (!folders[req.params.folder]) {
    res.status(404);
    return res.send({ code: 1, message: `library '${req.params.folder}' not found` });
  }
  if (!semver.validRange(req.params.version)) {
    res.status(400);
    return res.send({ code: 3, message: `'${req.params.version}' is not a valid version` });
  }
  const folder = folders[req.params.folder];
  const version = folder.files.find(e => semver.satisfies(e, req.params.version));

  if (version === undefined) {
    res.status(404);
    return res.send({ code: 2, message: `version '${req.params.version}' not found` });
  }

  res.header('X-Version', version);
  res.header('Content-Type', folder.contentType);
  fs.readFile(`${__dirname}/../assets/${req.params.folder}/${version}`, 'utf8', (err, file) => {
    res.send(file);
  });
  return undefined;
});

module.exports = router;
