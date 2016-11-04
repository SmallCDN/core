const fs = require('fs');
const config = require('./config');
const restify = require('restify');
const Router = require('./Router');

const router = new Router();

const server = restify.createServer({
  name: 'SmallCDN',
});

server.use(restify.gzipResponse());

server.use((req, res, next) => {
  res.sendFile = (path, status = 200, encoding = 'utf8') => { // eslint-disable-line
    fs.readFile(path, encoding, (err, data) => {
      if (err) return res.send(500, { code: 500, message: err.message });
      return res.end(data);
    });
  };
  return next();
});

server.get('/', (req, res, next) => {
  res.redirect(301, 'https://smallcdn.rocks', next);
});

router.use('/v2', require('./versions/v2'));
router.use('/', require('./versions/v1'));

router.applyRoutes(server);

server.listen(config.port);
