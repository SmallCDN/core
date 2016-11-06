const fs = require('fs');
const mime = require('mime');
const restify = require('restify');
const Router = require('./Router');
require('dotenv').config({ path: './src/.env' });
const getDependencies = require('./getDependencies');

let libraries = require('./loadAssets.js')();

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
      fs.readFile(`libraries/libs/${library}/${version}/${file}`, 'utf8', (err, data) => {
        if (err) return res.send(500, { code: 6, message: 'there was an error reading from cache' });
        res.header('Content-Type', mime.lookup(file));
        if (libraries[library].info.dependencies && req.query.deps !== undefined) {
          return res.end(getDependencies(req, res, libraries, libraries[library], file).concat(`\n${data}`));
        }
        return res.end(data);
      });
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
