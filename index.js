const fs = require('fs');
const config = require('./config.json');
const restify = require('restify');
const Router = require('./Router');

const router = new Router();

const server = restify.createServer({
  name: 'SmallCDN',
});

server.use(restify.gzipResponse());

server.use((req, res, next) => {
  res.sendFile = (v, library, version, file) => { // eslint-disable-line
    fs.readFile(`assets/v${v}/${library}/${version}/${file}`, 'utf8', (err, data) => {
      if (err) return res.send(500, { code: 6, message: "there was an error reading from disk" });
      return res.end(data);
    });
  };
  return next();
});

server.get('/', (req, res, next) => {
  res.redirect(301, 'https://smallcdn.rocks', next);
});

router.use('/v2', require('./routes/v2'));
router.use('/', require('./routes/v1'));

router.applyRoutes(server);

server.listen(config.port);
