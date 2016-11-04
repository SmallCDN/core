const restify = require('restify');
const config = require('./config');
const Router = require('restify-routing');

const router = new Router();

const server = restify.createServer({
  name: 'SmallCDN',
});

server.use(restify.gzipResponse());

server.get('/', (req, res) => {
  res.redirect(301, 'https://smallcdn.rocks');
});

router.use('/v2', require('./versions/v2'));
router.use('/', require('./versions/v1'));

router.applyRoutes(server);

server.listen(config.port);
