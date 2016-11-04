const fs = require('fs');
const config = require('./config');
const restify = require('restify');
const Router = require('restify-routing');

const router = new Router();

const server = restify.createServer({
  name: 'SmallCDN',
});

server.use(restify.gzipResponse());

server.use((req, res, next) => {
  res.sendFile = (path, status = 200, encoding = 'utf8') => { // eslint-disable-line
    fs.readFile(path, encoding, (err, data) => {
      res.send(status, data);
    });
  };
  return next();
});

server.get('/', (req, res) => {
  res.redirect(301, 'https://smallcdn.rocks');
});

router.use('/v2', require('./versions/v2'));
router.use('/', require('./versions/v1'));

router.applyRoutes(server);

server.listen(config.port);
