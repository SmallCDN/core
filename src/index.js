const fs = require('fs');
const mime = require('mime');
const semver = require('semver');
const restify = require('restify');
const Router = require('./Router');

require('dotenv').config({ path: './src/.env' });

let libraries = require('./loadAssets.js')();

function getDependencies(req, res, library, file) {
  if (!library.info.dependencies) return '';
  let data = '';
  for (const dependency of Object.keys(library.info.dependencies)) {
    if (!libraries[dependency.split('/')[0]]) return res.send(500, { code: 4, message: `the library '${library}' has a configuration issue, please report this to the library owner` });
    const depLibrary = libraries[dependency.split('/')[0]];

    const depVersion = library.info.dependencies[dependency]
      ? Object
        .keys(depLibrary.files)
        .find(e => semver.satisfies(e, library.info.dependencies[dependency]))
      : depLibrary.latestVersion;

    const depFile = dependency.split('/')[1]
      ? dependency.split('/')[1]
      : depLibrary.info.mainfiles.find(e => depLibrary.files[depVersion].indexOf(e) > -1);

    if (!depLibrary.files[depVersion].includes(depFile)) return res.send(500, { code: 4, message: `the library '${library}' has a configuration issue, please report this to the library owner` });
    if (mime.lookup(depFile) !== mime.lookup(file)) continue;
    try {
      data = data.concat(getDependencies(req, res, depLibrary, depFile));
      data = data.concat(`\n${fs.readFileSync(`libraries/libs/${dependency.split('/')[0]}/${depVersion}/${depFile}`, 'utf-8')}`);
    } catch (err) {
      throw err;
    }
  }
  return data.trim();
}

function main(error) {
  if (error) throw error;

  const router = new Router();

  const server = restify.createServer({
    name: 'SmallCDN',
  });

  server.use(restify.gzipResponse());
  server.use(restify.bodyParser({ mapParams: false }));
  server.use(restify.queryParser());

  server.use((req, res, next) => {
    res.sendFile = (library, version, file) => { // eslint-disable-line
      if (libraries[library].info.dependencies && req.query['no-deps'] === undefined) {
        fs.readFile(`libraries/libs/${library}/${version}/${file}`, 'utf8', (err, data) => {
          if (err) return res.send(500, { code: 6, message: 'there was an error reading from cache' });
          res.header('Content-Type', mime.lookup(file));
          return res.end(getDependencies(req, res, libraries[library], file).concat(`\n${data}`));
        });
      } else {
        fs.readFile(`libraries/libs/${library}/${version}/${file}`, 'utf8', (err, data) => {
          if (err) return res.send(500, { code: 6, message: 'there was an error reading from cache' });
          res.header('Content-Type', mime.lookup(file));
          return res.end(data);
        });
      }
    };
    return next();
  });

  const v2 = require('./routes/v2');
  const api = require('./routes/api');

  router.use('/', require('./routes')); // this one is always first
  router.use('/gh', require('./routes/github')(v2, api, () => {
    libraries = require('./loadAssets')();
  }));
  router.use('/api', api.router);

  router.use('/', v2.router); // default version gets mounted at root

  router.applyRoutes(server);

  server.listen(process.env.PORT, () => {
    console.log(server.name, server.address().family, `${server.address().address}:${server.address().port}`); // eslint-disable-line
  });
}

fs.readdir('./libraries', (err) => {
  if (err) {
    require('simple-git')('./').clone(process.env.LIBRARY_GITHUB_REPO, './libraries', {}, main);
  } else {
    require('simple-git')('./libraries').pull(main);
  }
});
