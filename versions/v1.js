const fs = require('fs');
const mime = require('mime');
const semver = require('semver');

module.exports = (app) => {
  const folders = {};
  const foldersArr = fs.readdirSync('./assets');


  for (const folder of foldersArr) {
    folders[folder] = {
      contentType: mime.lookup(folder),
      files: fs.readdirSync(`./assets/${folder}`).sort(semver.compare).reverse(),
    };
  }

  app.get('/ping', (req, res) => {
    res.status(204).end();
  });

  app.get('/ping-no-cache', (req, res) => {
    res.status(204).end();
  });

  app.get('/:folder', (req, res) => {
    if (!folders[req.params.folder]) return res.status(404).json({ code: 1, message: `library '${req.params.folder}' not found` });
    const folder = folders[req.params.folder];

    res.set('X-Version', folder.files[0]);
    res.type(folder.contentType);
    res.sendFile(`${__dirname}/assets/${req.params.folder}/${folder.files[0]}`);
    return undefined;
  });

  app.get('/:folder/:version', (req, res) => {
    if (!folders[req.params.folder]) return res.status(404).json({ code: 1, message: `library '${req.params.folder}' not found` });
    if (!semver.validRange(req.params.version)) return res.status(400).json({ code: 3, message: `'${req.params.version}' is not a valid version` });
    const folder = folders[req.params.folder];
    const version = folder.files.find(e => semver.satisfies(e, req.params.version));

    if (version === undefined) return res.status(404).json({ code: 2, message: `version '${req.params.version}' not found` });

    res.set('X-Version', version);
    res.type(folder.contentType);
    res.sendFile(`${__dirname}/assets/${req.params.folder}/${version}`);
    return undefined;
  });
};
