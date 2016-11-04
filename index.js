const fs = require('fs');
const config = require('./config.json');
const restify = require('restify');
const Router = require('./Router');

function main() {
  const router = new Router();

  const server = restify.createServer({
    name: 'SmallCDN',
  });

  server.use(restify.gzipResponse());

  server.use((req, res, next) => {
    res.sendFile = (v, library, version, file) => { // eslint-disable-line
      fs.readFile(`libraries/v${v}/${library}/${version}/${file}`, 'utf8', (err, data) => {
        if (err) return res.send(500, { code: 6, message: 'there was an error reading from cache' });
        return res.end(data);
      });
    };
    return next();
  });

  router.use('/', require('./routes')); // this one is always first
  router.use('/gh', require('./routes/github'));

  router.use('/v2', require('./routes/v2')); // then the other versions in decending order
  router.use('/', require('./routes/v1')); // default version gets mounted at root

  router.applyRoutes(server);

  server.listen(config.port, () => {
    console.log(server.name, server.address().family, `${server.address().address}:${server.address().port}`); // eslint-disable-line
  });
}

fs.readdir('./libraries', (err) => {
  if (err) {
    require('simple-git')('./').clone('https://github.com/SmallCDN/libraries.git', './libraries', {}, (error) => {
      if (error) throw error;
      main();
    });
  } else {
    require('simple-git')('./libraries').pull((error) => {
      if (error) throw error;
      main();
    });
  }
});
